# Actual Data Model

## Purpose

`actual` is the realized performance summary for a job. It consolidates what actually happened across invoices, payments, and time entries into a single operational and financial outcome record.

In the current phase documents, this model maps most closely to `project_profitability`, with supporting detail from invoices, payments, and time entries.

## Core Relationships

- One `actual` belongs to one job
- One `actual` summarizes many invoices
- One `actual` summarizes many payment links
- One `actual` summarizes many time entries
- One `actual` can be compared against one current estimate

## Canonical Shape

```ts
type Actual = {
  id: number
  jobId: number
  asOfDate: string
  revenueRecognized: number
  cashCollected: number
  outstandingBalance: number
  strategyHours: number
  strategyCost: number
  designHours: number
  designCost: number
  developmentHours: number
  developmentCost: number
  contentHours: number
  contentCost: number
  amHours: number
  amCost: number
  totalHours: number
  totalCost: number
  profit: number
  margin: number
  scopeVariance: number | null
  performanceBand: "over" | "on_target" | "under"
  invoiceCount: number
  paymentCount: number
  discrepancyCount: number
  calculatedAt: string
}
```

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | integer | yes | Primary key |
| `jobId` | integer | yes | Foreign key to job |
| `asOfDate` | date | yes | Snapshot date for reporting |
| `revenueRecognized` | real | yes | Sum of linked invoice totals |
| `cashCollected` | real | yes | Sum of matched payment amounts |
| `outstandingBalance` | real | yes | Open invoice balance still unpaid |
| `strategyHours` | real | yes | Actual hours by role |
| `strategyCost` | real | yes | Actual role cost |
| `designHours` | real | yes | Actual hours by role |
| `designCost` | real | yes | Actual role cost |
| `developmentHours` | real | yes | Actual hours by role |
| `developmentCost` | real | yes | Actual role cost |
| `contentHours` | real | yes | Actual hours by role |
| `contentCost` | real | yes | Actual role cost |
| `amHours` | real | yes | Actual hours by role |
| `amCost` | real | yes | Actual role cost |
| `totalHours` | real | yes | Sum of all role hours |
| `totalCost` | real | yes | Sum of all role costs |
| `profit` | real | yes | `revenueRecognized - totalCost` |
| `margin` | real | yes | `profit / revenueRecognized` when revenue exists |
| `scopeVariance` | real | no | Delta vs estimate or quoting benchmark |
| `performanceBand` | enum | yes | Over, on target, under |
| `invoiceCount` | integer | yes | Number of invoices in the job |
| `paymentCount` | integer | yes | Number of payments linked to the job |
| `discrepancyCount` | integer | yes | Count of reconciliation discrepancies |
| `calculatedAt` | timestamp | yes | Snapshot creation time |

## Source Mapping

| Actual field | Current schema/source |
|---|---|
| `id` | `project_profitability.id` |
| `jobId` | `project_profitability.project_id` |
| `revenueRecognized` | `project_profitability.total_revenue` |
| `strategyHours` | `project_profitability.strategy_hours` |
| `strategyCost` | `project_profitability.strategy_cost` |
| `designHours` | `project_profitability.design_hours` |
| `designCost` | `project_profitability.design_cost` |
| `developmentHours` | `project_profitability.development_hours` |
| `developmentCost` | `project_profitability.development_cost` |
| `contentHours` | `project_profitability.content_hours` |
| `contentCost` | `project_profitability.content_cost` |
| `amHours` | `project_profitability.am_hours` |
| `amCost` | `project_profitability.am_cost` |
| `totalCost` | `project_profitability.total_cost` |
| `profit` | `project_profitability.profit` |
| `margin` | `project_profitability.margin` |
| `scopeVariance` | `project_profitability.scope_variance` |
| `performanceBand` | `project_profitability.over_under` |
| `calculatedAt` | `project_profitability.calculated_at` |
| `cashCollected` | derived from matched `payments` |
| `outstandingBalance` | derived from `invoices.balance` |
| `invoiceCount` | derived from `invoices` |
| `paymentCount` | derived from `payment_invoice_links` + `payments` |
| `discrepancyCount` | derived from reconciliation flags |

## Business Rules

- Actual values should be reproducible from imported source records and the configured rate card.
- `totalHours` must equal the sum of all role hour fields.
- `totalCost` must equal the sum of all role cost fields.
- `profit` and `margin` should be deterministic calculations, not manually edited values.
- `cashCollected` may differ from `revenueRecognized`; both must be tracked separately.
- `actual` should be recalculable idempotently whenever imports or mappings change.

## Recommended Derived Fields

- `collectionRate = cashCollected / revenueRecognized`
- `avgRealizedRate = revenueRecognized / totalHours`
- `estimateVarianceHours`
- `estimateVarianceCost`
- `estimateVarianceMargin`
- `isLossMaking`

## Persistence Recommendation

The existing `project_profitability` table is the correct persisted base for `actual`. Add query-layer enrichment from `invoices`, `payments`, `payment_invoice_links`, and `time_entries` rather than duplicating those details into the summary row.
