/// <reference types="vite/client" />

interface Window {
  electronAPI: {
    onHighlight: (callback: (text: string) => void) => () => void
    onResetBubble: (callback: () => void) => () => void
    resizeWindow: (width: number, height: number) => void
  }
}
