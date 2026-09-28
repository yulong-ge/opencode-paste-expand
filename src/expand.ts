import { displaySlice } from "./display"

export type PastedTextPart = {
  readonly type: "text"
  readonly text: string
  readonly source?: {
    readonly text?: {
      readonly start: number
      readonly end: number
      readonly value: string
    }
  }
}

export type PartLike = { readonly type: string }

export type ExpandedPrompt<Part extends PartLike> = {
  input: string
  parts: Part[]
}

export function isPastedTextPart<Part extends PartLike>(part: Part): part is PastedTextPart & Part {
  return part.type === "text" && typeof (part as unknown as PastedTextPart).source?.text?.value === "string"
}

/**
 * Expands the most recent collapsed paste placeholder in a prompt.
 * `part.text` already holds the original pasted text; the extmark collapses
 * `source.text.start..end` into `source.text.value` ("[Pasted ~N lines]").
 * Expanding = restore `part.text` into the input and drop the source marker.
 * Returns null when nothing can be expanded.
 */
export function expandLastPastedPlaceholder<Part extends PartLike>(
  input: string,
  parts: readonly Part[],
): ExpandedPrompt<Part> | null {
  const index = parts.findLastIndex(isPastedTextPart)
  if (index === -1) return null

  const part = parts[index] as PastedTextPart & Part
  const { start, end } = part.source!.text!
  const nextInput = displaySlice(input, 0, start) + part.text + displaySlice(input, end)

  const nextParts = parts.map((item, i) => {
    if (i !== index) return item
    const { source, ...rest } = part as PastedTextPart & Part
    return rest as Part
  })

  return { input: nextInput, parts: nextParts }
}
