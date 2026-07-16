import { useCallback, useEffect, useReducer, useRef } from 'react'
import { useFloatingPortalNode } from '@floating-ui/react'
import { createPortal } from 'react-dom'
import { AnimatePresence, LazyMotion, domAnimation, m } from 'framer-motion'
import { Loader2, RefreshCw, Replace, TriangleAlert, X, ClipboardCopy, CopyCheck } from 'lucide-react'
import { createProviderAdapter } from '@/features/providers/sdk'
import { ToolbarActions } from '@/features/toolbar/toolbar-actions'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'
import { ToolbarAction, ToolbarState, ToolbarPopoverProps, ResultBodyProps, ResultActionsProps, ResultDialogProps } from '@/types'
import "../assets/tailwind.css"


const INITIAL_TOOLBAR_STATE: ToolbarState = {
  selectedText: '',
  toolbarPos: { x: 0, y: 0, visible: false },
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

function getFriendlyActionError(error: unknown): string {
  const message = error instanceof Error ? error.message : 'Unknown AI error'

  if (/extension context invalidated/i.test(message)) {
    return 'Extension was reloaded or updated. Refresh this page, select text again, and retry.'
  }

  // Some provider setup failures can bubble up with unrelated text; normalize to a clear next step.
  if (
    /not configured|no provider|no api key|missing api key|provider.*(required|missing)|usefloating hook|contextual-toolbar\.tsx/i.test(
      message,
    )
  ) {
    return 'No provider configured. Save provider and API key in Dashboard first.'
  }

  return `Request failed: ${message}`
}



function ToolbarPopover({ visible, portalNode, toolbarPos, isRunning, activeActionId, onAction }: ToolbarPopoverProps) {
  if (!portalNode) {
    return null
  }

  return createPortal(
    <AnimatePresence>
      {visible && (
        <m.div
          style={{
            position: 'fixed',
            left: toolbarPos.x,
            top: toolbarPos.y,
            transform: 'translate(-50%, 0)',
          }}
          className="pp:fixed pp:z-2147483647 pp:rounded-sm  pp:border pp:border-border pp:bg-popover pp:p-1.5 pp:text-popover-foreground pp:shadow-2xl pp:backdrop-blur-md"
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
    ,
    portalNode,
  )
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
          className="pp:fixed pp:inset-0 pp:z-2147483647 pp:flex pp:items-center pp:justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <m.div
            className="pp:mx-4 pp:w-full pp:max-w-md pp:space-y-4 pp:rounded-lg pp:border pp:bg-card pp:p-6 pp:text-card-foreground pp:shadow-2xl"
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



function ResultBody({ isRunning, activeActionId, errorText, processedText }: ResultBodyProps) {
  return (
    <div className="pp:p-1">
      <h2 className="pp:text-sm pp:font-semibold pp:text-muted-foreground pp:mb-1">Processed Text</h2>
      {isRunning && (
        <div className="pp:flex pp:items-center pp:gap-2 pp:text-sm pp:text-muted-foreground pp:bg-muted pp:p-3 pp:rounded-md">
          <Loader2 className="pp:w-4 pp:h-4 pp:animate-spin" />
          <span>{activeActionId ? `Processing ${activeActionId}...` : 'Processing...'}</span>
        </div>
      )}

      {!isRunning && errorText && (
        <div className="pp:flex pp:items-start pp:gap-2 pp:rounded-md pp:border pp:border-destructive/40 pp:bg-destructive/10 pp:p-3 pp:text-sm pp:text-destructive">
          <TriangleAlert className="pp:mt-0.5 pp:h-4 pp:w-4 pp:shrink-0" />
          <span className="pp:whitespace-pre-wrap pp:wrap-break-word">{errorText}</span>
        </div>
      )}

      {!isRunning && !errorText && processedText && (
        <p className="pp:text-base pp:p-3 pp:rounded-md pp:font-medium pp:text-balance">{processedText}</p>
      )}
    </div>
  )
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
    <TooltipProvider>
      <div className="pp:flex pp:gap-3 pp:pt-4 pp:border-t pp:border-border">
        <Tooltip>
          <TooltipTrigger render={<Button onClick={onCopy} disabled={!hasCopyableText || isRunning}>
              {copied ? (
                <CopyCheck className="pp:w-4 pp:h-4" color="green" />
              ) : (
                <ClipboardCopy className="pp:w-4 pp:h-4" />
              )}
            </Button>}>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Copy</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button onClick={onReplace} disabled={!canReplace}>
              <Replace className="pp:w-4 pp:h-4 pp:inline-block pp:mr-2" />
            </Button>}>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Replace</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button onClick={onRerun} disabled={!canRerun}>
              {isRunning ? (
                <Loader2 className="pp:w-4 pp:h-4 pp:animate-spin" />
              ) : (
                <RefreshCw className="pp:w-4 pp:h-4" />
              )}
            </Button>}>
          </TooltipTrigger>
          <TooltipContent side="top">
            <span>Re-run</span>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger render={<Button onClick={onClose}>
              <X className="pp:w-4 pp:h-4" />
            </Button>}>
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
  const portalNode = useFloatingPortalNode({
    id: 'promptpen-contextual-toolbar-portal',
  })

  useEffect(() => {
    stateRef.current = state
  })

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

    const rect = range.getBoundingClientRect()
    const anchorX = rect.left + rect.width / 2
    const anchorY = rect.bottom + 12

    dispatch({
      type: 'SELECTION_CHANGED',
      text,
      position: { x: anchorX, y: anchorY, visible: true },
    })
  }, [])

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
        dispatch({ type: 'ACTION_ERROR', error: getFriendlyActionError(error) })
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
          visible={toolbarPos.visible}
          portalNode={portalNode}
          toolbarPos={toolbarPos}
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
    <LazyMotion features={domAnimation}>
      <ContextualToolbarContent />
    </LazyMotion>
  )
}
