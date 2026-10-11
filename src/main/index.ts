import { app, shell, BrowserWindow, ipcMain, screen } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

import SelectionHook from 'selection-hook'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 50,
    height: 50,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    autoHideMenuBar: true,
    backgroundColor: '#00000000',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  // mainWindow.on('ready-to-show', () => {
  //   mainWindow.show()
  // })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  const selectionHook = new SelectionHook()

  // Start monitoring the entire OS for text selections
  selectionHook.start()

  selectionHook.on('text-selection', (data) => {
    if (data.text) {
      let targetX, targetY

      // Use selectionHook coordinates first, falllback to cursor position if not available
      if (data.endBottom && data.endBottom.x && data.endBottom.y) {
        targetX = data.endBottom.x
        targetY = data.endBottom.y
      } else {
        const cursor = screen.getCursorScreenPoint()
        targetX = cursor.x + 15 // Offset so it doesn't block the cursor
        targetY = cursor.y + 15
      }

      // Move the bubble to where the highlight ended
      mainWindow.setBounds({
        x: targetX,
        y: targetY,
        width: 75,
        height: 75
      })

      // Send the text to React via IPC so it knows what was highlighted
      mainWindow.webContents.send('on-highlight', data.text)

      // Show the bubble
      mainWindow.show()
    }
  })

  mainWindow.on('blur', () => {
    mainWindow.webContents.send('on-reset-bubble')
    mainWindow.setSize(75, 75)
    mainWindow.hide()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC listeners for communication between main and renderer processes
  ipcMain.on('ping', () => console.log('pong'))
  ipcMain.on('on-resize-window', (event, width, height) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win && Number.isFinite(width) && Number.isFinite(height) && width > 0 && height > 0) {
      const bounds = win.getBounds()
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y + bounds.height / 2
      win.setBounds({
        x: Math.round(centerX - width / 2),
        y: Math.round(centerY - height / 2),
        width,
        height
      })
    }
  })

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
