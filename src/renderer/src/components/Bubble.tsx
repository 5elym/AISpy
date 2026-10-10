import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

  if (!highlightedText) return null

  const handleExpand = (): void => {
    if (isExpanded) return
    setIsExpanded(true)
    window.electronAPI.resizeWindow(400, 300)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <motion.button
        type="button"
        onClick={handleExpand}
        initial={{ width: 50, height: 50, borderRadius: 25, scale: 0, opacity: 0 }}
        animate={{
          width: isExpanded ? 400 : 50,
          height: isExpanded ? 300 : 50,
          borderRadius: isExpanded ? 20 : 25,
          scale: isExpanded ? 1 : [0, 1.18, 0.9, 1],
          opacity: 1
        }}
        transition={{
          width: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
          height: { duration: 0.5, ease: [0.2, 0.8, 0.2, 1] },
          borderRadius: { duration: 0.5, ease: 'easeOut' },
          scale: { duration: 0.7, ease: [0.2, 0.8, 0.25, 1.2] },
          opacity: { duration: 0.2 }
        }}
        aria-label={isExpanded ? 'Highlighted text' : 'Expand highlighted text'}
        aria-expanded={isExpanded}
        className="flex shrink-0 cursor-pointer items-center justify-center overflow-hidden border border-white/20 bg-slate-950/95 p-0 text-white shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300"
      >
        {isExpanded ? (
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: 0.15
            }}
            className="block h-full w-full overflow-auto p-6 text-left"
          >
            <span className="mb-3 block text-lg font-semibold">You highlighted:</span>
            <span className="block overflow-wrap-anywhere text-sm text-slate-300">
              {highlightedText}
            </span>
          </motion.span>
        ) : (
          <motion.span
            animate={{ scale: [1, 1.06, 0.97, 1] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            aria-hidden="true"
            className="flex h-full w-full items-center justify-center text-[22px]"
          >
            👁️
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}
