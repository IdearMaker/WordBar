const { contextBridge, ipcRenderer } = require('electron');

let initialConfig = null;
try {
  initialConfig = ipcRenderer.sendSync('get-initial-config-sync');
} catch (e) {
  // fallback
}

const api = {
  setWindowMode: (mode, customHeight) => ipcRenderer.invoke('set-window-mode', mode, customHeight),
  toggleAlwaysOnTop: () => ipcRenderer.invoke('toggle-always-on-top'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  closeApp: () => ipcRenderer.invoke('close-app'),
  resetPosition: () => ipcRenderer.invoke('reset-position'),
  setBarHeight: (height) => ipcRenderer.invoke('set-bar-height', height),
  getAppConfig: () => ipcRenderer.invoke('get-app-config'),
  saveAppConfig: (config) => ipcRenderer.invoke('save-app-config', config),
  initialConfig,
};

contextBridge.exposeInMainWorld('electronAPI', api);
