const { app, BrowserWindow } = require('electron');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 860,
    resizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(distDir, 'index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on('window-all-closed', () => {
  app.quit();
});
