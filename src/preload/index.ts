import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)

    contextBridge.exposeInMainWorld('electronAPI', {
      onHighlight: (callback) => {
        const subscription = (_event, text): void => callback(text)
        ipcRenderer.on('on-highlight', subscription)

        // Return a function that removes this specific listener, preventing memory leaks if the component unmounts
        return () => ipcRenderer.removeListener('on-highlight', subscription)
      },
      onResetBubble: (callback) => {
        const subscription = (_event, args): void => callback(args)
        ipcRenderer.on('on-reset-bubble', subscription)

        return () => ipcRenderer.removeListener('on-reset-bubble', subscription)
      },
      resizeWindow: (width: number, height: number) => {
        ipcRenderer.send('on-resize-window', width, height)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
