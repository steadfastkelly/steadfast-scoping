# Phase 1: Scaffold

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Goal:** An empty Electron app that launches on macOS, shows a sidebar with 5 navigation items, routes between blank screens, and spawns a Python subprocess that responds to a health check.

**Estimated effort:** 1 day

---

## Step-by-Step Instructions

### 1.1 Initialize the project

Create a new directory called `steadfast-profit-forecaster`. Initialize it as both a Node.js and Python project.

```bash
mkdir steadfast-profit-forecaster
cd steadfast-profit-forecaster
npm init -y
mkdir -p electron src/styles src/components/ui src/components/layout src/lib python/db python/ingestion python/reconciliation python/profitability python/forecast python/ai data scripts build
```

### 1.2 Install Node dependencies

```bash
npm install react react-dom react-router lucide-react recharts
npm install -D typescript vite @vitejs/plugin-react electron electron-builder tailwindcss postcss autoprefixer @types/react @types/react-dom
```

Install shadcn/ui components: Button, Card, Table, Input, Select, Tabs, Badge, Tooltip, Progress, Skeleton, Separator, ScrollArea, Sheet. Follow shadcn/ui init for Vite + React.

### 1.3 Create Python environment

```bash
cd python
python3 -m venv .venv
source .venv/bin/activate
pip install pandas numpy rapidfuzz openpyxl pdfplumber python-docx httpx
pip freeze > requirements.txt
cd ..
```

### 1.4 Copy Steadfast design tokens

Create `src/styles/theme.css` with the exact CSS from `00-FOUNDATION.md` (Design Tokens section). Create `src/styles/tailwind.css` with Tailwind directives. Create `src/styles/fonts.css` importing system fonts.

### 1.5 Build the Electron main process

Create `electron/main.ts`:
- Open a BrowserWindow (1280×800 default, resizable)
- Load the Vite dev server URL in development, or the built HTML in production
- Set `webPreferences.preload` to the preload script
- Set `webPreferences.contextIsolation: true` and `nodeIntegration: false`

Create `electron/preload.ts`:
- Expose a `window.api` object using `contextBridge.exposeInMainWorld`
- Expose one method: `invoke(method: string, params?: object): Promise<any>`
- This method uses `ipcRenderer.invoke("python-call", { method, params })`

Create `electron/python-bridge.ts`:
- Export a function `startPython()` that spawns `python3 python/main.py` as a child process
- Reads stdout line by line, parses JSON responses
- Maintains a map of pending request IDs to resolve/reject callbacks
- Export a function `callPython(method: string, params: object): Promise<any>` that writes a JSON request to stdin and returns a promise
- In `main.ts`, register an IPC handler: `ipcMain.handle("python-call", (event, { method, params }) => callPython(method, params))`

### 1.6 Build the Python entry point

Create `python/main.py`:
```python
import sys
import json

def handle_request(request):
    method = request.get("method")
    params = request.get("params", {})

    if method == "health_check":
        return {"status": "ok", "python_version": sys.version}
    else:
        return {"error": {"code": "UNKNOWN_METHOD", "message": f"Unknown method: {method}"}}

def main():
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            request = json.loads(line)
            request_id = request.get("id")
            result = handle_request(request)
            if "error" in result:
                response = {"id": request_id, "error": result["error"]}
            else:
                response = {"id": request_id, "result": result}
            sys.stdout.write(json.dumps(response) + "\n")
            sys.stdout.flush()
        except Exception as e:
            error_response = {"id": None, "error": {"code": "INTERNAL_ERROR", "message": str(e)}}
            sys.stdout.write(json.dumps(error_response) + "\n")
            sys.stdout.flush()

if __name__ == "__main__":
    main()
```

### 1.7 Build the React shell

Create `src/main.tsx` — standard React DOM render.

Create `src/App.tsx`:
- Use `react-router` with `createHashRouter` (hash router works better in Electron)
- 5 routes: `/`, `/projects`, `/forecast`, `/import`, `/settings`
- Each route renders a `Shell` wrapper with a `Sidebar` and a content area

Create `src/components/layout/Sidebar.tsx`:
- Fixed left sidebar, 240px wide
- Dark background (`var(--sidebar)` → `#232830`)
- App name "Profit Forecaster" at top with a small teal accent
- 5 navigation items using Lucide icons (see Foundation doc for icon mapping)
- Active route gets teal highlight background
- Bottom of sidebar: small "Steadfast" label in muted text

Create `src/components/layout/Shell.tsx`:
- Flex layout: sidebar on left, content area fills remaining space
- Content area has padding (24px) and scrolls independently
- Background: `var(--sf-bg)`

Create 5 placeholder page components:
- `src/components/dashboard/Overview.tsx` — shows "Dashboard" heading
- `src/components/project-history/ProjectList.tsx` — shows "Projects" heading
- `src/components/forecast/NotesInput.tsx` — shows "New Forecast" heading
- `src/components/data-import/ImportWizard.tsx` — shows "Import Data" heading
- A Settings page component — shows "Settings" heading

Each placeholder should be a centered Card component with the page title and a muted description of what will go there.

### 1.8 Create dev script

Create `scripts/dev.sh`:
```bash
#!/bin/bash
# Start Python backend and Electron frontend together
cd "$(dirname "$0")/.."
source python/.venv/bin/activate
npm run dev
```

Configure `package.json` scripts:
- `"dev"`: starts Vite + Electron in dev mode
- `"build"`: builds for production

### 1.9 Create `python/config.py`

```python
RATES = {
    "strategy": 225,
    "design": 150,
    "development": 180,
    "content": 140,
    "am": 120,
}

AM_HOURS_SCALE = [
    (40, 6),
    (80, 10),
    (160, 16),
    (300, 22),
    (float("inf"), 30),
]

AM_MODIFIERS = {
    "new_client": 4,
    "large_committee": 4,
    "regulatory_review": 2,
    "rush": 3,
}

DATE_WINDOW_DAYS = 60
FUZZY_THRESHOLD = 85
DEFAULT_TARGET_MARGIN = 0.35
```

---

## Verification Checklist

Before moving to Phase 2, confirm ALL of the following:

- [ ] Running `npm run dev` opens an Electron window with the app
- [ ] The sidebar shows 5 navigation items with correct icons
- [ ] Clicking each sidebar item navigates to a different page
- [ ] The active sidebar item is highlighted in teal
- [ ] The app uses the dark Steadfast theme (dark background, light text)
- [ ] Opening the Electron DevTools console shows no errors
- [ ] The Python process starts (check terminal output for "Python bridge started" or similar)
- [ ] Calling `window.api.invoke("health_check")` from the DevTools console returns `{"status": "ok", "python_version": "..."}`

**If any check fails:** Copy the exact error message and give it back to Codex with the instruction "Fix this error. Do not change anything else."

**When all checks pass:** Tell Codex "Phase 1 is verified. Stop here." Then give it Phase 2.
