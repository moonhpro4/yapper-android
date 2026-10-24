const { app, BrowserWindow, Menu, shell, session } = require('electron');
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

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 480,
    minHeight: 600,
    fullscreen: true,
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
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
  });

  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
