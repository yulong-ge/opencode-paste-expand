# Lessons

Read these before changing code. Each entry states a rule, its reason, and evidence from the existing README or source. The original notes did not record incident dates or commits; migration on 2026-10-27 does not imply a new runtime test.

## One OpenTUI runtime

**Rule:** Keep OpenTUI imports type-only.

**Why:** Loading a second runtime can fail with `Environment variable "OPENTUI_FORCE_UNICODE" is already registered with different configuration`.

**Evidence:** Original README, Development verification; imports in [`src/v2.ts`](src/v2.ts).

## Delete before positioning the cursor

**Rule:** In `src/v2.ts`, delete the extmark range before setting the insertion cursor and inserting the original text.

**Why:** Deletion can move the cursor.

**Evidence:** [`expandRecord`](src/v2.ts); original README, Development verification.

## Only observed v2 pastes can be restored

**Rule:** Treat previously persisted placeholders as potentially unavailable to the v2 bridge.

**Why:** The v2 bridge can remember placeholders created after the plugin loads. A placeholder already persisted in a draft may not be expandable if its original bytes were never observed by the plugin; the v2 API does not expose the host's historical paste store.

**Evidence:** Original README, Notes; [`setupV2`](src/v2.ts).

## v1 cursor placement follows the host

**Rule:** Account for the cursor moving to the end when expanding via `ref.set` in v1.

**Why:** This matches OpenCode's own prompt restore.

**Evidence:** Original README, Notes; `expand` in [`src/index.tsx`](src/index.tsx).

## Paste events and clipboard fallback differ

**Rule:** Use a real paste event to verify expansion.

**Why:** `ctrl+v` bound to `prompt.paste` (empty-clipboard fallback path) does not expand; only real paste events do.

**Evidence:** Original README, Notes.
