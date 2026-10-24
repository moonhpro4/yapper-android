const { app, BrowserWindow, Menu, shell, session, dialog } = require('electron');
const path = require('path');

const HOME_URL = 'https://www.yapper.website/';
const HOST = 'yapper.website';

app.setName('Yapper');

function isYapper(u) {
  try {
    const h = new URL(u).hostname.toLowerCase();
    return h === HOST || h.endsWith('.' + HOST);
  } catch (e) {
    return false;
  }
}

function openExternal(u) {
  try {
    const p = new URL(u).protocol;
    if (p === 'http:' || p === 'https:' || p === 'mailto:') shell.openExternal(u);
  } catch (e) { /* ignore */ }
}

let win = null;

// ---- Update check ----
// Version of this build (read from package.json). Keep it equal to the version
// your update endpoint reports as "current" so users are not prompted needlessly.
const CURRENT_VERSION = app.getVersion();
const UPDATE_URL = 'https://9f9efa9f-a27b-4bd4-a503-02ea9ba910d5.lovableproject.com/msrp/cf8e0965660857c79524bea7';
let updatePrompted = false;
let updateTimer = null;

async function checkForUpdate() {
  if (updatePrompted) return;
  try {
    const res = await fetch(UPDATE_URL, { cache: 'no-store' });
    const d = await res.json();
    if (d && d.update && d.update.version !== CURRENT_VERSION) {
      updatePrompted = true;
      clearInterval(updateTimer);
      const notes = d.update.notes ? '\n\n' + d.update.notes : '';
      const opts = {
        type: 'info',
        title: 'Yapper',
        message: 'Yapper has a brand new update!',
        detail: 'New features and fixed bugs. It is recommended to install.' + notes,
        buttons: ['Download now', 'Later'],
        defaultId: 0,
        cancelId: 1,
        noLink: true
      };
      const { response } = (win && !win.isDestroyed())
        ? await dialog.showMessageBox(win, opts)
        : await dialog.showMessageBox(opts);
      if (response === 0 && d.update.url) openExternal(d.update.url);
    }
  } catch (e) { /* offline or endpoint unreachable: try again later */ }
}

function startUpdateChecks() {
  checkForUpdate();
  updateTimer = setInterval(checkForUpdate, 60000);
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    fullscreen: process.platform === 'darwin',
    center: true,
    resizable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    show: false,
    title: 'Yapper',
    backgroundColor: '#000000',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true
    }
  });

  // Look like a normal Chrome browser (no "Electron/x" token).
  const ua = win.webContents.userAgent
    .replace(/\sElectron\/\S+/i, '')
    .replace(/\syapper\/\S+/i, '');
  win.webContents.setUserAgent(ua);

  win.once('ready-to-show', () => win.show());
  win.loadURL(HOME_URL);

  win.on('page-title-updated', (e) => { e.preventDefault(); win.setTitle('Yapper'); });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isYapper(url)) win.loadURL(url);
    else openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (e, url) => {
    if (!isYapper(url)) {
      e.preventDefault();
      openExternal(url);
    }
  });

  // F11 toggles full screen
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });

  win.on('closed', () => { win = null; });
}

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });

  app.whenReady().then(() => {
    const allowed = ['media', 'notifications', 'fullscreen', 'clipboard-read',
      'clipboard-sanitized-write', 'display-capture', 'mediaKeySystem'];
    session.defaultSession.setPermissionRequestHandler((wc, permission, cb) => {
      cb(allowed.includes(permission) && isYapper(wc.getURL()));
    });
    session.defaultSession.setPermissionCheckHandler((wc, permission) => {
      return allowed.includes(permission) && (!wc || isYapper(wc.getURL()));
    });

    if (process.platform === 'darwin') {
      Menu.setApplicationMenu(Menu.buildFromTemplate([
        { role: 'appMenu' },
        { role: 'editMenu' },
        { label: 'View', submenu: [{ role: 'reload' }, { role: 'togglefullscreen' }] },
        { role: 'windowMenu' }
      ]));
    } else {
      Menu.setApplicationMenu(null);
    }

    createWindow();
    startUpdateChecks();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
