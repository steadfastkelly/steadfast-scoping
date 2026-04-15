from fastapi import FastAPI, HTTPException

from app.models import (
  ClickUpWorkloadRequest,
  ClickUpWorkloadResult,
  ForecastRequest,
  IngestionResult,
  ProfitabilityResult,
  ReconcileRequest,
  ReconcileResult,
)
from app.services.clickup import fetch_clickup_workload
from app.services.forecasting import forecast_placeholder
from app.services.ingestion import ingest_placeholder
from app.services.profitability import profitability_placeholder
from app.services.reconciliation import reconcile_file

app = FastAPI(title='Steadfast Scope Engine', version='0.4.0')


@app.get('/health')
def health() -> dict:
  return {'status': 'ok', 'service': 'python-scope-engine'}


@app.post('/ingest/{source}', response_model=IngestionResult)
def ingest(source: str, payload: dict) -> IngestionResult:
  source_value = source if source in {'timely', 'invoices', 'payments'} else 'timely'
  return ingest_placeholder(source_value, payload)


@app.post('/reconcile/run', response_model=ReconcileResult)
def reconcile(request: ReconcileRequest) -> ReconcileResult:
  try:
    summary = reconcile_file(request.file_path, request.output_path)
  except Exception as exc:
    raise HTTPException(status_code=400, detail=f'Reconciliation failed: {exc}') from exc

  return ReconcileResult(
    rows_processed=summary.rows_processed,
    matched_records=summary.matched_records,
    unmatched_records=summary.unmatched_records,
    discrepancy_records=summary.discrepancy_records,
    confidence_score=summary.avg_match_score,
    match_rate=summary.match_rate,
    discrepancy_rate=summary.discrepancy_rate,
    unmatched_rate=summary.unmatched_rate,
    risk_status=summary.risk_status,
    leadership_alerts=summary.leadership_alerts,
    output_path=summary.output_path,
  )


@app.post('/workload/clickup', response_model=ClickUpWorkloadResult)
def workload_clickup(request: ClickUpWorkloadRequest) -> ClickUpWorkloadResult:
  try:
    return fetch_clickup_workload(request)
  except Exception as exc:
    raise HTTPException(status_code=400, detail=f'ClickUp workload pull failed: {exc}') from exc


@app.post('/profitability/run', response_model=ProfitabilityResult)
def profitability() -> ProfitabilityResult:
  return profitability_placeholder()


@app.post('/forecast/run')
def forecast(request: ForecastRequest) -> dict:
  return forecast_placeholder(request).model_dump()
