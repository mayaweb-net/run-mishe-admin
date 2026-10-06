import { Extension } from "@tiptap/react"

import { getSelectedNodesOfType, updateNodesAttr } from "@/lib/tiptap-utils"

export interface TextDirectionOptions {
  types: string[]
}

export const TextDirection = Extension.create<TextDirectionOptions>({
  name: "textDirection",

  addOptions() {
    return {
      types: ["heading", "paragraph"],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textDirection: {
            default: null,
            parseHTML: (element) => element.getAttribute("dir"),
            renderHTML: (attributes) => {
              if (!attributes.textDirection) {
                return {}
              }

              return {
                dir: attributes.textDirection,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setTextDirection:
        (direction: "ltr" | "rtl" | "auto") =>
        ({ editor, tr, dispatch }) => {
          const targets = getSelectedNodesOfType(
            editor.state.selection,
            this.options.types
          )

          if (!targets.length) {
            return false
          }

          const changed = updateNodesAttr(tr, targets, "textDirection", direction)

          if (dispatch && changed) {
            dispatch(tr)
          }

          return true
        },

      unsetTextDirection:
        () =>
        ({ editor, tr, dispatch }) => {
          const targets = getSelectedNodesOfType(
            editor.state.selection,
            this.options.types
          )

          if (!targets.length) {
            return false
          }

          const changed = updateNodesAttr(tr, targets, "textDirection", undefined)

          if (dispatch && changed) {
            dispatch(tr)
          }

          return true
        },
    }
  },
})

export default TextDirection
