import { useState, useEffect } from 'react'

export default function Bubble(): React.JSX.Element | null {
  const [highlightedText, setHighlightedText] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const unsubscribe = window.electronAPI.onHighlight((text: string) => {
      setHighlightedText(text)
      setIsExpanded(false)
    })

    const resetListener = window.electronAPI.onResetBubble(() => {
      setHighlightedText('')
      setIsExpanded(false)
    })

    // When the component unmounts, React calls this to destroy the listener
    return () => {
      unsubscribe()
      resetListener()
    }
  }, [])

  if (!highlightedText) return null // Render nothing if no text

  const handleExpand = (): void => {
    setIsExpanded(true)
    window.electronAPI.resizeWindow(400, 300)
  }

  return (
    <>
      <div
        onClick={handleExpand}
        className="bg-black text-white p-2 rounded-full cursor-pointer shadow-lg"
      >
        {isExpanded ? (
          <div className="p-4">
            <h3 className="font-bold mb-2">You highlighted:</h3>
            <p className="text-sm text-slate-300">{highlightedText}</p>
            {/* This is where your AI response will eventually go */}
          </div>
        ) : (
          <div
            className="w-12.5 h-12.5 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors"
          >
            ✨
          </div>
        )}
      </div>
    </>
  )
}
