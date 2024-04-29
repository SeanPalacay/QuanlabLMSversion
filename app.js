const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 720,
    show: false,
    fullscreen: true,
    icon: __dirname + '/icon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    }
  })
  win.maximize();
  win.setMenuBarVisibility(false)
  // win.loadURL ('http://10.0.0.200:8080/quanlab/')
  win.loadFile(__dirname + '/dist/quanlab/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})