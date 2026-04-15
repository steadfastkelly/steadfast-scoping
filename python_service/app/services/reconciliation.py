from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd
from rapidfuzz import fuzz, process

DATE_WINDOW_DAYS = 60
FUZZY_THRESHOLD = 85


@dataclass
class ReconcileSummary:
  rows_processed: int
  matched_records: int
  unmatched_records: int
  discrepancy_records: int
  avg_match_score: float
  match_rate: float
  discrepancy_rate: float
  unmatched_rate: float
  risk_status: str
  leadership_alerts: list[str] = field(default_factory=list)
  output_path: str = ''


def normalize_customer(name):
  if pd.isna(name):
    return ''

  value = str(name).lower()
  value = re.sub(r'[^\w\s]', '', value)
  value = re.sub(r'\s+', ' ', value).strip()
  return value


def clean_invoice_number(value):
  if pd.isna(value):
    return None

  cleaned = str(value).strip()
  return cleaned or None


def parse_amount(value):
  if pd.isna(value):
    return 0.0

  return float(str(value).replace('$', '').replace(',', '').strip())


def load_data(file_path: str):
  workbook = pd.ExcelFile(file_path)

  payments = workbook.parse('Payments')
  invoices = workbook.parse('Invoices')
  projects = workbook.parse('Projects')

  return payments, invoices, projects


def normalize_data(payments: pd.DataFrame, invoices: pd.DataFrame):
  invoices = invoices.copy()
  payments = payments.copy()

  invoices['invoice_number'] = invoices['Invoice#'].apply(clean_invoice_number)
  invoices['customer_normalized'] = invoices['Customer Name'].apply(normalize_customer)
  invoices['invoice_total'] = invoices['Total'].apply(parse_amount)
  invoices['invoice_date'] = pd.to_datetime(invoices['Invoice Date'], errors='coerce')

  payments['payment_number'] = payments['Payment ID']
  payments['customer_normalized'] = payments['Customer Name'].apply(normalize_customer)
  payments['amount_paid'] = payments['Amount'].apply(parse_amount)
  payments['payment_date'] = pd.to_datetime(payments['Payment Date'], errors='coerce')

  return payments, invoices


def explode_invoices(payments: pd.DataFrame):
  exploded = payments.copy()
  exploded['invoice_list'] = exploded['Invoice#'].fillna('').astype(str).str.split(',')
  exploded = exploded.explode('invoice_list')
  exploded['invoice_number'] = exploded['invoice_list'].apply(clean_invoice_number)

  return exploded.drop(columns=['invoice_list'])


def level_1_match(df: pd.DataFrame, invoices: pd.DataFrame):
  merged = df.merge(
    invoices,
    on='invoice_number',
    how='left',
    suffixes=('', '_inv'),
  )

  merged['level_1_match'] = merged['amount_paid'] == merged['invoice_total']
  return merged


def level_2_match(df: pd.DataFrame):
  grouped = (
    df.groupby('payment_number')
    .agg({'invoice_total': 'sum', 'amount_paid': 'first'})
    .reset_index()
  )

  grouped['level_2_match'] = grouped['invoice_total'] == grouped['amount_paid']

  return df.merge(grouped[['payment_number', 'level_2_match']], on='payment_number')


def level_3_match(df: pd.DataFrame, invoices: pd.DataFrame):
  unmatched = df[df['invoice_number'].isna()].copy()

  invoice_names = invoices['customer_normalized'].fillna('').tolist()
  matches: list[tuple[int, str]] = []

  for idx, row in unmatched.iterrows():
    query_name = row.get('customer_normalized', '')
    if not query_name:
      continue

    result = process.extractOne(query_name, invoice_names, scorer=fuzz.token_sort_ratio)

    if not result:
      continue

    _, score, invoice_idx = result
    if score < FUZZY_THRESHOLD:
      continue

    candidate = invoices.iloc[invoice_idx]

    payment_date = row.get('payment_date')
    invoice_date = candidate.get('invoice_date')
    if pd.isna(payment_date) or pd.isna(invoice_date):
      continue

    date_diff = abs((payment_date - invoice_date).days)
    if date_diff <= DATE_WINDOW_DAYS:
      matches.append((idx, candidate['invoice_number']))

  for idx, invoice_number in matches:
    df.loc[idx, 'invoice_number'] = invoice_number

  return df


def calculate_score(row):
  score = 0

  if pd.notna(row.get('invoice_number')):
    score += 60

  if abs(row.get('amount_paid', 0) - row.get('invoice_total', 0)) < 0.01:
    score += 20

  if row.get('customer_normalized', '') == row.get('customer_normalized_inv', ''):
    score += 10

  payment_date = row.get('payment_date')
  invoice_date = row.get('invoice_date')
  if pd.notna(payment_date) and pd.notna(invoice_date):
    date_diff = abs((payment_date - invoice_date).days)
    if date_diff <= DATE_WINDOW_DAYS:
      score += 10

  return score


def classify(df: pd.DataFrame):
  result = df.copy()
  result['match_score'] = result.apply(calculate_score, axis=1)

  def classify_level(row):
    if row['match_score'] >= 90:
      return 1
    if row['match_score'] >= 70:
      return 2
    if row['match_score'] >= 50:
      return 3
    return 4

  result['match_level'] = result.apply(classify_level, axis=1)

  result['variance'] = result['amount_paid'] - result.get('invoice_total', 0)

  def flag(row):
    if pd.isna(row.get('invoice_number')):
      return 'UNMATCHED'
    if abs(row.get('variance', 0)) > 0.01:
      return 'DISCREPANCY'
    return 'OK'

  result['flag'] = result.apply(flag, axis=1)
  return result


def build_leadership_alerts(match_rate: float, discrepancy_rate: float, unmatched_rate: float) -> list[str]:
  alerts: list[str] = []

  if match_rate < 0.8:
    alerts.append('Confidence is below 80%. Pause executive reporting until mapping is reviewed.')

  if discrepancy_rate > 0.1:
    alerts.append('Discrepancies exceed 10% of payments. Audit invoice totals before invoicing cycle closes.')

  if unmatched_rate > 0.05:
    alerts.append('Unmatched payments exceed 5%. Assign finance owner for manual reconciliation.')

  if not alerts:
    alerts.append('Reconciliation quality is stable. Leadership reporting is safe to publish.')

  return alerts


def derive_risk_status(match_rate: float, discrepancy_rate: float, unmatched_rate: float) -> str:
  if match_rate < 0.75 or discrepancy_rate > 0.2 or unmatched_rate > 0.15:
    return 'critical'

  if match_rate < 0.9 or discrepancy_rate > 0.1 or unmatched_rate > 0.05:
    return 'watch'

  return 'healthy'


def reconcile_file(file_path: str, output_path: str | None = None) -> ReconcileSummary:
  payments, invoices, _projects = load_data(file_path)

  payments, invoices = normalize_data(payments, invoices)
  payments_expanded = explode_invoices(payments)

  df = level_1_match(payments_expanded, invoices)
  df = level_2_match(df)
  df = level_3_match(df, invoices)
  df = classify(df)

  df['reconciliation_id'] = np.arange(1, len(df) + 1)

  source_path = Path(file_path)
  resolved_output = Path(output_path) if output_path else source_path.with_name(f'{source_path.stem}_reconciled.xlsx')
  resolved_output.parent.mkdir(parents=True, exist_ok=True)
  df.to_excel(resolved_output, index=False)

  total_rows = int(len(df))
  unmatched = int((df['flag'] == 'UNMATCHED').sum())
  discrepancy = int((df['flag'] == 'DISCREPANCY').sum())
  matched_ok = int((df['flag'] == 'OK').sum())

  match_rate = float(matched_ok / total_rows) if total_rows else 0.0
  discrepancy_rate = float(discrepancy / total_rows) if total_rows else 0.0
  unmatched_rate = float(unmatched / total_rows) if total_rows else 0.0

  return ReconcileSummary(
    rows_processed=total_rows,
    matched_records=matched_ok,
    unmatched_records=unmatched,
    discrepancy_records=discrepancy,
    avg_match_score=float(df['match_score'].mean()) if total_rows else 0.0,
    match_rate=match_rate,
    discrepancy_rate=discrepancy_rate,
    unmatched_rate=unmatched_rate,
    risk_status=derive_risk_status(match_rate, discrepancy_rate, unmatched_rate),
    leadership_alerts=build_leadership_alerts(match_rate, discrepancy_rate, unmatched_rate),
    output_path=str(resolved_output),
  )
