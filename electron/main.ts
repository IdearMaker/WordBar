import { app, BrowserWindow, ipcMain, screen, Tray, Menu, nativeImage, globalShortcut } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, '../app.log');

function writeLog(msg: string) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logFile, `[${timestamp}] ${msg}\n`);
}

writeLog('Electron process started: pid=' + process.pid + ', argv=' + JSON.stringify(process.argv));

process.on('uncaughtException', (err) => {
  writeLog('UNCAUGHT EXCEPTION: ' + err.stack);
});

function getConfigPaths(): string[] {
  const paths: string[] = [];
  try {
    const userDir = app.getPath('userData');
    paths.push(path.join(userDir, 'wordbar_config.json'));
  } catch {}
  try {
    paths.push(path.join(__dirname, '../wordbar_config.json'));
  } catch {}
  try {
    paths.push(path.join(process.cwd(), 'wordbar_config.json'));
  } catch {}
  return [...new Set(paths)];
}

function loadConfigFromDisk(): any {
  for (const p of getConfigPaths()) {
    try {
      if (fs.existsSync(p)) {
        let raw = fs.readFileSync(p, 'utf-8');
        if (raw.charCodeAt(0) === 0xFEFF) {
          raw = raw.slice(1);
        }
        const parsed = JSON.parse(raw.trim());
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch (err) {
      writeLog('loadConfigFromDisk error for ' + p + ': ' + err);
    }
  }
  return null;
}

function saveConfigToDisk(data: any) {
  for (const p of getConfigPaths()) {
    try {
      const dir = path.dirname(p);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
      writeLog('saveConfigToDisk saved to ' + p);
    } catch (err) {
      writeLog('saveConfigToDisk error for ' + p + ': ' + err);
    }
  }
}

const savedDiskConfig = loadConfigFromDisk();
let userBarHeight = (savedDiskConfig?.theme?.barHeight && typeof savedDiskConfig.theme.barHeight === 'number') 
  ? savedDiskConfig.theme.barHeight 
  : 58;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentHeight = userBarHeight;
let currentMode: 'bar' | 'quiz' | 'modal' = 'bar';
const iconPath = path.join(__dirname, 'logo.png');

function calculateBounds(height: number, targetWidth?: number) {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  
  // By default, match the workArea width (spanning the full width right above the taskbar)
  const width = targetWidth && targetWidth < workArea.width ? targetWidth : workArea.width;
  const x = targetWidth && targetWidth < workArea.width 
    ? Math.round(workArea.x + (workArea.width - targetWidth) / 2)
    : workArea.x;
  
  // workArea.y + workArea.height is the exact top coordinate of the Windows Taskbar!
  const y = workArea.y + workArea.height - height;

  const bounds = { x, y, width, height };
  console.log('calculateBounds: workArea =', JSON.stringify(workArea), 'result =', JSON.stringify(bounds));
  return bounds;
}

function createWindow() {
  const initialBounds = calculateBounds(currentHeight);
  writeLog('createWindow: initialBounds = ' + JSON.stringify(initialBounds));

  mainWindow = new BrowserWindow({
    x: initialBounds.x,
    y: initialBounds.y,
    width: initialBounds.width,
    height: initialBounds.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: true,
    skipTaskbar: false,
    hasShadow: false,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.moveTop();
  mainWindow.show();
  mainWindow.focus();
  writeLog('mainWindow created and show() called');

  mainWindow.webContents.on('did-finish-load', () => {
    writeLog('mainWindow webContents did-finish-load');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    writeLog('Page failed to load: ' + errorCode + ' ' + errorDescription);
  });

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    writeLog(`[Renderer ${level}]: ${message} (${sourceId}:${line})`);
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    writeLog('Loading file: ' + indexPath);
    mainWindow.loadFile(indexPath);
  }

  mainWindow.on('closed', () => {
    writeLog('mainWindow closed event fired');
    mainWindow = null;
  });

  mainWindow.on('unresponsive', () => {
    writeLog('mainWindow unresponsive event fired');
  });

  // Recalculate position if display resolution or taskbar configuration changes
  screen.on('display-metrics-changed', () => {
    if (mainWindow) {
      const bounds = calculateBounds(currentHeight);
      mainWindow.setBounds(bounds);
    }
  });
}

function createTray() {
  try {
    let icon: any;
    if (fs.existsSync(iconPath)) {
      icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    } else {
      icon = nativeImage.createFromBuffer(
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAExJREFUOE9jZKAQMFKon2H4f+p/BiyARd+AY2b8p7P5DA4z/jP8p59bWDA4zEABw4ABxAQg+2kUjDRgmBg/8kE+3R3A4jCGe2AYE1QMACZ0H3EQp2UqAAAAAElFTkSuQmCC',
          'base64'
        )
      );
    }

    tray = new Tray(icon);
    tray.setToolTip('WordBar - 任务栏背单词神器');

    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示/隐藏 WordBar (Ctrl+Alt+H)',
        click: () => {
          if (!mainWindow) return;
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
          }
        },
      },
      {
        label: '置顶显示',
        type: 'checkbox',
        checked: true,
        click: (item) => {
          if (mainWindow) {
            mainWindow.setAlwaysOnTop(item.checked);
          }
        },
      },
      {
        label: '重置位置到任务栏上方',
        click: () => {
          if (mainWindow) {
            const bounds = calculateBounds(currentHeight);
            mainWindow.setBounds(bounds);
          }
        },
      },
      { type: 'separator' },
      {
        label: '退出 WordBar',
        click: () => {
          app.quit();
        },
      },
    ]);

    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
      if (!mainWindow) return;
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    });
    writeLog('createTray succeeded');
  } catch (err) {
    writeLog('createTray warning: ' + err);
  }
}

// IPC Handlers
ipcMain.on('get-initial-config-sync', (event) => {
  event.returnValue = loadConfigFromDisk();
});

ipcMain.handle('get-app-config', () => {
  return loadConfigFromDisk();
});

ipcMain.handle('save-app-config', (_event, newConfig: any) => {
  const existing = loadConfigFromDisk() || {};
  const merged = {
    ...existing,
    ...newConfig,
    ...(newConfig.theme ? {
      theme: {
        ...(existing.theme || {}),
        ...newConfig.theme,
      },
    } : {}),
  };
  saveConfigToDisk(merged);
  if (merged.theme?.barHeight && typeof merged.theme.barHeight === 'number') {
    userBarHeight = merged.theme.barHeight;
  }
  return true;
});

ipcMain.handle('set-window-mode', (_event, mode: 'bar' | 'quiz' | 'modal', customHeight?: number) => {
  if (!mainWindow) return;
  currentMode = mode;

  let height = userBarHeight;
  if (mode === 'quiz') {
    height = customHeight || (userBarHeight + 56);
  } else if (mode === 'modal') {
    height = customHeight || 540;
  } else if (mode === 'bar') {
    if (customHeight && typeof customHeight === 'number') {
      userBarHeight = customHeight;
    }
    height = userBarHeight;
  }

  currentHeight = height;
  const bounds = calculateBounds(height);
  mainWindow.setBounds(bounds, true);
  return bounds;
});

ipcMain.handle('set-bar-height', (_event, height: number) => {
  if (!mainWindow) return;
  userBarHeight = Math.max(42, Math.min(200, Math.round(height)));
  writeLog(`set-bar-height: ${userBarHeight}, mode=${currentMode}`);

  // Persist updated height to disk
  const existing = loadConfigFromDisk() || {};
  existing.theme = { ...existing.theme, barHeight: userBarHeight };
  saveConfigToDisk(existing);

  if (currentMode === 'bar') {
    currentHeight = userBarHeight;
    const bounds = calculateBounds(userBarHeight);
    mainWindow.setBounds(bounds, false);
    return bounds;
  } else if (currentMode === 'quiz') {
    currentHeight = userBarHeight + 56;
    const bounds = calculateBounds(currentHeight);
    mainWindow.setBounds(bounds, false);
    return bounds;
  }
});

ipcMain.handle('toggle-always-on-top', () => {
  if (!mainWindow) return false;
  const isTop = mainWindow.isAlwaysOnTop();
  mainWindow.setAlwaysOnTop(!isTop, 'screen-saver');
  return !isTop;
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('hide-window', () => {
  if (mainWindow) mainWindow.hide();
});

ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('reset-position', () => {
  if (mainWindow) {
    const bounds = calculateBounds(currentHeight);
    mainWindow.setBounds(bounds);
    return bounds;
  }
});

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register Boss-key shortcut Ctrl+Alt+H to toggle visibility
  globalShortcut.register('CommandOrControl+Alt+H', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  writeLog('app will-quit event fired');
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  writeLog('app window-all-closed event fired');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
