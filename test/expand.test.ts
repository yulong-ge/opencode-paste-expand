import { describe, expect, test } from "bun:test"
import { promptOffsetWidth } from "../src/display"
import { expandLastPastedPlaceholder, isPastedTextPart, type PartLike, type PastedTextPart } from "../src/expand"

function marker(lines: number): string {
  return `[Pasted ~${lines} lines]`
}

// Collapsed buffer model: the pasted content is hidden behind a virtual
// extmark; input contains the marker text and source.text.start/end cover
// the marker's current display extent.
function paste(input: string, parts: PartLike[], content: string) {
  const start = promptOffsetWidth(input)
  const mark = marker(content.split("\n").length)
  const nextInput = input + mark + " "
  const part: PastedTextPart = {
    type: "text",
    text: mark,
    source: { text: { start, end: start + promptOffsetWidth(mark), value: content } },
  }
  return { input: nextInput, parts: [...parts, part] }
}

describe("isPastedTextPart", () => {
  test("accepts text parts carrying source.text", () => {
    expect(
      isPastedTextPart<PastedTextPart>({ type: "text", text: "x", source: { text: { start: 0, end: 1, value: "v" } } }),
    ).toBe(true)
  })
  test("rejects plain text and non-text parts", () => {
    expect(isPastedTextPart({ type: "text", text: "x" } as PartLike)).toBe(false)
    expect(isPastedTextPart({ type: "file", mime: "image/png" } as PartLike)).toBe(false)
  })
})

describe("expandLastPastedPlaceholder", () => {
  test("restores pasted content at its source range", () => {
    const { input, parts } = paste("check ", [], "alpha\nbeta\ngamma")
    const expanded = expandLastPastedPlaceholder(input, parts)
    expect(expanded?.input).toBe("check alpha\nbeta\ngamma ")
    expect(expanded?.parts).toHaveLength(1)
    expect((expanded?.parts[0] as { source?: unknown }).source).toBeUndefined()
  })

  test("expands only the most recent placeholder", () => {
    const first = paste("", [], "first")
    const second = paste(first.input + "and ", first.parts, "second")

    const expanded = expandLastPastedPlaceholder(second.input, second.parts)
    expect(expanded?.input).toBe(`${marker(1)} and second `)
    expect(isPastedTextPart(expanded!.parts[0])).toBe(true)
    expect(isPastedTextPart(expanded!.parts[1])).toBe(false)
  })

  test("returns null when no placeholder remains", () => {
    expect(expandLastPastedPlaceholder("hello", [])).toBeNull()
    expect(expandLastPastedPlaceholder("hello", [{ type: "text", text: "hi" }])).toBeNull()
  })

  test("handles non-ascii display widths", () => {
    const { input, parts } = paste("前 ", [], "你好\n世界")
    const expanded = expandLastPastedPlaceholder(input, parts)
    expect(expanded?.input).toBe("前 你好\n世界 ")
  })
})
