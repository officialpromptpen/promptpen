import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, RefreshCw, Replace, TriangleAlert, X, ClipboardCopy, CopyCheck } from 'lucide-react'
import { Layout } from '@/components/layout'
import { createProviderAdapter } from '@/features/providers/sdk'
import { ToolbarActions } from '@/features/toolbar/toolbar-actions'
import { useTheme } from "next-themes"
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface ToolbarPosition {
  top: number
  left: number
  visible: boolean
}

const ACTION_PROMPTS: Record<string, string> = {
  grammar:
    'Correct grammar, spelling, and punctuation while preserving the original meaning and tone.',
  rewrite: 'Rewrite the text to be clearer and more polished without changing meaning.',
  improve: 'Improve clarity, structure, and readability without changing intent.',
  shorten: 'Shorten this text while preserving key meaning.',
  expand: 'Expand this text with relevant detail while preserving voice and intent.',
  explain: 'Explain this text in simple, plain language.',
  summarize: 'Summarize this text into concise bullet points with key takeaways.',
  translate: 'Translate this text into clear English.',
  continue: 'Continue this text naturally in the same style, tone, and context.',
}

function createActionPrompt(actionId: string, text: string): string {
  const instruction = ACTION_PROMPTS[actionId] ?? 'Improve this text.'
  return `${instruction}\n\nText:\n"""\n${text}\n"""`
}

export function ContextualToolbar() {
  const [selectedText, setSelectedText] = useState('')
  const [toolbarPos, setToolbarPos] = useState<ToolbarPosition>({
    top: 0,
    left: 0,
    visible: false,
  })
  const [showResult, setShowResult] = useState(false)
  const [processedText, setProcessedText] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [lastActionId, setLastActionId] = useState<string | null>(null)
  const [errorText, setErrorText] = useState('')
  const [copied, setCopied] = useState(false)
  const selectionRangeRef = useRef<Range | null>(null)
  const { resolvedTheme = "light" } = useTheme()


  const calculateToolbarPosition = useCallback((range: Range): ToolbarPosition => {
    const rect = range.getBoundingClientRect()
    const toolbarSize = 100
    const offset = 12
    const minPadding = 8
    const clampedLeft = Math.min(
      window.innerWidth - toolbarSize - minPadding,
      Math.max(minPadding, rect.left + rect.width / 2 - toolbarSize / 2),
    )
    const clampedTop = Math.max(minPadding, rect.top - toolbarSize - offset)

    return {
      top: clampedTop,
      left: clampedLeft,
      visible: true,
    }
  }, [])

  const handleSelection = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      if (!showResult) {
        setToolbarPos((prev) => ({ ...prev, visible: false }))
      }
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      if (!showResult) {
        setToolbarPos((prev) => ({ ...prev, visible: false }))
      }
      return
    }

    const range = selection.getRangeAt(0).cloneRange()
    selectionRangeRef.current = range
    setSelectedText(text)
    setToolbarPos(calculateToolbarPosition(range))
  }, [calculateToolbarPosition, showResult])

  const handleAction = useCallback(
    async (actionId: string) => {
      if (!selectedText.trim() || isRunning) {
        return
      }

      setShowResult(true)
      setToolbarPos((prev) => ({ ...prev, visible: false }))
      setIsRunning(true)
      setActiveActionId(actionId)
      setLastActionId(actionId)
      setProcessedText('')
      setErrorText('')
      setCopied(false)

      try {
        const adapter = await createProviderAdapter()
        if (!adapter) {
          setErrorText('No provider configured. Save provider and API key in Dashboard first.')
          return
        }

        const prompt = createActionPrompt(actionId, selectedText)
        const response = await adapter.runPrompt(
          prompt,
          'You are a writing assistant. Return only the transformed output with no commentary.',
        )

        const normalized = response.trim()
        if (!normalized) {
          setErrorText('The model returned an empty response. Try again with a different model.')
          return
        }

        setProcessedText(normalized)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown AI error'
        if (/extension context invalidated/i.test(message)) {
          setErrorText(
            'Extension was reloaded or updated. Refresh this page, select text again, and retry.',
          )
          return
        }

        setErrorText(`Request failed: ${message}`)
      } finally {
        setIsRunning(false)
        setActiveActionId(null)
      }
    },
    [isRunning, selectedText],
  )

  const handleCopy = useCallback(async () => {
    const textToCopy = processedText || errorText
    if (!textToCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1400)
    } catch {
      // Ignore clipboard failures; user can still manually copy from the result panel.
    }
  }, [errorText, processedText])

  const handleRerun = useCallback(() => {
    if (!lastActionId || isRunning || !selectedText.trim()) {
      return
    }

    void handleAction(lastActionId)
  }, [handleAction, isRunning, lastActionId, selectedText])

  const handleReplace = useCallback(() => {
    const savedRange = selectionRangeRef.current
    if (!processedText || isRunning || errorText) {
      return
    }

    if (!savedRange) {
      setErrorText('Could not replace text because the original selection was lost.')
      return
    }

    try {
      const range = savedRange.cloneRange()
      range.deleteContents()
      const replacementNode = document.createTextNode(processedText)
      range.insertNode(replacementNode)

      const selection = window.getSelection()
      if (selection) {
        const cursorRange = document.createRange()
        cursorRange.setStartAfter(replacementNode)
        cursorRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(cursorRange)
      }

      setShowResult(false)
      setToolbarPos((prev) => ({ ...prev, visible: false }))
      setSelectedText('')
      setProcessedText('')
      setIsRunning(false)
      setActiveActionId(null)
      setLastActionId(null)
      setErrorText('')
      setCopied(false)
      selectionRangeRef.current = null
    } catch {
      setErrorText('Failed to replace text in this area. Select text again and retry.')
    }
  }, [errorText, isRunning, processedText])

  const handleClose = useCallback(() => {
    setShowResult(false)
    setToolbarPos((prev) => ({ ...prev, visible: false }))
    setSelectedText('')
    setProcessedText('')
    setIsRunning(false)
    setActiveActionId(null)
    setLastActionId(null)
    setErrorText('')
    setCopied(false)
    selectionRangeRef.current = null
    window.getSelection()?.removeAllRanges()
  }, [])

  useEffect(() => {
    document.addEventListener('mouseup', handleSelection, true)
    document.addEventListener('keyup', handleSelection, true)
    document.addEventListener('selectionchange', handleSelection, true)

    return () => {
      document.removeEventListener('mouseup', handleSelection, true)
      document.removeEventListener('keyup', handleSelection, true)
      document.removeEventListener('selectionchange', handleSelection, true)
    }
  }, [handleSelection])

  return (
    <Layout variant="inline">
      <AnimatePresence>
        {toolbarPos.visible && !showResult && (
          <motion.div
            data-theme={resolvedTheme}
            className="fixed z-2147483647 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl backdrop-blur-md"
            style={{
              top: `${toolbarPos.top}px`,
              left: `${toolbarPos.left}px`,
            }}
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <ToolbarActions
              onAction={(actionId) => {
                void handleAction(actionId)
              }}
              isLoading={isRunning}
              activeActionId={activeActionId}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result Section */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            data-theme={resolvedTheme}
            className="fixed inset-0 z-2147483647 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <motion.div
              className="mx-4 w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >

            <div className="pt-4">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                Processed Text
              </h2>
              {isRunning && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {activeActionId ? `Processing ${activeActionId}...` : 'Processing...'}
                  </span>
                </div>
              )}

              {!isRunning && errorText && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="whitespace-pre-wrap wrap-break-word">{errorText}</span>
                </div>
              )}

              {!isRunning && !errorText && processedText && (
                <p className="text-base p-3 rounded-md font-medium text-balance">
                  {processedText}
                </p>
              )}
            </div>

            <TooltipProvider delayDuration={120}>
              <div className="flex gap-3 pt-4 border-t border-border">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleCopy}
                      disabled={(!processedText && !errorText) || isRunning}
                    >
                      {copied ? <CopyCheck className="w-4 h-4" color="green" />  : <ClipboardCopy className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Copy</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleReplace}
                      disabled={!processedText || isRunning || Boolean(errorText)}
                    >
                      <Replace className="w-4 h-4 inline-block mr-2" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Replace</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleRerun}
                      disabled={!lastActionId || isRunning || !selectedText}
                    >
                      {isRunning ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Re-run</span>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={handleClose}>
                      <X className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span>Close</span>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  )
}
