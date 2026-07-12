import {
  autoUpdate,
  FloatingPortal,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useInteractions,
} from "@floating-ui/react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Copy, Replace, TriangleAlert, X } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Layout } from "@/components/layout"
import { createProviderAdapter } from "@/features/providers/sdk"
import { useTheme } from "next-themes"
import { useToolbarStore } from "@/stores/toolbar"
import { ToolbarActions } from "./toolbar-actions"

const ACTION_PROMPTS: Record<string, string> = {
  grammar:
    "Correct grammar, spelling, and punctuation while preserving the original meaning and tone.",
  rewrite: "Rewrite the text to be clearer and more polished without changing meaning.",
  improve: "Improve clarity, structure, and readability without changing intent.",
  shorten: "Shorten this text while preserving key meaning.",
  expand: "Expand this text with relevant detail while preserving voice and intent.",
  explain: "Explain this text in simple, plain language.",
  summarize: "Summarize this text into concise bullet points with key takeaways.",
  translate: "Translate this text into clear English.",
  continue: "Continue this text naturally in the same style, tone, and context.",
}

function createActionPrompt(actionId: string, text: string): string {
  const instruction = ACTION_PROMPTS[actionId] ?? "Improve this text."
  return `${instruction}\n\nText:\n"""\n${text}\n"""`
}

function ToolbarContent() {
  const {
    isVisible,
    isEditableSelection,
    selectedText,
    selectionRect,
    selectionRange,
    hide,
    setPinned,
  } = useToolbarStore()
  const { resolvedTheme = "light" } = useTheme()

  const [isRunning, setIsRunning] = useState(false)
  const [activeActionId, setActiveActionId] = useState<string | null>(null)
  const [resultText, setResultText] = useState("")
  const [errorText, setErrorText] = useState("")
  const [copied, setCopied] = useState(false)

  const handleCloseResult = useCallback(() => {
    setResultText("")
    setErrorText("")
    setIsRunning(false)
    setActiveActionId(null)
    setCopied(false)
    setPinned(false)
  }, [setPinned])

  const hasResultPanel = isRunning || Boolean(resultText) || Boolean(errorText)

  const canApplyResult = useMemo(
    () => isEditableSelection && Boolean(selectionRange) && Boolean(resultText),
    [isEditableSelection, selectionRange, resultText],
  )

  const selectionReferenceElement = useMemo(() => {
    if (!selectionRect) {
      return null
    }

    return {
      getBoundingClientRect: () => selectionRect,
      contextElement: document.body,
    }
  }, [selectionRect])

  const { refs, floatingStyles, context } = useFloating({
    open: isVisible,
    onOpenChange: (open, _event, reason) => {
      if (!open && hasResultPanel && (reason === "outside-press" || reason === "escape-key")) {
        return
      }

      if (!open) {
        hide()
      }
    },
    placement: "bottom",
    strategy: "fixed",
    middleware: [offset(10), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    elements: {
      reference: selectionReferenceElement as unknown as Element,
    },
  })

  const dismiss = useDismiss(context, {
    outsidePressEvent: "pointerdown",
    bubbles: false,
    outsidePress: !hasResultPanel,
    escapeKey: !hasResultPanel,
  })

  const { getFloatingProps } = useInteractions([dismiss])

  useEffect(() => {
    if (!isVisible) {
      setIsRunning(false)
      setActiveActionId(null)
      setResultText("")
      setErrorText("")
      setCopied(false)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      return
    }

    if (!selectionRect) {
      hide()
    }
  }, [hide, isVisible, selectionRect])

  useEffect(() => {
    if (!selectedText) {
      return
    }

    setResultText("")
    setErrorText("")
    setCopied(false)
    setIsRunning(false)
    setActiveActionId(null)
    setPinned(false)
  }, [selectedText, setPinned])

  const handleAction = useCallback(
    async (actionId: string) => {
      if (!selectedText.trim() || isRunning) {
        return
      }

      setIsRunning(true)
      setActiveActionId(actionId)
      setResultText("")
      setErrorText("")
      setCopied(false)
      setPinned(true)

      try {
        const adapter = await createProviderAdapter()

        if (!adapter) {
          setErrorText("No provider configured. Save provider and API key in Dashboard first.")
          return
        }

        const prompt = createActionPrompt(actionId, selectedText)

        const response = await adapter.runPrompt(
          prompt,
          "You are a writing assistant. Return only the transformed output with no commentary.",
        )

        const normalized = response.trim()

        if (!normalized) {
          setErrorText("The model returned an empty response. Try again with a different model.")
          return
        }

        setResultText(normalized)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown AI error"
        if (/extension context invalidated/i.test(message)) {
          setErrorText(
            "Extension was reloaded or updated. Refresh this page, select text again, and retry.",
          )
          return
        }

        setErrorText(`Request failed: ${message}`)
      } finally {
        setIsRunning(false)
        setActiveActionId(null)
      }
    },
    [isRunning, selectedText, setPinned],
  )

  const handleCopyResult = useCallback(async () => {
    if (!resultText) {
      return
    }

    await navigator.clipboard.writeText(resultText)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }, [resultText])

  const handleApplyResult = useCallback(() => {
    if (!resultText || !selectionRange) {
      setErrorText("Could not apply result because the original selection is no longer available.")
      return
    }

    try {
      const range = selectionRange.cloneRange()
      range.deleteContents()
      const replacementNode = document.createTextNode(resultText)
      range.insertNode(replacementNode)

      const selection = window.getSelection()
      if (selection) {
        const cursorRange = document.createRange()
        cursorRange.setStartAfter(replacementNode)
        cursorRange.collapse(true)
        selection.removeAllRanges()
        selection.addRange(cursorRange)
      }

      let editableHost = replacementNode.parentElement
      while (editableHost && !editableHost.isContentEditable) {
        editableHost = editableHost.parentElement
      }
      editableHost?.dispatchEvent(new InputEvent("input", { bubbles: true }))
    } catch {
      setErrorText("Failed to apply result to the page editor.")
    }
  }, [resultText, selectionRange])

  if (!isVisible || !selectionRect) return null

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <FloatingPortal>
            <motion.div
              ref={refs.setFloating}
              style={floatingStyles}
              data-theme={resolvedTheme}
              role="toolbar"
              aria-label="AI writing assistant"
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="z-2147483647 rounded-xl border bg-popover p-1 shadow-2xl backdrop-blur-md"
              {...getFloatingProps()}
            >
              <ToolbarActions
                onAction={(actionId) => void handleAction(actionId)}
                isLoading={isRunning}
                activeActionId={activeActionId}
              />

              {hasResultPanel && (
                <div className="mt-1 rounded-lg bg-amber-900 border p-2.5">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground">
                      {isRunning ? "Generating..." : errorText ? "Error" : "Result"}
                    </p>
                    <div className="flex items-center gap-1">
                      {resultText && !isRunning && (
                        <>
                          {canApplyResult && (
                            <button
                              type="button"
                              onClick={handleApplyResult}
                              className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                              aria-label="Apply result"
                            >
                              <Replace className="size-3" />
                              <span>Apply</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => void handleCopyResult()}
                            className="flex items-center gap-1 rounded-md border px-1.5 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                            aria-label="Copy result"
                          >
                            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            <span>{copied ? "Copied" : "Copy"}</span>
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={handleCloseResult}
                        className="rounded-md border px-1.5 py-1 text-[10px] text-muted-foreground hover:text-foreground"
                        aria-label="Close result"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>

                  {isRunning && (
                    <p className="text-xs text-muted-foreground">Processing selected text...</p>
                  )}

                  {errorText && !isRunning && (
                    <div className="flex items-start gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 p-2 text-xs text-destructive">
                      <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                      <span className="whitespace-pre-wrap wrap-break-word">{errorText}</span>
                    </div>
                  )}

                  {resultText && !isRunning && !errorText && (
                    <pre className="max-h-64 overflow-auto whitespace-pre-wrap wrap-break-word text-xs text-foreground font-sans leading-relaxed">
                      {resultText}
                    </pre>
                  )}
                </div>
              )}
            </motion.div>
          </FloatingPortal>
        )}
      </AnimatePresence>
    </>
  )
}

export function Toolbar() {
  return (
    <Layout variant="inline">
      <ToolbarContent />
    </Layout>
  )
}
