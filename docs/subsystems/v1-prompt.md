# v1 prompt integration

## Responsibilities and boundaries

In OpenCode v1, the plugin registers replacements for the `session_prompt` and `home_prompt` host slots and expands through the official `PromptRef`. OpenCode v2 uses the separate [v2 paste bridge](v2-paste.md).

## Sources of truth

- [`src/index.tsx`](../../src/index.tsx): `tui`, `expand`, `onPaste`, and the default `plugin` definition.
- [`src/expand.ts`](../../src/expand.ts): `isPastedTextPart` and `expandLastPastedPlaceholder`.
- [`src/display.ts`](../../src/display.ts): `promptOffsetWidth` and `displaySlice`.
- [`test/expand.test.ts`](../../test/expand.test.ts): expansion and display-offset contracts.

## Runtime path and state

The focused session/home `TuiPromptRef` supplies input and parts. `expandLastPastedPlaceholder` restores the latest pasted text and removes its source marker; `ref.set` applies the result. A successful expansion consumes the paste event. The registered listener is removed on disposal.

## Important constraints

Display offsets count newlines as one position; `Bun.stringWidth` counts them as zero, so slicing uses the display helpers. The shared [behavior](../../README.md#behavior) and [palette command](../../README.md#how-it-works) remain the user-facing contract.

## Failure and compatibility behavior

`expandLastPastedPlaceholder` returns `null` when nothing can expand, allowing ordinary pasting. Attachments and mentions follow the [README behavior](../../README.md#behavior). Cursor placement and the clipboard fallback limitation are recorded in [LESSONS.md](../../LESSONS.md#v1-cursor-placement-follows-the-host).

## Verification

Use the commands and real paste check in [Acceptance criteria](../code-standards.md#acceptance-criteria).
