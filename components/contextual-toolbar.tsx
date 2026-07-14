import { useCallback, useEffect, useReducer, useRef } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { Loader2, RefreshCw, Replace, TriangleAlert, X, ClipboardCopy, CopyCheck } from 'lucide-react'
import { Layout } from '@/components/layout'
import { createProviderAdapter } from '@/features/providers/sdk'
import { ToolbarActions } from '@/features/toolbar/toolbar-actions'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

interface ToolbarState {
  selectedText: string
  toolbarPos: ToolbarPosition
  showResult: boolean
  processedText: string
  isRunning: boolean
  activeActionId: string | null
  lastActionId: string | null
  errorText: string
  copied: boolean
}

type ToolbarAction =
  | { type: 'SELECTION_CHANGED'; text: string; position: ToolbarPosition }
  | { type: 'HIDE_TOOLBAR_IF_VISIBLE' }
  | { type: 'RUN_ACTION'; actionId: string }
  | { type: 'ACTION_SUCCESS'; text: string }
  | { type: 'ACTION_ERROR'; error: string }
  | { type: 'COPIED' }
  | { type: 'COPY_RESET' }
  | { type: 'RESET' }

const INITIAL_TOOLBAR_STATE: ToolbarState = {
  selectedText: '',
  toolbarPos: { top: 0, left: 0, visible: false },
  showResult: false,
  processedText: '',
  isRunning: false,
  activeActionId: null,
  lastActionId: null,
  errorText: '',
  copied: false,
}

function toolbarReducer(state: ToolbarState, action: ToolbarAction): ToolbarState {
  switch (action.type) {
    case 'SELECTION_CHANGED':
      if (state.showResult) return state
      return { ...state, selectedText: action.text, toolbarPos: action.position }
    case 'HIDE_TOOLBAR_IF_VISIBLE':
      if (state.showResult) return state
      return { ...state, toolbarPos: { ...state.toolbarPos, visible: false } }
    case 'RUN_ACTION':
      if (!state.selectedText.trim() || state.isRunning) return state
      return {
        ...state,
        showResult: true,
        toolbarPos: { ...state.toolbarPos, visible: false },
        isRunning: true,
        activeActionId: action.actionId,
        lastActionId: action.actionId,
        processedText: '',
        errorText: '',
        copied: false,
      }
    case 'ACTION_SUCCESS':
      return { ...state, isRunning: false, processedText: action.text, activeActionId: null }
    case 'ACTION_ERROR':
      return { ...state, isRunning: false, errorText: action.error, activeActionId: null }
    case 'COPIED':
      return { ...state, copied: true }
    case 'COPY_RESET':
      return { ...state, copied: false }
    case 'RESET':
      return { ...INITIAL_TOOLBAR_STATE }
  }
}

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

interface ToolbarPopoverProps {
  position: ToolbarPosition
  isRunning: boolean
  activeActionId: string | null
  onAction: (actionId: string) => void
}

function ToolbarPopover({ position, isRunning, activeActionId, onAction }: ToolbarPopoverProps) {
  return (
    <AnimatePresence>
      {position.visible && (
        <m.div
          className="fixed z-2147483647 rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-2xl backdrop-blur-md"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <ToolbarActions
            onAction={onAction}
            isLoading={isRunning}
            activeActionId={activeActionId}
          />
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface ResultDialogProps {
  show: boolean
  isRunning: boolean
  activeActionId: string | null
  processedText: string
  errorText: string
  copied: boolean
  selectedText: string
  lastActionId: string | null
  onCopy: () => void
  onReplace: () => void
  onRerun: () => void
  onClose: () => void
}

function ResultDialog({
  show,
  isRunning,
  activeActionId,
  processedText,
  errorText,
  copied,
  selectedText,
  lastActionId,
  onCopy,
  onReplace,
  onRerun,
  onClose,
}: ResultDialogProps) {
  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="fixed inset-0 z-2147483647 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <m.div
            className="mx-4 w-full max-w-md space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <ResultBody
              isRunning={isRunning}
              activeActionId={activeActionId}
              errorText={errorText}
              processedText={processedText}
            />

            <ResultActions
              copied={copied}
              isRunning={isRunning}
              processedText={processedText}
              errorText={errorText}
              selectedText={selectedText}
              lastActionId={lastActionId}
              onCopy={onCopy}
              onReplace={onReplace}
              onRerun={onRerun}
              onClose={onClose}
            />
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  )
}

interface ResultBodyProps {
  isRunning: boolean
  activeActionId: string | null
  errorText: string
  processedText: string
}

function ResultBody({ isRunning, activeActionId, errorText, processedText }: ResultBodyProps) {
  return (
    <div className="p-1 bg-amber-700">
      <h2 className="text-sm font-semibold text-muted-foreground mb-1">Processed Text</h2>
      {isRunning && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{activeActionId ? `Processing ${activeActionId}...` : 'Processing...'}</span>
        </div>
      )}

      {!isRunning && errorText && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span className="whitespace-pre-wrap wrap-break-word">{errorText}</span>
        </div>
      )}

      {!isRunning && !errorText && processedText && (
        <p className="text-base p-3 rounded-md font-medium text-balance">{processedText}</p>
      )}
    </div>
  )
}

interface ResultActionsProps {
  copied: boolean
  isRunning: boolean
  processedText: string
  errorText: string
  selectedText: string
  lastActionId: string | null
  onCopy: () => void
  onReplace: () => void
  onRerun: () => void
  onClose: () => void
}

function ResultActions({
  copied,
  isRunning,
  processedText,
  errorText,
  selectedText,
  lastActionId,
  onCopy,
  onReplace,
  onRerun,
  onClose,
}: ResultActionsProps) {
  const hasCopyableText = Boolean(processedText || errorText)
  const canReplace = Boolean(processedText) && !isRunning && !errorText
  const canRerun = Boolean(lastActionId) && !isRunning && Boolean(selectedText)

  return (
    <TooltipProvider delayDuration={120}>
      <div className="flex gap-3 pt-4 border-t border-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onCopy} disabled={!hasCopyableText || isRunning}>
              {copied ? (
                <CopyCheck className="w-4 h-4" color="green" />
              ) : (
                <ClipboardCopy className="w-4 h-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Copy</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onReplace} disabled={!canReplace}>
              <Replace className="w-4 h-4 inline-block mr-2" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Replace</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onRerun} disabled={!canRerun}>
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
            <Button onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Close</span>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}

function ContextualToolbarContent() {
  const [state, dispatch] = useReducer(toolbarReducer, INITIAL_TOOLBAR_STATE)
  const stateRef = useRef(state)
  const selectionRangeRef = useRef<Range | null>(null)

  useEffect(() => {
    stateRef.current = state
  })

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
      dispatch({ type: 'HIDE_TOOLBAR_IF_VISIBLE' })
      return
    }

    const text = selection.toString().trim()
    if (!text) {
      dispatch({ type: 'HIDE_TOOLBAR_IF_VISIBLE' })
      return
    }

    const range = selection.getRangeAt(0).cloneRange()
    selectionRangeRef.current = range
    dispatch({ type: 'SELECTION_CHANGED', text, position: calculateToolbarPosition(range) })
  }, [calculateToolbarPosition])

  const handleAction = useCallback(
    async (actionId: string) => {
      const current = stateRef.current
      if (!current.selectedText.trim() || current.isRunning) {
        return
      }

      dispatch({ type: 'RUN_ACTION', actionId })

      try {
        const adapter = await createProviderAdapter()
        if (!adapter) {
          dispatch({ type: 'ACTION_ERROR', error: 'No provider configured. Save provider and API key in Dashboard first.' })
          return
        }

        const prompt = createActionPrompt(actionId, current.selectedText)
        const response = await adapter.runPrompt(
          prompt,
          'You are a writing assistant. Return only the transformed output with no commentary.',
        )

        const normalized = response.trim()
        if (!normalized) {
          dispatch({ type: 'ACTION_ERROR', error: 'The model returned an empty response. Try again with a different model.' })
          return
        }

        dispatch({ type: 'ACTION_SUCCESS', text: normalized })
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown AI error'
        if (/extension context invalidated/i.test(message)) {
          dispatch({ type: 'ACTION_ERROR', error: 'Extension was reloaded or updated. Refresh this page, select text again, and retry.' })
          return
        }

        dispatch({ type: 'ACTION_ERROR', error: `Request failed: ${message}` })
      }
    },
    [],
  )

  const handleCopy = useCallback(async () => {
    const current = stateRef.current
    const textToCopy = current.processedText || current.errorText
    if (!textToCopy) {
      return
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      dispatch({ type: 'COPIED' })
      window.setTimeout(() => dispatch({ type: 'COPY_RESET' }), 1400)
    } catch {
      // Ignore clipboard failures; user can still manually copy from the result panel.
    }
  }, [])

  const handleRerun = useCallback(() => {
    const current = stateRef.current
    if (!current.lastActionId || current.isRunning || !current.selectedText.trim()) {
      return
    }

    void handleAction(current.lastActionId)
  }, [handleAction])

  const handleReplace = useCallback(() => {
    const current = stateRef.current
    if (!current.processedText || current.isRunning || current.errorText) {
      return
    }

    const savedRange = selectionRangeRef.current
    if (!savedRange) {
      dispatch({ type: 'ACTION_ERROR', error: 'Could not replace text because the original selection was lost.' })
      return
    }

    try {
      const range = savedRange.cloneRange()
      range.deleteContents()
      const replacementNode = document.createTextNode(current.processedText)
      range.insertNode(replacementNode)

      const selection = window.getSelection()
      if (selection) {
        const cursorRange = document.createRange()
        cursorRange.setStartAfter(replacementNode)
        cursorRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(cursorRange)
      }

      dispatch({ type: 'RESET' })
      selectionRangeRef.current = null
    } catch {
      dispatch({ type: 'ACTION_ERROR', error: 'Failed to replace text in this area. Select text again and retry.' })
    }
  }, [])

  const handleClose = useCallback(() => {
    dispatch({ type: 'RESET' })
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

  const {
    selectedText,
    toolbarPos,
    showResult,
    processedText,
    isRunning,
    activeActionId,
    lastActionId,
    errorText,
    copied,
  } = state

  return (
    <>
      {!showResult && (
        <ToolbarPopover
          position={toolbarPos}
          isRunning={isRunning}
          activeActionId={activeActionId}
          onAction={(actionId) => {
            void handleAction(actionId)
          }}
        />
      )}

      <ResultDialog
        show={showResult}
        isRunning={isRunning}
        activeActionId={activeActionId}
        processedText={processedText}
        errorText={errorText}
        copied={copied}
        selectedText={selectedText}
        lastActionId={lastActionId}
        onCopy={() => {
          void handleCopy()
        }}
        onReplace={handleReplace}
        onRerun={handleRerun}
        onClose={handleClose}
      />
    </>
  )
}

export function ContextualToolbar() {
  return (
    <Layout variant="inline">
      <LazyMotion features={domAnimation}>
        <ContextualToolbarContent />
      </LazyMotion>
    </Layout>
  )
}
