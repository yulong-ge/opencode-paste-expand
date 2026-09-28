// Ported from opencode's packages/tui/src/prompt/display.ts.
// Textarea offsets count newlines as one position; Bun.stringWidth counts them as zero.

const graphemes = new Intl.Segmenter(undefined, { granularity: "grapheme" })

export function promptOffsetWidth(value: string): number {
  let width = 0
  for (const part of graphemes.segment(value)) {
    width += part.segment === "\n" ? 1 : Bun.stringWidth(part.segment)
  }
  return width
}

function displayOffsetIndex(value: string, offset: number): number {
  if (offset <= 0) return 0
  let width = 0
  for (const part of graphemes.segment(value)) {
    const next = width + promptOffsetWidth(part.segment)
    if (next > offset) return part.index
    width = next
  }
  return value.length
}

export function displaySlice(value: string, start = 0, end = promptOffsetWidth(value)): string {
  return value.slice(displayOffsetIndex(value, start), displayOffsetIndex(value, end))
}
