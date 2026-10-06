"use client"

import { useCallback, useEffect, useState } from "react"
import type { ChainedCommands } from "@tiptap/react"
import type { Editor } from "@tiptap/react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- Lib ---
import { isExtensionAvailable } from "@/lib/tiptap-utils"

export type TextDirection = "ltr" | "rtl" | "auto" | "unset"

export interface UseTextDirectionConfig {
  editor?: Editor | null
  direction: TextDirection
  hideWhenUnavailable?: boolean
  onDirectionChanged?: () => void
}

export const TEXT_DIRECTION_LABELS: Record<TextDirection, string> = {
  ltr: "جهت چپ به راست",
  rtl: "جهت راست به چپ",
  auto: "جهت خودکار",
  unset: "حذف جهت متن",
}

export function canSetTextDirection(
  editor: Editor | null,
  direction: Exclude<TextDirection, "unset">
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "textDirection")) return false
  return editor.can().setTextDirection(direction)
}

export function canUnsetTextDirection(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!isExtensionAvailable(editor, "textDirection")) return false
  return editor.can().unsetTextDirection()
}

export function hasTextDirectionCommands(
  commands: ChainedCommands
): commands is ChainedCommands & {
  setTextDirection: (direction: Exclude<TextDirection, "unset">) => ChainedCommands
  unsetTextDirection: () => ChainedCommands
} {
  return (
    "setTextDirection" in commands && "unsetTextDirection" in commands
  )
}

export function setTextDirection(
  editor: Editor | null,
  direction: Exclude<TextDirection, "unset">
): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canSetTextDirection(editor, direction)) return false

  const chain = editor.chain().focus()
  if (hasTextDirectionCommands(chain)) {
    return chain.setTextDirection(direction).run()
  }

  return false
}

export function unsetTextDirection(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  if (!canUnsetTextDirection(editor)) return false

  const chain = editor.chain().focus()
  if (hasTextDirectionCommands(chain)) {
    return chain.unsetTextDirection().run()
  }

  return false
}

export function isTextDirectionActive(
  editor: Editor | null,
  direction: Exclude<TextDirection, "unset">
): boolean {
  if (!editor || !editor.isEditable) return false
  return editor.isActive({ textDirection: direction })
}

export function isTextDirectionUnsetActive(editor: Editor | null): boolean {
  if (!editor || !editor.isEditable) return false
  return (
    !isTextDirectionActive(editor, "ltr") &&
    !isTextDirectionActive(editor, "rtl") &&
    !isTextDirectionActive(editor, "auto")
  )
}

export function shouldShowButton(props: {
  editor: Editor | null
  hideWhenUnavailable: boolean
  direction: TextDirection
}): boolean {
  const { editor, hideWhenUnavailable, direction } = props

  if (!editor) return false
  if (!hideWhenUnavailable) return true
  if (!editor.isEditable) return false
  if (!isExtensionAvailable(editor, "textDirection")) return false

  if (direction === "unset") {
    return canUnsetTextDirection(editor)
  }

  return canSetTextDirection(editor, direction)
}

export function useTextDirection(config: UseTextDirectionConfig) {
  const {
    editor: providedEditor,
    direction,
    hideWhenUnavailable = false,
    onDirectionChanged,
  } = config
  const { editor } = useTiptapEditor(providedEditor)
  const [isVisible, setIsVisible] = useState<boolean>(true)
  const canChange =
    direction === "unset"
      ? canUnsetTextDirection(editor)
      : canSetTextDirection(editor, direction)
  const isActive =
    direction === "unset"
      ? isTextDirectionUnsetActive(editor)
      : isTextDirectionActive(editor, direction)

  useEffect(() => {
    if (!editor) return

    const handleSelectionUpdate = () => {
      setIsVisible(
        shouldShowButton({
          editor,
          direction,
          hideWhenUnavailable,
        })
      )
    }

    handleSelectionUpdate()

    editor.on("selectionUpdate", handleSelectionUpdate)

    return () => {
      editor.off("selectionUpdate", handleSelectionUpdate)
    }
  }, [editor, hideWhenUnavailable, direction])

  const handleTextDirection = useCallback(() => {
    if (!editor) return false

    const success =
      direction === "unset"
        ? unsetTextDirection(editor)
        : setTextDirection(editor, direction)

    if (success) {
      onDirectionChanged?.()
    }

    return success
  }, [direction, editor, onDirectionChanged])

  return {
    isVisible,
    handleTextDirection,
    label: TEXT_DIRECTION_LABELS[direction],
    canChange,
    isActive,
  }
}
