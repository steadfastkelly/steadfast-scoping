const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  selectFile: () => ipcRenderer.invoke('desktop:selectFile'),
  startBackend: () => ipcRenderer.invoke('desktop:startBackend'),
  stopBackend: () => ipcRenderer.invoke('desktop:stopBackend'),
  backendStatus: () => ipcRenderer.invoke('desktop:backendStatus'),
});
