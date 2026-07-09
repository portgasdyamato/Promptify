const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, Tray, Menu } = require('electron');
const path = require('path');
const { exec } = require('child_process');

app.disableHardwareAcceleration();

let fullAppWindow;
let widgetWindow;
let tray;
let db;

function createFullAppWindow() {
  if (fullAppWindow) {
    if (fullAppWindow.isMinimized()) fullAppWindow.restore();
    fullAppWindow.show();
    fullAppWindow.focus();
    return;
  }

  fullAppWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    fullAppWindow.loadURL('http://localhost:5173#/');
  } else {
    fullAppWindow.loadFile(path.join(__dirname, '../dist/public/index.html'), { hash: '/' });
  }

  fullAppWindow.once('ready-to-show', () => {
    fullAppWindow.show();
  });

  fullAppWindow.on('closed', () => {
    fullAppWindow = null;
  });
}

function createWidgetWindow() {
  if (widgetWindow) return;

  widgetWindow = new BrowserWindow({
    width: 800,
    height: 120,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    focusable: false,       // ← THE KEY FIX: window cannot steal focus, ever
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    widgetWindow.loadURL('http://localhost:5173#/widget');
  } else {
    widgetWindow.loadFile(path.join(__dirname, '../dist/public/index.html'), { hash: '/widget' });
  }

  // Do not destroy the widget window on close, just hide it
  widgetWindow.on('close', (e) => {
    e.preventDefault();
    widgetWindow.hide();
  });
}

function pasteViaClipboard() {
  // Target app STILL has focus (VoXa can't steal it), so Ctrl+V goes directly there
  const script = `
Add-Type -AssemblyName System.Windows.Forms;
Start-Sleep -Milliseconds 100;
[System.Windows.Forms.SendKeys]::SendWait('^v');
  `.trim();

  exec(`powershell -NoProfile -Command "${script.replace(/\n/g, ' ')}"`, (err) => {
    if (err) console.error('[VoXa] Paste failed:', err);
    else console.log('[VoXa] Pasted successfully');
  });
}

app.whenReady().then(() => {
  createWidgetWindow();
  
  // Create system tray
  const trayIconPath = path.join(__dirname, '../logo.png');
  tray = new Tray(trayIconPath);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open Full Application',
      click: () => {
        createFullAppWindow();
      }
    },
    {
      label: 'Open Widget',
      click: () => {
        if (widgetWindow) {
          widgetWindow.show();
          widgetWindow.webContents.send('auto-start-listening');
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Quit', 
      click: () => { 
        app.isQuitting = true; 
        if (widgetWindow) widgetWindow.destroy();
        if (fullAppWindow) fullAppWindow.destroy();
        app.quit(); 
      } 
    }
  ]);
  tray.setToolTip('Promptify — Press Ctrl+Shift+V to activate widget');
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    createFullAppWindow();
  });

  // Register Ctrl+Shift+V to toggle widget
  const shortcut = 'CommandOrControl+Shift+V';
  const ret = globalShortcut.register(shortcut, () => {
    if (widgetWindow && widgetWindow.isVisible()) {
      widgetWindow.hide();
    } else if (widgetWindow) {
      widgetWindow.show();
      widgetWindow.webContents.send('auto-start-listening');
    }
  });

  if (!ret) console.error('[VoXa] Shortcut registration failed:', shortcut);

  // Initial display
  widgetWindow.show();
  createFullAppWindow();

  // IPC: Paste generated text
  ipcMain.on('inject-text', (event, text) => {
    clipboard.writeText(text);

    if (widgetWindow) widgetWindow.hide();

    // Small delay, then paste into whatever is focused
    setTimeout(() => pasteViaClipboard(), 300);
  });

  // SQLite history
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(app.getPath('userData'), 'voxa_history.sqlite');
  db = new sqlite3.Database(dbPath);

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_prompt TEXT,
      optimized_prompt TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });

  ipcMain.handle('save-history', (event, original, optimized) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO history (original_prompt, optimized_prompt) VALUES (?, ?)',
        [original, optimized],
        function (err) { if (err) reject(err); else resolve(this.lastID); }
      );
    });
  });

  ipcMain.handle('get-history', () => {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM history ORDER BY timestamp DESC LIMIT 50', [], (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
  });

  ipcMain.on('hide-widget', () => {
    if (widgetWindow) widgetWindow.hide();
  });

  app.on('activate', () => {
    if (!fullAppWindow) createFullAppWindow();
  });
});

app.on('window-all-closed', (e) => {
  // Prevent quitting when windows are closed, keeping it in the background/tray
  e.preventDefault();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  if (db) db.close();
});
