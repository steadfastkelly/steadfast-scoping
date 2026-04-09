# Phase 8: Package + Ship

**Give Codex this file + `00-FOUNDATION.md`. Nothing else.**

**Prerequisite:** Phase 7 verified and passing.

**Goal:** Package the app as a .dmg installer for macOS. The resulting app should run on any Mac without requiring the user to install Python, Node.js, or any development tools. Ollama is the only external dependency.

**Estimated effort:** 1 day

---

## Step-by-Step Instructions

### 8.1 Bundle the Python backend

The user does not have Python installed (and should not need to install it). Use PyInstaller to bundle the Python backend into a standalone executable.

```bash
cd python
source .venv/bin/activate
pip install pyinstaller
pyinstaller --onefile --name profit-forecaster-backend main.py \
    --hidden-import pandas \
    --hidden-import numpy \
    --hidden-import rapidfuzz \
    --hidden-import openpyxl \
    --hidden-import pdfplumber \
    --hidden-import docx \
    --hidden-import httpx
```

This produces `python/dist/profit-forecaster-backend` — a single executable.

Update `electron/python-bridge.ts` to:
- In development: spawn `python3 python/main.py`
- In production: spawn the bundled executable from the app's resources directory

### 8.2 Configure electron-builder

Update `package.json` with electron-builder configuration:

```json
{
  "build": {
    "appId": "com.steadfast.profit-forecaster",
    "productName": "Steadfast Profit Forecaster",
    "mac": {
      "category": "public.app-category.business",
      "target": ["dmg"],
      "icon": "build/icon.icns",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist",
      "extraResources": [
        {
          "from": "python/dist/profit-forecaster-backend",
          "to": "python-backend"
        }
      ]
    },
    "dmg": {
      "title": "Steadfast Profit Forecaster",
      "backgroundColor": "#2d333c"
    },
    "directories": {
      "output": "release"
    },
    "files": [
      "dist/**/*",
      "electron/**/*",
      "!python/**/*",
      "!node_modules/**/*"
    ]
  }
}
```

### 8.3 Create macOS entitlements

Create `build/entitlements.mac.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.security.cs.allow-jit</key>
    <true/>
    <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
    <true/>
    <key>com.apple.security.cs.allow-dyld-environment-variables</key>
    <true/>
    <key>com.apple.security.network.client</key>
    <true/>
    <key>com.apple.security.files.user-selected.read-write</key>
    <true/>
</dict>
</plist>
```

The network client entitlement is needed for localhost communication with Ollama.

### 8.4 Create the app icon

Create a simple app icon using the Steadfast brand:
- Background: `#1e2228` (sf-surface)
- Foreground: `#4a9597` (sf-green/primary) — a simple bar chart icon or the letter "P" for Profit
- Export as 512×512 PNG, then convert to .icns using:

```bash
mkdir build/icon.iconset
# Create required sizes
sips -z 16 16 icon.png --out build/icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out build/icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out build/icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out build/icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out build/icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out build/icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out build/icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out build/icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out build/icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out build/icon.iconset/icon_512x512@2x.png
iconutil -c icns build/icon.iconset -o build/icon.icns
```

### 8.5 Update the Python bridge for production

In `electron/python-bridge.ts`, update the spawn logic:

```typescript
import { app } from 'electron';
import path from 'path';

function getPythonPath(): string {
    if (app.isPackaged) {
        // Production: use bundled executable
        return path.join(process.resourcesPath, 'python-backend');
    } else {
        // Development: use Python directly
        return 'python3';
    }
}

function getPythonArgs(): string[] {
    if (app.isPackaged) {
        return []; // bundled executable needs no args
    } else {
        return [path.join(__dirname, '..', 'python', 'main.py')];
    }
}
```

### 8.6 Handle the data directory in production

The SQLite database needs a persistent location:

```typescript
import { app } from 'electron';
import path from 'path';

const DATA_DIR = path.join(app.getPath('userData'), 'data');
```

This puts the database in `~/Library/Application Support/Steadfast Profit Forecaster/data/` — the standard macOS location for app data.

Pass the data directory to the Python process as an environment variable or startup argument:
```typescript
const pythonProcess = spawn(getPythonPath(), getPythonArgs(), {
    env: { ...process.env, DATA_DIR: DATA_DIR }
});
```

In `python/main.py`, read it:
```python
import os
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
DB_PATH = os.path.join(DATA_DIR, "steadfast.db")
```

### 8.7 Build the .dmg

```bash
# Build the React frontend
npm run build

# Build the Python backend
cd python && source .venv/bin/activate && pyinstaller --onefile --name profit-forecaster-backend main.py [hidden imports] && cd ..

# Build the Electron app + .dmg
npx electron-builder --mac
```

The .dmg will be in the `release/` directory.

### 8.8 Write the README / Setup Guide

Create a `README.md` in the project root that the user sees when they open the .dmg or look at the app:

```markdown
# Steadfast Profit Forecaster

## First-Time Setup

1. **Drag the app to your Applications folder** (standard macOS install)

2. **Install Ollama** (required for the AI forecasting feature):
   - Download from https://ollama.ai
   - Install and open it
   - Open Terminal and run: `ollama pull llama3.1:8b`
   - Wait for the download to complete (~4.7GB)
   - Ollama runs in the background automatically after this

3. **Open Steadfast Profit Forecaster** from Applications

4. **Import your data** (go to Import Data in the sidebar):
   - Upload your Invoice Excel sheet (.xlsx)
   - Upload your Payment Excel sheet (.xlsx)
   - Upload your Timely CSV export (.csv)
   - Click "Run Reconciliation"
   - Click "Auto-Generate Projects"

5. **Start forecasting** (go to New Forecast in the sidebar):
   - Paste meeting notes or upload a document
   - Click "Analyze Notes"
   - Review comparable projects and forecast scenarios

## Where is my data stored?

All data is stored locally on your Mac at:
~/Library/Application Support/Steadfast Profit Forecaster/

To back up your data, go to Settings → Export Database.

## Troubleshooting

**"Backend connection lost"**
- Restart the app. If the problem persists, check Activity Monitor for the "profit-forecaster-backend" process.

**"Ollama is not running"**
- Open the Ollama app from your Applications folder
- Or run `ollama serve` in Terminal

**"No comparable projects found"**
- Import more historical data. The forecasting engine needs past projects to compare against.
```

### 8.9 Test on a clean Mac

The final verification must happen on a Mac that has never had this app installed:

1. Copy the .dmg to the test Mac
2. Double-click to mount
3. Drag app to Applications
4. Install Ollama and pull the model
5. Open the app
6. Import sample data
7. Run the full workflow through to a saved forecast

---

## Verification Checklist

This is the FINAL checklist. Confirm ALL of the following:

- [ ] The .dmg file is produced in the release/ directory
- [ ] Double-clicking the .dmg mounts it and shows the app icon
- [ ] Dragging to Applications installs the app
- [ ] The app opens from Applications without any "developer cannot be verified" error (or if it appears, right-click → Open works)
- [ ] The app creates its data directory in ~/Library/Application Support/
- [ ] The Python backend starts without requiring Python to be installed on the system
- [ ] All 5 sidebar screens load correctly
- [ ] Importing real Excel files and Timely CSVs works
- [ ] Reconciliation runs and produces reasonable results
- [ ] Projects are generated with correct profitability
- [ ] Dashboard shows correct aggregate data
- [ ] Pasting meeting notes and running a forecast produces comparable projects and three scenarios
- [ ] Saving a forecast persists it
- [ ] Settings changes persist after restarting the app
- [ ] Quitting and reopening the app retains all data
- [ ] The app does not crash during any normal workflow

**When all checks pass:** The MVP is complete. Ship it.
