# Estimate Data Model

## Purpose

`estimate` represents the planned commercial and delivery view of a job before or during execution. It captures expected scope, hours, cost, price, and margin assumptions.

In the current phase documents, this model is conceptually split across:

- `forecasts`
- `forecast_comparables`
- `forecast_scenarios`

## Core Relationships

- One `estimate` belongs to one job
- One `estimate` can reference many comparable jobs
- One `estimate` can have many scenarios or revisions
- One job can have many estimates over time, but only one should be marked current

## Canonical Shape

```ts
type Estimate = {
  id: number
  jobId: number
  version: number
  status: "draft" | "current" | "superseded" | "approved"
  basis: "manual" | "ai_forecast" | "historical_comparable" | "hybrid"
  scopeSummary: string | null
  assumptions: string[]
  strategyHours: number
  designHours: number
  developmentHours: number
  contentHours: number
  amHours: number
  totalHours: number
  estimatedCost: number
  estimatedPrice: number
  estimatedProfit: number
  estimatedMargin: number
  confidence: number | null
  comparableJobIds: number[]
  createdAt: string
  updatedAt: string | null
}
```

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | integer | yes | Primary key |
| `jobId` | integer | yes | Foreign key to job |
| `version` | integer | yes | Monotonic revision number |
| `status` | enum | yes | Only one `current` estimate per job |
| `basis` | enum | yes | How the estimate was created |
| `scopeSummary` | text | no | Short plain-language summary |
| `assumptions` | json/text[] | yes | Pricing and scope assumptions |
| `strategyHours` | real | yes | Planned hours by role |
| `designHours` | real | yes | Planned hours by role |
| `developmentHours` | real | yes | Planned hours by role |
| `contentHours` | real | yes | Planned hours by role |
| `amHours` | real | yes | Planned hours by role |
| `totalHours` | real | yes | Sum of role hours |
| `estimatedCost` | real | yes | Derived from role hours × rate card |
| `estimatedPrice` | real | yes | Proposed client fee |
| `estimatedProfit` | real | yes | `estimatedPrice - estimatedCost` |
| `estimatedMargin` | real | yes | `estimatedProfit / estimatedPrice` |
| `confidence` | integer | no | 0-100 confidence or fit score |
| `comparableJobIds` | json/int[] | no | Historical jobs used for support |
| `createdAt` | timestamp | yes | Audit field |
| `updatedAt` | timestamp | no | Audit field |

## Source Mapping

| Estimate field | Current schema/source |
|---|---|
| `id` | `forecast_scenarios.id` or future dedicated estimate table |
| `scopeSummary` | derived from `forecasts.raw_notes` / parsed characteristics |
| `assumptions` | `forecast_scenarios.assumptions` |
| `strategyHours` | `forecast_scenarios.strategy_hours` |
| `designHours` | `forecast_scenarios.design_hours` |
| `developmentHours` | `forecast_scenarios.development_hours` |
| `contentHours` | `forecast_scenarios.content_hours` |
| `amHours` | `forecast_scenarios.am_hours` |
| `totalHours` | `forecast_scenarios.total_hours` |
| `estimatedCost` | `forecast_scenarios.total_cost` |
| `estimatedPrice` | `forecast_scenarios.recommended_price` |
| `estimatedMargin` | `forecast_scenarios.projected_margin` |
| `confidence` | informed by comparable similarity scores |
| `comparableJobIds` | `forecast_comparables.project_id` |

## Business Rules

- Every role-hour field must be greater than or equal to zero.
- `totalHours` must equal the sum of all role hours.
- `estimatedProfit` and `estimatedMargin` should be derived values, even if persisted for query speed.
- Only one estimate per job should be marked `current`.
- A new approved estimate should supersede the previous current version rather than overwrite it.
- Estimates should preserve assumptions in a structured, reviewable form.

## Recommended Derived Fields

- `blendedRate = estimatedPrice / totalHours`
- `costPerHour = estimatedCost / totalHours`
- `varianceToActualHours`
- `varianceToActualRevenue`
- `varianceToActualMargin`

## Persistence Recommendation

Short term, keep forecast data in the existing forecast tables and expose an application-level `estimate` object assembled from forecast, comparable, and scenario records.

Long term, a dedicated `estimates` table should exist if estimates become editable, versioned business records outside the forecasting workflow.
