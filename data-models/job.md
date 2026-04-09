# Job Data Model

## Purpose

`job` is the canonical business object for a piece of client work. It is the stable container that connects imported operational records to planning (`estimate`) and realized performance (`actual`).

In the current phase documents, this model maps most closely to the `projects` table in the SQLite schema.

## Core Relationships

- One `job` belongs to one client
- One `job` can have many invoices
- One `job` can have many payments through linked invoices
- One `job` can have many time entries
- One `job` can have many estimates over time
- One `job` can have one current actual summary per calculation run

## Canonical Shape

```ts
type Job = {
  id: number
  clientId: number
  name: string
  code: string | null
  status: "draft" | "active" | "completed" | "archived"
  jobType: string | null
  designLevel: "low" | "medium" | "high" | null
  contentComplexity: "low" | "medium" | "high" | null
  graphicComplexity: "low" | "medium" | "high" | null
  hasRegulatoryReview: boolean
  startDate: string | null
  endDate: string | null
  notes: string | null
  source: "imported" | "inferred" | "manual"
  createdAt: string
  updatedAt: string | null
}
```

## Field Definitions

| Field | Type | Required | Notes |
|---|---|---:|---|
| `id` | integer | yes | Primary key |
| `clientId` | integer | yes | Foreign key to `clients.id` |
| `name` | text | yes | Human-readable job name |
| `code` | text | no | Optional internal identifier |
| `status` | enum | yes | Lifecycle state |
| `jobType` | text | no | Website, branding, retainer, campaign, etc. |
| `designLevel` | enum | no | Mirrors project design complexity |
| `contentComplexity` | enum | no | Low/medium/high |
| `graphicComplexity` | enum | no | Low/medium/high |
| `hasRegulatoryReview` | boolean | yes | Needed for medical or compliance-heavy work |
| `startDate` | date | no | Earliest known work or invoice date |
| `endDate` | date | no | Latest known work or invoice date |
| `notes` | text | no | Internal context |
| `source` | enum | yes | Whether the job was imported, inferred, or manually created |
| `createdAt` | timestamp | yes | Audit field |
| `updatedAt` | timestamp | no | Audit field if mutation tracking is added |

## Source Mapping

| Job field | Current schema/source |
|---|---|
| `id` | `projects.id` |
| `clientId` | `projects.client_id` |
| `name` | `projects.name` |
| `status` | `projects.status` |
| `jobType` | `projects.project_type` |
| `designLevel` | `projects.design_level` |
| `contentComplexity` | `projects.content_complexity` |
| `graphicComplexity` | `projects.graphic_complexity` |
| `hasRegulatoryReview` | `projects.has_regulatory_review` |
| `startDate` | `projects.start_date` |
| `endDate` | `projects.end_date` |
| `notes` | `projects.notes` |

## Business Rules

- A `job` must always belong to exactly one client.
- A `job` should be the unit used for profitability and forecasting comparisons.
- Imported invoices and time entries can exist before a `job` exists; those records are later attached during project generation.
- Retainer work should still use a `job`, but its `jobType` should distinguish it from discrete project work.
- `startDate` must be less than or equal to `endDate` when both are present.

## Recommended Derived Fields

These do not need to be stored if they can be computed:

- `invoiceCount`
- `paymentCount`
- `totalRevenue`
- `totalHours`
- `currentMargin`
- `hasEstimate`
- `hasActual`

## Persistence Recommendation

Near-term implementation can use the existing `projects` table as the persisted `job` model with a thin translation layer in TypeScript/Python. If the product language shifts fully to `job`, the database can keep `projects` as the physical table and expose `job` as the application-level name.
