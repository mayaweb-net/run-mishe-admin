"use client"

import { forwardRef, useCallback } from "react"

// --- Hooks ---
import { useTiptapEditor } from "@/hooks/use-tiptap-editor"

// --- UI Primitives ---
import type { ButtonProps } from "@/components/tiptap-ui-primitive/button"
import { Button } from "@/components/tiptap-ui-primitive/button"

// --- Text Direction ---
import type { UseTextDirectionConfig } from "./use-text-direction"
import { useTextDirection } from "./use-text-direction"

export interface TextDirectionButtonProps
  extends Omit<ButtonProps, "type">,
    UseTextDirectionConfig {
  text?: string
}

export const TextDirectionButton = forwardRef<
  HTMLButtonElement,
  TextDirectionButtonProps
>(
  (
    {
      editor: providedEditor,
      direction,
      text,
      hideWhenUnavailable = false,
      onDirectionChanged,
      onClick,
      children,
      ...buttonProps
    },
    ref
  ) => {
    const { editor } = useTiptapEditor(providedEditor)
    const { isVisible, handleTextDirection, label, canChange, isActive } =
      useTextDirection({
        editor,
        direction,
        hideWhenUnavailable,
        onDirectionChanged,
      })

    const handleClick = useCallback(
      (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event)
        if (event.defaultPrevented) return
        handleTextDirection()
      },
      [handleTextDirection, onClick]
    )

    if (!isVisible) {
      return null
    }

    return (
      <Button
        type="button"
        disabled={!canChange}
        variant="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={!canChange}
        role="button"
        tabIndex={-1}
        aria-label={label}
        aria-pressed={isActive}
        tooltip={label}
        onClick={handleClick}
        {...buttonProps}
        ref={ref}
      >
        {children ?? <span>{text ?? direction.toUpperCase()}</span>}
      </Button>
    )
  }
)

TextDirectionButton.displayName = "TextDirectionButton"
