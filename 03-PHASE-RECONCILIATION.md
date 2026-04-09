# Phase 3: Reconciliation Engine

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 2 verified and passing.

**Goal:** Payments are automatically matched to invoices using a 4-level matching system. Unmatched payments can be manually linked. Match results are stored with confidence scores.

**Estimated effort:** 2 days

---

## Context: The Existing Python Script

The uploaded file `import_pandas_as_pd.py` contains working reconciliation logic. This phase adapts that logic to work with the SQLite database instead of in-memory Excel parsing. The core algorithms stay the same — we're refactoring the data access, not the matching logic.

---

## Step-by-Step Instructions

### 3.1 Build the matcher

Create `python/reconciliation/matcher.py`:

**Function: `run_reconciliation() -> dict`**

This function orchestrates all 4 levels of matching.

**Level 1 — Exact Match:**
- Load all payments that reference invoice numbers (the `Invoice#` field from the payments Excel, which was stored as-is during import)
- For payments with a single invoice number: find the invoice by number, check if `payment.amount == invoice.total`
- If both match: create a `payment_invoice_links` row with `match_level=1`

**Level 2 — Multi-Invoice Sum Match:**
- For payments that reference multiple invoice numbers (comma-separated): split the numbers, find each invoice, sum their totals
- If the sum equals the payment amount: create links for each invoice with `match_level=2`

**Level 3 — Fuzzy Match:**
- For payments with no invoice number or whose invoice number didn't match anything:
- Use `rapidfuzz.process.extractOne` with `fuzz.token_sort_ratio` to find the closest customer name match in the invoices table
- Threshold: score >= 85 (from config)
- Date window: payment date within 60 days of invoice date (from config)
- If fuzzy match found: create link with `match_level=3`

**Level 4 — Manual (no code here, just mark as unmatched):**
- Any payment not matched by Levels 1-3 gets flagged as unmatched
- These will be shown in the UI for manual matching

### 3.2 Build the scorer

Create `python/reconciliation/scorer.py`:

**Function: `calculate_match_score(payment, invoice, match_level) -> int`**

Scoring (0-100):
- Invoice number matches: +60 points
- Amount matches (within $0.01): +20 points
- Customer name matches (normalized): +10 points
- Date proximity (payment within 60 days of invoice): +10 points

### 3.3 Build the classifier

Create `python/reconciliation/classifier.py`:

**Function: `classify_match(payment_id, invoice_id, match_score) -> str`**

Returns one of:
- `"OK"` — matched and amounts align
- `"DISCREPANCY"` — matched but amounts differ
- `"UNMATCHED"` — no match found

Also calculates variance: `payment.amount - invoice.total`

### 3.4 Handle the reconciliation pipeline

In `matcher.py`, the `run_reconciliation()` function should:

1. Clear any existing `payment_invoice_links` (so reconciliation can be re-run)
2. Load all payments from database into a pandas DataFrame
3. Load all invoices from database into a pandas DataFrame
4. Run Level 1 matching
5. Run Level 2 matching (only on payments not yet matched)
6. Run Level 3 matching (only on payments not yet matched)
7. For each match: calculate score, classify, store in `payment_invoice_links`
8. Return summary:
```python
{
    "total_payments": int,
    "level_1_matches": int,
    "level_2_matches": int,
    "level_3_matches": int,
    "unmatched": int,
    "discrepancies": int,
    "total_matched_amount": float,
    "total_unmatched_amount": float
}
```

### 3.5 Register IPC methods

Add to `python/main.py`:

```python
elif method == "reconcile":
    return run_reconciliation()

elif method == "get_reconciliation_summary":
    return get_reconciliation_summary()  # reads from payment_invoice_links

elif method == "get_unmatched_payments":
    return get_unmatched_payments()  # payments with no links

elif method == "get_unmatched_invoices":
    return get_unmatched_invoices()  # invoices with no links

elif method == "manual_match":
    # params: { paymentId: int, invoiceId: int }
    return create_manual_match(params["paymentId"], params["invoiceId"])

elif method == "unmatch":
    # params: { linkId: int }
    return remove_match(params["linkId"])
```

### 3.6 Build the Reconciliation UI

This is not a separate screen — it's a section that appears on the Import Data screen after reconciliation runs.

**When the "Run Reconciliation" button is clicked:**
1. Show a progress indicator with status messages:
   - "Running Level 1: Exact matches..."
   - "Running Level 2: Multi-invoice matches..."
   - "Running Level 3: Fuzzy matches..."
   - "Classification complete."
2. After completion, show a summary card:
   - 4 metric badges in a row: L1 Matches (count), L2 Matches (count), L3 Matches (count), Unmatched (count in gold/red)
   - Total matched amount vs total unmatched amount
   - A progress bar showing match rate percentage

**Below the summary, two collapsible sections:**

**Section 1: "Discrepancies" (collapsed by default)**
- Table showing payments where the matched invoice total doesn't equal the payment amount
- Columns: Payment # | Customer | Payment Amount | Invoice # | Invoice Total | Variance
- Variance column: green if positive (overpayment), red if negative (underpayment)

**Section 2: "Unmatched Payments" (expanded by default if any exist)**
- Left column: list of unmatched payments (cards with payment #, customer, amount, date)
- Right column: searchable list of unlinked invoices
- User can drag a payment card onto an invoice, or click a payment then click an invoice to link them
- When linked: the pair moves out of the unmatched lists and into a "Manually Matched" section below
- Each manual match gets `match_level=4` and a score based on whatever signals exist

**"Unmatched Invoices" tab:**
- Shows invoices that have no payment linked to them
- Purely informational — some invoices may be unpaid, which is expected

### 3.7 Re-run support

The "Run Reconciliation" button should be available even after reconciliation has run. Re-running clears all existing links and starts fresh. Show a confirmation dialog: "This will re-run reconciliation and clear all manual matches. Continue?"

---

## Verification Checklist

Before moving to Phase 4, confirm ALL of the following:

- [ ] The "Run Reconciliation" button appears after invoices and payments are imported
- [ ] Clicking it shows progress through all 4 levels
- [ ] The summary card shows correct counts for each match level
- [ ] The match rate percentage is reasonable (expect 80%+ for clean data)
- [ ] The discrepancies table shows payments with amount mismatches
- [ ] The unmatched payments section shows payments that couldn't be auto-matched
- [ ] Dragging/clicking to manually match a payment to an invoice works
- [ ] Manual matches are saved (refresh the app → they persist)
- [ ] Re-running reconciliation clears previous results and runs fresh
- [ ] The `payment_invoice_links` table in SQLite contains the correct data
- [ ] No duplicate links exist (one link per payment-invoice pair)

**When all checks pass:** Tell Codex "Phase 3 is verified. Stop here."
