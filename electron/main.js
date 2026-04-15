const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;

function resolvePythonCommand() {
  return process.env.PYTHON_BIN || 'python3';
}

function resolveBackendEntry() {
  return path.join(__dirname, '..', 'python_service', 'main.py');
}

function startPythonBackend() {
  if (pythonProcess) {
    return { running: true, pid: pythonProcess.pid || null };
  }

  const pythonCommand = resolvePythonCommand();
  const backendEntry = resolveBackendEntry();

  pythonProcess = spawn(pythonCommand, [backendEntry], {
    stdio: 'pipe',
    env: {
      ...process.env,
      PYTHONUNBUFFERED: '1',
      PORT: process.env.BACKEND_PORT || '8765',
    },
  });

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[python] ${data}`.trim());
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[python] ${data}`.trim());
  });

  pythonProcess.on('close', (code) => {
    console.log(`Python backend exited with code ${code}`);
    pythonProcess = null;
  });

  return { running: true, pid: pythonProcess.pid || null };
}

function stopPythonBackend() {
  if (!pythonProcess) {
    return { running: false };
  }

  pythonProcess.kill();
  pythonProcess = null;

  return { running: false };
}

async function handleSelectFile() {
  if (!mainWindow) {
    return { canceled: true, filePaths: [] };
  }

  return dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Data Files', extensions: ['csv', 'xlsx', 'xls', 'json'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const startUrl = process.env.ELECTRON_START_URL;

  if (startUrl) {
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'build', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('desktop:selectFile', handleSelectFile);
  ipcMain.handle('desktop:startBackend', () => startPythonBackend());
  ipcMain.handle('desktop:stopBackend', () => stopPythonBackend());
  ipcMain.handle('desktop:backendStatus', () => ({
    running: Boolean(pythonProcess),
    pid: pythonProcess?.pid || null,
  }));

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopPythonBackend();

  if (process.platform !== 'darwin') {
    app.quit();
  }
});
