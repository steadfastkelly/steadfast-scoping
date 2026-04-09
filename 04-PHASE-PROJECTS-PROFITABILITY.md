# Phase 4: Project Mapping + Profitability

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 3 verified and passing.

**Goal:** Invoices and time entries are grouped into projects. Profitability is calculated per project using Steadfast's rate card. Users can browse projects and see full financial breakdowns.

**Estimated effort:** 2 days

---

## Step-by-Step Instructions

### 4.1 Auto-generate projects from invoice data

Create `python/profitability/project_mapper.py`:

**Function: `auto_generate_projects() -> dict`**

Projects don't exist as a clean entity in the source data — they must be inferred. Use this logic:

1. Group invoices by `client_id`
2. Within each client, sort invoices by `invoice_date`
3. Create a project boundary when there's a gap of more than 45 days between invoices for the same client, OR when the invoice description/notes suggest a different project
4. For each group: create a `projects` row with:
   - `client_id` from the invoices
   - `name`: "[Client Name] — [Month Year]" as default (e.g., "Harrow — Jul 2025")
   - `start_date`: earliest invoice date in the group
   - `end_date`: latest invoice date in the group
   - `status`: "completed" if all invoices are paid, "active" if any are unpaid
5. Link each invoice to its project by setting `invoices.project_id`
6. Return: `{"projects_created": count, "invoices_linked": count}`

**Important edge case:** Some clients (like surgery centers) have small recurring monthly invoices ($30, $70, $105) that are retainer/maintenance — not discrete projects. Detect these by: same client, same amount, monthly frequency. Group all of them into a single "Retainer" project per client per year.

### 4.2 Map Timely hours to projects

**Function: `map_hours_to_projects() -> dict`**

1. For each `time_entries` row without a `project_id`:
2. Find the project that matches: same `client_id` AND `time_entry.date` falls between `project.start_date` and `project.end_date`
3. If a match is found, set `time_entries.project_id`
4. If no match: leave project_id as NULL (these are orphaned hours — show them in the UI)
5. Return: `{"mapped": count, "orphaned": count}`

### 4.3 Calculate profitability

Create `python/profitability/calculator.py`:

**Function: `calculate_all_profitability() -> dict`**

For each project:

1. **Revenue:** Sum of `invoices.total` where `invoices.project_id = project.id`
2. **Hours by role:** From `time_entries` grouped by `role` where `project_id` matches
3. **Cost:** Apply rate card from config:
   ```
   cost = (strategy_hours × 225) + (design_hours × 150) + (dev_hours × 180) + (content_hours × 140) + (am_hours × 120)
   ```
4. **Profit:** `revenue - cost`
5. **Margin:** `profit / revenue` (if revenue > 0, else 0)
6. **Over/under:** `"over"` if profit < 0, `"under"` if margin > 0.40, else `"on_target"`

Store results in `project_profitability` table. Clear and recalculate each time (idempotent).

Return: `{"projects_calculated": count, "profitable": count, "at_loss": count, "avg_margin": float}`

Create `python/profitability/role_breakdown.py`:

**Function: `get_role_breakdown(project_id) -> dict`**

Returns:
```python
{
    "strategy": {"hours": float, "cost": float, "pct_of_total": float},
    "design": {"hours": float, "cost": float, "pct_of_total": float},
    "development": {"hours": float, "cost": float, "pct_of_total": float},
    "content": {"hours": float, "cost": float, "pct_of_total": float},
    "am": {"hours": float, "cost": float, "pct_of_total": float},
    "total_hours": float,
    "total_cost": float
}
```

### 4.4 Register IPC methods

Add to `python/main.py`:

```python
elif method == "auto_generate_projects":
    return auto_generate_projects()

elif method == "map_hours_to_projects":
    return map_hours_to_projects()

elif method == "calculate_profitability":
    return calculate_all_profitability()

elif method == "get_projects":
    # params: { clientId?: int, projectType?: str, marginRange?: str }
    return get_projects_list(params)

elif method == "get_project_detail":
    # params: { projectId: int }
    return get_project_detail(params["projectId"])

elif method == "update_project":
    # params: { projectId: int, fields: { name?, project_type?, design_level?, etc. } }
    return update_project(params["projectId"], params["fields"])
```

### 4.5 Build Project List screen

Replace the placeholder `ProjectList.tsx`:

**Layout:** Search bar + filter row at top, card grid below.

**Search bar:** Text input that filters by project name or client name (client-side filtering is fine for MVP).

**Filters (row of Select dropdowns):**
- Client (dropdown of all clients)
- Status: All / Profitable / Break-even / At Loss
- Date range: This Year / Last Year / All Time / Custom

**Project cards (in a responsive grid, 2-3 columns):**

Each card shows:
- **Client name** (caption text, muted)
- **Project name** (subtitle text)
- **Date range** (caption, e.g., "Jul – Sep 2025")
- **Revenue** (body text, formatted as currency)
- **Margin badge:** Green badge if margin > 30%, gold if 15-30%, red if < 15% or negative. Shows percentage.
- **Mini role bar:** A thin horizontal stacked bar chart showing hours by role (each role segment uses a different chart color). This is purely visual — no labels, just relative proportions.

Cards are sorted by most recent first (by project end_date).

Clicking a card navigates to `/projects/:id`.

**Empty state:** If no projects exist, show a centered message: "No projects found. Import data and run reconciliation first." with a button linking to the Import screen.

### 4.6 Build Project Detail screen

Create `ProjectDetail.tsx` as a route component at `/projects/:id`.

**Header section:**
- Back button (arrow left) → returns to project list
- Client name (small, muted, above title)
- Project name (large, editable on click — inline text input)
- Date range badge
- Status badge
- Edit button → opens a sheet/dialog to edit project metadata (project_type, design_level, content_complexity, graphic_complexity, has_regulatory_review, notes)

**Section 1: Financial Summary (row of 4 metric cards):**
1. Revenue (large number, teal)
2. Cost (large number, muted)
3. Profit (large number, green if positive, red if negative)
4. Margin (large percentage, color-coded green/gold/red)

**Section 2: Role Breakdown (table):**

| Role | Hours | Rate | Cost | % of Total |
|------|-------|------|------|------------|
| Strategy | 12.0 | $225 | $2,700 | 18% |
| Design | 24.0 | $150 | $3,600 | 24% |
| Development | 16.0 | $180 | $2,880 | 19% |
| Content | 8.0 | $140 | $1,120 | 7% |
| AM | 10.0 | $120 | $1,200 | 8% |
| **Total** | **70.0** | — | **$11,500** | **100%** |

Rows where hours exceeded what would be expected (based on format hour ranges from the quoting skill) should have a subtle amber background.

**Section 3: Invoice History (table):**

| Invoice # | Date | Amount | Status | Match Level |
|-----------|------|--------|--------|-------------|
| 4993 | Jul 24, 2025 | $6,550 | Paid | L1 |
| 4994 | Jul 24, 2025 | $6,300 | Paid | L1 |

Match level shown as a small badge: L1 (green), L2 (teal), L3 (gold), L4 (purple for manual).

**Section 4: Linked Payments (table):**

| Payment # | Date | Amount | Customer | Variance |
|-----------|------|--------|----------|----------|
| 3889 | Jul 28, 2025 | $12,850 | Harrow | $0.00 |

Variance column: green $0.00 for exact match, amber/red for discrepancies.

### 4.7 Build ProfitBadge component

Create `src/components/project-history/ProfitBadge.tsx`:

A reusable badge that takes a margin percentage and renders:
- Green background + text for margin > 30%
- Gold background + text for margin 15-30%
- Red background + text for margin < 15%
- Dark red background for negative margin (loss)

Display format: "+32.4%" or "−8.1%" (use actual minus sign, not hyphen).

### 4.8 Add a "Generate Projects" step to Import flow

On the Import Data screen, after reconciliation is complete, add a new step:

**"Step 3: Generate Projects"** card that appears below the reconciliation summary.

Button: "Auto-Generate Projects" → runs `auto_generate_projects()` + `map_hours_to_projects()` + `calculate_profitability()` in sequence.

Shows progress through each sub-step, then a summary: "Created 47 projects. 38 profitable, 6 at loss, 3 break-even."

After this completes, the Projects sidebar item should show a small count badge.

---

## Verification Checklist

Before moving to Phase 5, confirm ALL of the following:

- [ ] "Auto-Generate Projects" button appears after reconciliation
- [ ] Clicking it creates projects grouped by client and date
- [ ] Recurring small invoices (surgery centers) are grouped into retainer projects
- [ ] Timely hours are mapped to the correct projects
- [ ] Profitability is calculated for all projects
- [ ] The Projects screen shows a searchable, filterable grid of project cards
- [ ] Each card shows client name, project name, revenue, margin badge, and role bar
- [ ] Filtering by client, status, and date range works
- [ ] Clicking a card opens the Project Detail screen
- [ ] Project Detail shows correct financial summary, role breakdown, invoice history, and payment history
- [ ] Editing project metadata (name, type, design level) saves correctly
- [ ] The ProfitBadge colors are correct (green/gold/red thresholds)
- [ ] Projects with no Timely hours show $0 cost and 100% margin (revenue-only)

**When all checks pass:** Tell Codex "Phase 4 is verified. Stop here."
