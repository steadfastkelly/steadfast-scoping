# Steadfast Profit Forecaster — Foundation Reference

**Give this file to Codex/Claude Code alongside every phase file.**  
It contains the constants, tokens, structure, and schema that every phase depends on.

---

## App Identity

- **Name:** Steadfast Profit Forecaster
- **Type:** Electron desktop app (macOS)
- **Purpose:** Forecast project profitability by comparing new project notes to historical invoice, payment, and time-tracking data
- **Security model:** 100% local. No cloud. No server. Data never leaves the machine. AI runs via Ollama on localhost.

---

## Tech Stack (Exact Versions — Do Not Substitute)

| Layer | Technology | Version |
|-------|-----------|---------|
| Shell | Electron | 30.x |
| Frontend | React | 18.x |
| Build tool | Vite | 5.x |
| Styling | Tailwind CSS | 4.x |
| Icons | lucide-react | 0.383+ |
| Charts | Recharts | 2.x |
| UI components | shadcn/ui | latest |
| Backend | Python | 3.11+ |
| Data processing | pandas, numpy, rapidfuzz, openpyxl | latest |
| Database | SQLite3 (Python built-in) | — |
| AI | Ollama (local) | latest |
| File parsing | pdfplumber, python-docx | latest |
| IPC | Electron IPC + Python child process (JSON over stdin/stdout) |
| Packaging | electron-builder | latest |

---

## File Structure

```
steadfast-profit-forecaster/
├── package.json
├── electron/
│   ├── main.ts                    # Electron main process
│   ├── preload.ts                 # Secure IPC bridge
│   └── python-bridge.ts           # Spawns + manages Python subprocess
├── src/
│   ├── main.tsx                   # React entry
│   ├── App.tsx                    # Router + shell
│   ├── styles/
│   │   ├── theme.css              # Steadfast design tokens
│   │   ├── tailwind.css
│   │   └── fonts.css
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Shell.tsx
│   │   ├── data-import/
│   │   │   ├── ImportWizard.tsx
│   │   │   ├── FileDropZone.tsx
│   │   │   └── ImportStatus.tsx
│   │   ├── project-history/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectDetail.tsx
│   │   │   └── ProfitBadge.tsx
│   │   ├── forecast/
│   │   │   ├── NotesInput.tsx
│   │   │   ├── MatchResults.tsx
│   │   │   ├── ForecastCard.tsx
│   │   │   ├── RiskFlags.tsx
│   │   │   └── ScopeBuilder.tsx
│   │   └── dashboard/
│   │       ├── Overview.tsx
│   │       ├── ClientBreakdown.tsx
│   │       └── TrendChart.tsx
│   └── lib/
│       ├── ipc.ts                 # Frontend IPC helpers
│       ├── types.ts               # Shared TypeScript types
│       └── format.ts              # Currency, date, percentage formatters
├── python/
│   ├── main.py                    # Entry — listens for IPC commands via stdin
│   ├── config.py                  # Rate card, thresholds, constants
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── excel_parser.py
│   │   ├── timely_parser.py
│   │   └── notes_parser.py
│   ├── reconciliation/
│   │   ├── __init__.py
│   │   ├── matcher.py
│   │   ├── scorer.py
│   │   └── classifier.py
│   ├── profitability/
│   │   ├── __init__.py
│   │   ├── calculator.py
│   │   └── role_breakdown.py
│   ├── forecast/
│   │   ├── __init__.py
│   │   ├── project_matcher.py
│   │   ├── similarity_scorer.py
│   │   ├── scenario_builder.py
│   │   └── risk_flagger.py
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── ollama_client.py
│   │   └── prompts.py
│   ├── db/
│   │   ├── __init__.py
│   │   ├── schema.py
│   │   ├── migrations.py
│   │   └── queries.py
│   └── requirements.txt
├── data/
│   └── .gitkeep
├── scripts/
│   ├── setup-ollama.sh
│   └── dev.sh
└── build/
    └── entitlements.mac.plist
```

---

## Database Schema (SQLite)

Create this schema exactly. Do not rename columns or change types.

```sql
CREATE TABLE clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_normalized TEXT NOT NULL,
    industry TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    name TEXT NOT NULL,
    project_type TEXT,
    design_level TEXT,
    content_complexity TEXT,
    graphic_complexity TEXT,
    has_regulatory_review BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    invoice_number TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    customer_name TEXT,
    customer_name_normalized TEXT,
    invoice_date DATE,
    due_date DATE,
    total REAL NOT NULL,
    balance REAL DEFAULT 0,
    status TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_number TEXT,
    client_id INTEGER REFERENCES clients(id),
    customer_name TEXT,
    customer_name_normalized TEXT,
    payment_date DATE,
    amount REAL NOT NULL,
    payment_mode TEXT,
    reference_number TEXT,
    notes TEXT,
    deposit_to TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payment_invoice_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    payment_id INTEGER NOT NULL REFERENCES payments(id),
    invoice_id INTEGER NOT NULL REFERENCES invoices(id),
    match_level INTEGER,
    match_score INTEGER,
    variance REAL DEFAULT 0,
    flag TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE time_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER REFERENCES projects(id),
    client_id INTEGER REFERENCES clients(id),
    user_name TEXT,
    role TEXT NOT NULL,
    hours REAL NOT NULL,
    date DATE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_profitability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    total_revenue REAL,
    strategy_hours REAL DEFAULT 0,
    strategy_cost REAL DEFAULT 0,
    design_hours REAL DEFAULT 0,
    design_cost REAL DEFAULT 0,
    development_hours REAL DEFAULT 0,
    development_cost REAL DEFAULT 0,
    content_hours REAL DEFAULT 0,
    content_cost REAL DEFAULT 0,
    am_hours REAL DEFAULT 0,
    am_cost REAL DEFAULT 0,
    total_cost REAL,
    profit REAL,
    margin REAL,
    scope_variance REAL,
    over_under TEXT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forecasts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    raw_notes TEXT,
    parsed_characteristics TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forecast_comparables (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forecast_id INTEGER NOT NULL REFERENCES forecasts(id),
    project_id INTEGER NOT NULL REFERENCES projects(id),
    similarity_score INTEGER NOT NULL,
    match_reasons TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE forecast_scenarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    forecast_id INTEGER NOT NULL REFERENCES forecasts(id),
    scenario_type TEXT NOT NULL,
    strategy_hours REAL DEFAULT 0,
    design_hours REAL DEFAULT 0,
    development_hours REAL DEFAULT 0,
    content_hours REAL DEFAULT 0,
    am_hours REAL DEFAULT 0,
    total_hours REAL,
    total_cost REAL,
    recommended_price REAL,
    projected_margin REAL,
    assumptions TEXT,
    risk_flags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Rate Card

```python
RATES = {
    "strategy": 225,
    "design": 150,
    "development": 180,
    "content": 140,
    "am": 120,
}
```

These five categories are never bundled. Content is never folded into Design. Development includes QA, handoff, and cross-functional review. AM hours are calculated separately using the AM Hours Scale.

---

## AM Hours Scale

| Total Project Hours | AM Hours |
|--------------------|----------|
| Under 40hrs | 6hrs |
| 40–80hrs | 10hrs |
| 80–160hrs | 16hrs |
| 160–300hrs | 22hrs |
| Over 300hrs | 30hrs |

Modifiers (additive): New client +4hrs, Large committee (5+ stakeholders) +4hrs, Regulatory/MLR review +2hrs, Rush project +3hrs.

---

## Design Tokens (Apply Exactly)

```css
:root {
  --sf-bg: #2d333c;
  --sf-surface: #1e2228;
  --sf-surface-raised: #252b33;
  --sf-border: #3C434C;
  --sf-border-subtle: #33393f;
  --sf-text-primary: #e8eaed;
  --sf-text-secondary: #c8ccd1;
  --sf-text-muted: #8b929a;
  --sf-teal: #55aaaa;
  --sf-teal-mid: #346a71;
  --sf-teal-dark: #29555e;
  --sf-purple: #796f8e;
  --sf-purple-mid: #524168;
  --sf-purple-dark: #45365c;
  --sf-gold: #b19a67;
  --sf-gold-mid: #8f784e;
  --sf-gold-dark: #7e6742;
  --sf-green: #4a9597;
  --sf-red: #c75050;
  --primary: #4a9597;
  --primary-foreground: #ffffff;
  --background: #2d333c;
  --foreground: #e8eaed;
  --card: #1e2228;
  --card-foreground: #e8eaed;
  --muted: #353b44;
  --muted-foreground: #8b929a;
  --border: #3C434C;
  --destructive: #c75050;
  --radius: 0.625rem;
  --chart-1: #4a9597;
  --chart-2: #796f8e;
  --chart-3: #b19a67;
  --chart-4: #55aaaa;
  --chart-5: #c75050;
  --fs-display: clamp(1.25rem, 1.1rem + 0.5vw, 1.75rem);
  --fs-title: clamp(1rem, 0.9rem + 0.3vw, 1.25rem);
  --fs-subtitle: clamp(0.8125rem, 0.78rem + 0.15vw, 0.9375rem);
  --fs-body: clamp(0.6875rem, 0.67rem + 0.1vw, 0.8125rem);
  --fs-caption: clamp(0.625rem, 0.61rem + 0.08vw, 0.75rem);
  --fs-micro: clamp(0.5rem, 0.49rem + 0.05vw, 0.625rem);
}
```

**UI rules:**
- Dark theme only (no light mode)
- Card-based layout always
- Teal for primary actions and positive indicators
- Gold for warnings and caution states
- Red for errors, losses, critical alerts
- Purple for secondary indicators
- Tables use zebra striping with `--sf-surface` and `--sf-surface-raised`
- Charts use `--chart-1` through `--chart-5`
- Border radius: `var(--radius)` on all cards and inputs
- Use shadcn/ui components (Button, Card, Table, Input, Select, Tabs, Dialog, DropdownMenu, Badge, Tooltip, Progress, Skeleton)

---

## IPC Protocol

Electron spawns Python as a child process. Communication uses JSON over stdin/stdout.

**Request format (Electron → Python):**
```json
{"id": 1, "method": "method_name", "params": {"key": "value"}}
```

**Response format (Python → Electron):**
```json
{"id": 1, "result": {}}
```

**Error format:**
```json
{"id": 1, "error": {"code": "ERROR_CODE", "message": "Human-readable message"}}
```

Python reads lines from stdin, processes the request, writes one line of JSON to stdout. Never print anything else to stdout — use stderr for logging.

---

## Profitability Formula

```
cost = (strategy_hours × 225) + (design_hours × 150) + (dev_hours × 180) + (content_hours × 140) + (am_hours × 120)
profit = revenue - cost
margin = profit / revenue (if revenue > 0, else 0)
```

---

## Sidebar Navigation (5 Routes)

| Route | Icon | Label |
|-------|------|-------|
| `/` | LayoutDashboard | Dashboard |
| `/projects` | Briefcase | Projects |
| `/forecast` | Target | New Forecast |
| `/import` | Upload | Import Data |
| `/settings` | Settings | Settings |
