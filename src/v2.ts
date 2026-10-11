import type { EditBufferRenderable, PasteEvent } from "@opentui/core"
import type { Context, KeymapCommand } from "@opencode/plugin/tui/context"

type Extmark = {
  readonly id: number
  readonly start: number
  readonly end: number
}

type Editor = EditBufferRenderable & {
  readonly extmarks: {
    getAll(): Extmark[]
    delete(id: number): boolean
  }
  readonly editBuffer: {
    offsetToPosition(offset: number): { row: number; col: number } | null
    deleteRange(startRow: number, startCol: number, endRow: number, endCol: number): void
    setCursor(row: number, col: number): void
    getTextRange(startOffset: number, endOffset: number): string
  }
  readonly cursorOffset: number
  readonly insertText: (text: string) => void
}

type PasteRecord = {
  readonly id: number
  readonly text: string
  readonly order: number
}

const PASTED_PLACEHOLDER = /^\[Pasted ~\d+ lines?\]$/

function isEditor(value: EditBufferRenderable | null): value is Editor {
  if (!value || typeof value !== "object") return false
  const candidate = value as unknown as Partial<Editor>
  return (
    typeof candidate.cursorOffset === "number" &&
    typeof candidate.insertText === "function" &&
    typeof candidate.editBuffer?.offsetToPosition === "function" &&
    typeof candidate.editBuffer.deleteRange === "function" &&
    typeof candidate.extmarks?.getAll === "function"
  )
}

function rangeText(editor: Editor, range: Extmark): string | undefined {
  const value = editor.editBuffer.offsetToPosition(range.start)
  const end = editor.editBuffer.offsetToPosition(range.end)
  if (!value || !end) return
  return editor.editBuffer.getTextRange(range.start, range.end)
}

function expandRecord(editor: Editor, record: PasteRecord): boolean {
  const range = editor.extmarks.getAll().find((item) => item.id === record.id)
  if (!range) return false

  const start = editor.editBuffer.offsetToPosition(range.start)
  const end = editor.editBuffer.offsetToPosition(range.end)
  if (!start || !end) return false

  editor.extmarks.delete(range.id)
  editor.editBuffer.deleteRange(start.row, start.col, end.row, end.col)
  editor.editBuffer.setCursor(start.row, start.col)
  editor.insertText(record.text)
  return true
}

/**
 * Installs the v2 paste-expansion bridge without replacing OpenCode's prompt.
 * The host owns paste collapsing and creates an extmark for the visible
 * placeholder. We remember the original bytes from the preceding global paste
 * event, then use the editor's public editing primitives on the next paste.
 */
export function setupV2(context: Context): () => void {
  const records = new WeakMap<Editor, Map<number, PasteRecord>>()
  let order = 0

  const latest = (editor: Editor): PasteRecord | undefined => {
    const map = records.get(editor)
    if (!map || map.size === 0) return
    return [...map.values()].sort((a, b) => b.order - a.order).find((record) => {
      return editor.extmarks.getAll().some((range) => range.id === record.id)
    })
  }

  const expand = (): boolean => {
    const editor = context.renderer.currentFocusedEditor
    if (!isEditor(editor)) return false
    const record = latest(editor)
    if (!record || !expandRecord(editor, record)) return false
    records.get(editor)?.delete(record.id)
    return true
  }

  const command: KeymapCommand = {
    id: "opencode-paste-expand.expand",
    title: "Expand pasted placeholder",
    description: "Restore the latest collapsed pasted text",
    group: "Prompt",
    palette: true,
    run() {
      expand()
    },
  }

  context.keymap.layer(() => ({
    commands: [command],
    bindings: [command.id!],
  }))

  const onPaste = (event: PasteEvent) => {
    if (event.defaultPrevented) return
    if (expand()) {
      event.preventDefault()
      return
    }

    const editor = context.renderer.currentFocusedEditor
    if (!isEditor(editor)) return
    const text = new TextDecoder().decode(event.bytes)
    if (!text) return
    const start = editor.cursorOffset

    // OpenTUI dispatches global listeners before the focused textarea. Let the
    // host insert/collapse first, then associate its new placeholder extmark
    // with the bytes captured here.
    queueMicrotask(() => {
      const range = editor.extmarks
        .getAll()
        .filter((item) => item.start === start && item.end > item.start)
        .find((item) => {
          const visible = rangeText(editor, item)
          return visible !== undefined && PASTED_PLACEHOLDER.test(visible)
        })
      if (!range) return

      let map = records.get(editor)
      if (!map) {
        map = new Map()
        records.set(editor, map)
      }
      map.set(range.id, { id: range.id, text, order: order++ })
    })
  }

  context.renderer.keyInput.on("paste", onPaste)
  return () => {
    context.renderer.keyInput.off("paste", onPaste)
  }
}
