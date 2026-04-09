# Phase 5: Dashboard

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 4 verified and passing.

**Goal:** A firm-wide profitability overview with metric cards, trend charts, and a client breakdown table. This is the landing page when the app opens.

**Estimated effort:** 1 day

---

## Step-by-Step Instructions

### 5.1 Build dashboard queries

Create `python/profitability/dashboard.py`:

**Function: `get_dashboard(date_range=None) -> dict`**

If `date_range` is provided as `[start_date, end_date]`, filter all data to projects within that range. Otherwise, use all data.

Returns:
```python
{
    "metrics": {
        "total_revenue": float,
        "total_cost": float,
        "total_profit": float,
        "avg_margin": float,          # weighted average (total profit / total revenue)
        "project_count": int,
        "profitable_count": int,
        "at_loss_count": int,
        "at_risk_count": int           # projects with margin < 15%
    },
    "monthly_trend": [
        {
            "month": "2025-01",        # YYYY-MM format
            "revenue": float,
            "cost": float,
            "profit": float,
            "margin": float,
            "project_count": int
        },
        # ... one entry per month
    ],
    "client_breakdown": [
        {
            "client_id": int,
            "client_name": str,
            "total_revenue": float,
            "total_cost": float,
            "total_profit": float,
            "margin": float,
            "project_count": int,
            "avg_project_margin": float
        },
        # ... sorted by total_revenue descending
    ],
    "top_losses": [
        # 5 projects with worst margins
        {
            "project_id": int,
            "project_name": str,
            "client_name": str,
            "margin": float,
            "loss_amount": float
        }
    ]
}
```

### 5.2 Register IPC method

Add to `python/main.py`:

```python
elif method == "get_dashboard":
    date_range = params.get("dateRange")
    return get_dashboard(date_range)
```

### 5.3 Build the Dashboard screen

Replace the placeholder `Overview.tsx`:

**Date filter (top right):** A row of toggle buttons: "This Year" | "Last Year" | "All Time" | a date range picker for custom. Default: "All Time". Changing the filter re-fetches dashboard data.

**Row 1: Four metric cards (equal width, horizontal row):**

1. **Total Revenue**
   - Large number in `--fs-display` size, white text
   - Caption: "across [N] projects"
   - Card background: `--sf-surface`

2. **Total Profit**
   - Large number, green if positive, red if negative
   - Caption: absolute dollar amount
   - Card background: `--sf-surface`

3. **Average Margin**
   - Large percentage number
   - Color: green (>30%), gold (15-30%), red (<15%)
   - Caption: "weighted average"
   - Card background: `--sf-surface`

4. **Projects at Risk**
   - Large count number, red if > 0, muted if 0
   - Caption: "margin below 15%"
   - Card background: `--sf-surface`, left border accent red if count > 0

**Row 2: Margin Trend Chart (full width card):**

- Recharts `ComposedChart` or `LineChart`
- X-axis: months (formatted as "Jan '25", "Feb '25", etc.)
- Y-axis left: dollar amounts (revenue and cost as area fills)
- Y-axis right: margin percentage (as a line)
- Revenue area: `--chart-1` (teal) at 20% opacity
- Cost area: `--chart-5` (red) at 10% opacity
- Margin line: `--chart-3` (gold), 2px stroke
- Tooltip: shows month, revenue, cost, profit, margin on hover
- Chart background: transparent (sits on the card which is `--sf-surface`)

**Row 3: Two columns**

**Left column (60% width): Client Breakdown Table**

- shadcn/ui Table component
- Columns: Client | Revenue | Cost | Profit | Margin | Projects
- Sortable by clicking column headers (default: sorted by Revenue descending)
- Margin column uses ProfitBadge component
- Clicking a row navigates to `/projects?client=[clientId]` (filtered project list)
- Zebra striping: alternating `--sf-surface` and `--sf-surface-raised` rows

**Right column (40% width): Top Losses Card**

- Card titled "Biggest Losses"
- List of up to 5 projects with worst margins
- Each item shows: project name, client name, margin %, loss amount in red
- Clicking an item navigates to `/projects/:id`
- If no losses exist, show a green "All projects profitable" message

### 5.4 Loading and empty states

**Loading state:** While dashboard data is being fetched, show Skeleton components in place of each metric card and chart area. Do not show a full-page spinner.

**Empty state:** If no projects exist yet, show a centered card: "No project data yet. Import your invoices, payments, and Timely hours to get started." with a teal button linking to `/import`.

### 5.5 Make Dashboard the default route

Ensure that `/` renders the Dashboard. When the app launches, the user sees the Dashboard first. If no data exists, they see the empty state pointing them to Import.

---

## Verification Checklist

Before moving to Phase 6, confirm ALL of the following:

- [ ] Dashboard loads as the home screen when the app opens
- [ ] Four metric cards show correct totals
- [ ] Metric cards use correct color coding (green/gold/red)
- [ ] The trend chart renders with months on x-axis
- [ ] Hovering over the chart shows a tooltip with detailed numbers
- [ ] The client breakdown table is sortable
- [ ] Clicking a client row navigates to a filtered project list
- [ ] The "Biggest Losses" card shows the correct projects
- [ ] Date filter buttons (This Year / Last Year / All Time) correctly filter all data
- [ ] Loading skeletons appear while data is fetching
- [ ] Empty state appears when no data is imported
- [ ] No console errors in Electron DevTools

**When all checks pass:** Tell Codex "Phase 5 is verified. Stop here."
