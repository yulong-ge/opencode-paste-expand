# v2 paste bridge

## Responsibilities and boundaries

In OpenCode v2, the plugin listens to the global paste event, remembers the original text when the host creates a collapsed placeholder extmark, and expands the newest remembered extmark with the editor's public editing primitives before allowing the next paste to continue. It does not replace the host prompt component or load a second OpenTUI runtime.

## Sources of truth

- [`src/v2.ts`](../../src/v2.ts): `setupV2`, `expandRecord`, `PasteRecord`, and `PASTED_PLACEHOLDER`.
- [`src/index.tsx`](../../src/index.tsx): default `plugin` definition connects `setupV2` to the v2 host.
- [`index.tsx`](../../index.tsx): package-root forwarding entry.

## Runtime path and state

`setupV2` keeps paste records per editor in a `WeakMap`. The global listener captures the original bytes before the focused editor handles the paste. A microtask associates those bytes with the host's new placeholder extmark. A later paste expands the newest surviving record, removes it, and prevents the default paste. Disposal removes the listener.

## Important constraints

Apply the [type-only runtime import](../../LESSONS.md#one-opentui-runtime) and [deletion/cursor ordering](../../LESSONS.md#delete-before-positioning-the-cursor) lessons. Configuration keys and version-specific file locations remain in [Install](../../README.md#install).

## Failure and compatibility behavior

An unsupported focused editor, missing record, missing extmark or invalid position produces no expansion and leaves the paste to the host. Persisted drafts are limited by [which bytes the bridge observed](../../LESSONS.md#only-observed-v2-pastes-can-be-restored).

## Verification

Use [Acceptance criteria](../code-standards.md#acceptance-criteria), including the fresh debug log and real bracketed-paste check.
