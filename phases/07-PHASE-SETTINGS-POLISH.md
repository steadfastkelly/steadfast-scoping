# Phase 7: Settings + Polish

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 6 verified and passing.

**Goal:** Settings screen with editable rate card, Ollama status, data management. Error handling and loading states for every screen. Edge case coverage.

**Estimated effort:** 1 day

---

## Step-by-Step Instructions

### 7.1 Build the Settings screen

Replace the Settings placeholder with a full implementation.

**Layout:** Vertical stack of cards.

**Card 1: Rate Card**

Title: "Billable Rates"
Description: "These rates are used to calculate project cost and profitability."

Editable table:
| Role | Rate ($/hr) |
|------|-------------|
| Strategy | [input: 225] |
| Design | [input: 150] |
| Development | [input: 180] |
| Content | [input: 140] |
| AM | [input: 120] |

- Each rate is a number input field, pre-filled with current values
- "Save Rates" button (teal) → saves to database (create a `settings` table with key-value pairs)
- "Reset to Defaults" button (muted) → restores original values
- After saving, show a toast/notification: "Rates saved. Profitability will be recalculated."
- Trigger a background recalculation of all project profitability after rates change

**Card 2: Forecast Settings**

Title: "Forecast Defaults"

- Target Margin: number input, default 35%, range 10-60%
- Description: "Used to calculate recommended project price in forecasts."

**Card 3: Ollama Status**

Title: "AI Engine (Ollama)"

- Status indicator: green dot + "Connected" or red dot + "Offline"
- Model: "llama3.1:8b" (or whatever is detected)
- "Test Connection" button → calls `check_ollama_health()` and shows result
- If offline: show setup instructions inline (same as Phase 6 fallback)

**Card 4: Data Management**

Title: "Data Management"

- **Record counts:**
  - Invoices: [count]
  - Payments: [count]
  - Time entries: [count]
  - Projects: [count]
  - Forecasts: [count]

- **Export Database** button → copies the SQLite file to a user-selected location using a save dialog
- **Clear All Data** button (red, destructive) → confirmation dialog: "This will permanently delete all imported data, projects, and forecasts. This cannot be undone." → if confirmed, drops and recreates all tables
- **Clear Forecasts Only** button (amber) → deletes only forecasts, forecast_comparables, forecast_scenarios

**Card 5: About**

Title: "Steadfast Profit Forecaster"
- Version: 1.0.0
- Built for Steadfast Design Firm
- "Data is stored locally and never leaves this machine."

### 7.2 Rate change propagation

Create `python/profitability/recalculate.py`:

**Function: `recalculate_all(new_rates: dict) -> dict`**

1. Update the rates in the `settings` table
2. Recalculate `project_profitability` for every project using the new rates
3. Return: `{"recalculated": count, "newly_profitable": count, "newly_at_loss": count}`

### 7.3 Error handling — global

Add these error handling patterns everywhere:

**Python side:**
- Every function that touches the database wraps operations in try/except
- On error, return `{"error": {"code": "DB_ERROR", "message": "..."}}`
- Never let an unhandled exception crash the Python process — the stdin loop must stay alive

**React side:**
- Every IPC call wraps in try/catch
- On error, show a toast notification with the error message (use Sonner or shadcn/ui Toast)
- Never show a blank screen — if data fails to load, show an error card with a "Retry" button

**Specific error states to handle:**

| Scenario | What the User Sees |
|----------|-------------------|
| Python process crashes | "Backend connection lost. Restart the app." + auto-restart attempt |
| SQLite file is locked | "Database is busy. Try again in a moment." |
| Excel file has wrong columns | "Missing required columns: [list]. Check that your file has these headers." |
| Timely CSV format unrecognized | "Could not detect Timely column format. Expected columns: User, Project, Hours, Date." |
| Ollama not running | Setup instructions (already built in Phase 6) |
| Ollama returns invalid JSON | "AI returned an unexpected response. Retrying..." + one automatic retry |
| No comparable projects found | "No similar past projects found. Try importing more historical data." |
| Division by zero in margin calc | Show "N/A" instead of Infinity or NaN |

### 7.4 Loading states — global

Every screen that fetches data should show loading skeletons (not spinners) while loading:

- **Dashboard:** 4 skeleton cards, skeleton chart area, skeleton table
- **Projects:** skeleton card grid
- **Project Detail:** skeleton header + skeleton sections
- **Forecast:** left panel stays visible, right panel shows skeleton blocks
- **Import:** cards show current state (no loading needed until import starts)
- **Settings:** skeleton rate card table

Use the shadcn/ui Skeleton component with Steadfast's surface colors.

### 7.5 Empty states — global

Every list/table that could be empty needs a friendly empty state:

| Screen | Empty State Message | Action |
|--------|-------------------|--------|
| Dashboard (no data) | "No project data yet. Import your data to get started." | Button → Import |
| Projects (no projects) | "No projects found. Import data and run reconciliation first." | Button → Import |
| Projects (filter returns nothing) | "No projects match your filters." | "Clear filters" link |
| Forecast (no past data to compare) | "Not enough historical data for comparison. Import more projects first." | Button → Import |
| Forecast comparables (no matches) | "No similar past projects found. The forecast will use benchmark estimates only." | No action |

### 7.6 Keyboard shortcuts

Add these for power users:

| Shortcut | Action |
|----------|--------|
| ⌘+1 | Navigate to Dashboard |
| ⌘+2 | Navigate to Projects |
| ⌘+3 | Navigate to New Forecast |
| ⌘+4 | Navigate to Import Data |
| ⌘+5 | Navigate to Settings |
| ⌘+N | New Forecast (same as ⌘+3) |
| Escape | Close any open dialog/sheet |

Register these in the Electron main process using `globalShortcut` or `Menu` accelerators.

### 7.7 Window title

Set the Electron window title dynamically:
- Dashboard: "Steadfast Profit Forecaster"
- Projects: "Projects — Steadfast Profit Forecaster"
- Project Detail: "[Project Name] — Steadfast Profit Forecaster"
- New Forecast: "New Forecast — Steadfast Profit Forecaster"
- Import: "Import Data — Steadfast Profit Forecaster"
- Settings: "Settings — Steadfast Profit Forecaster"

---

## Verification Checklist

Before moving to Phase 8, confirm ALL of the following:

- [ ] Settings screen shows all 5 cards
- [ ] Rate card is editable and saves correctly
- [ ] Changing rates triggers profitability recalculation (check a project's margin changes)
- [ ] Target margin setting is saved and used in forecasts
- [ ] Ollama status indicator shows correct state (test with Ollama on and off)
- [ ] "Test Connection" button works
- [ ] Export Database saves the SQLite file to a chosen location
- [ ] Clear All Data deletes everything (with confirmation)
- [ ] Clear Forecasts Only deletes only forecast data
- [ ] No screen shows a blank white area — every state has appropriate loading/empty/error content
- [ ] Uploading a file with wrong columns shows a specific error message
- [ ] Python process crash triggers a visible error + restart attempt
- [ ] Keyboard shortcuts navigate correctly
- [ ] Window title updates per screen

**When all checks pass:** Tell Codex "Phase 7 is verified. Stop here."
