# Phase 1 Plan — Electron + React + Python Scaffold

## Selected Decisions
- **Target platform:** macOS first.
- **Python service stack:** FastAPI + Uvicorn.
- **Renderer:** Keep CRA during Phase 1 to avoid migration risk while core ingestion/reconciliation features are scaffolded.

## Goal
Establish a production-friendly desktop architecture that supports:
- React UI for analyst workflows
- Electron desktop shell for local file access and app packaging
- Python service for ingestion, reconciliation, profitability logic, and forecasting

## Product Direction Update (Creative Director Focus)
Using the product-philosopher lens (JTBD + Stoicism + Phenomenology), the leadership surface now centers on one job:

> **"Help the creative director keep the design team aligned, protected from feedback chaos, and on-quality under deadline pressure."**

### Scope boundary for this pass
- Prioritize **design team management** over finance control-room messaging.
- Minimize decision clutter: show only team load, quality risks, and weekly actions.
- Anchor workload decisions in **live ClickUp scheduling data** instead of internal assumptions only.

### UX and integration changes in this pass
1. **Renamed app shell to `Creative Director Hub`** with sprint language (`Balanced Delivery`, `Launch Push`).
2. **Added `ClickUpWorkloadCard`**
   - Collects Team ID, optional List IDs, horizon window, and token (or env-token fallback).
   - Calls backend `/workload/clickup` endpoint and shows open/overdue pressure and at-risk assignees.
3. **Extended `CreativeDirectorCommandCenter`**
   - Uses ClickUp overdue pressure to amplify risk messaging and weekly leadership actions.
4. **Refined checklist content** into a `Creative Alignment Checklist` focused on approval clarity, feedback consolidation, and design-system handoff discipline.

### Responsive assessment and fixes (this update)
- Added a shared compact-screen hook (`useIsCompact`) to centralize stacking behavior around mobile widths.
- Converted mode-toggle and sync actions to full-width buttons on compact screens to prevent awkward multi-line labels.
- Enforced safe wrapping (`wordBreak`) for long list items and warning text to avoid text truncation.
- Switched key metric blocks and workload rows to column stacks on compact screens to prevent overflow and clipped values.

## Implemented Scaffold
1. `electron/main.js`
   - Creates desktop window
   - Manages Python backend subprocess lifecycle
   - Exposes IPC handlers: selectFile, startBackend, stopBackend, backendStatus
2. `electron/preload.js`
   - Exposes secure `window.desktop` bridge to renderer
3. `python_service/`
   - FastAPI app with Phase 1 endpoints:
     - `GET /health`
     - `POST /ingest/{source}`
     - `POST /reconcile/run`
     - `POST /workload/clickup`
     - `POST /profitability/run`
     - `POST /forecast/run`
4. React integration
   - Added ClickUp workload sync card
   - Added creative director command center with ClickUp-aware alerts
   - Updated top-level app framing and scenario controls

## Remaining Phase 1 Checklist
- Replace static planning defaults with project-specific input form
- Add designer-level assignment controls (per person, not just role)
- Add ClickUp webhook ingestion for near-real-time workload updates
- Add local persistence strategy decision (SQLite vs file-based snapshots)
- Add macOS packaging path (electron-builder/electron-forge)

## Next Logical Checkpoint
Map ClickUp users to agency role taxonomy (Design, Content, Strategy, AM) and persist weekly snapshots so creative directors can track team load trends and intervene before quality drops.
