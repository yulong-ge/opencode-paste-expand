# Code standards

Development rules migrated from the README. Host-specific constraints are owned by the [subsystem references](subsystems/README.md) and [lessons](../LESSONS.md).

| Rule | What to check |
| --- | --- |
| Use type-only OpenTUI imports and preserve the v2 edit sequence. | Apply the [OpenTUI runtime](../LESSONS.md#one-opentui-runtime) and [cursor ordering](../LESSONS.md#delete-before-positioning-the-cursor) lessons. |
| Verify the exact plugin revision in a fresh TUI run. | Pin and read back the exact plugin commit before testing. In a fresh TUI debug log, confirm `prepare`, `load`, and `setup`; a cached package alone does not prove loading. |
| Verify actual paste behavior. | Perform a real bracketed-paste check: the first paste collapses, and the second restores the original text without inserting another placeholder. |

## Acceptance criteria

Run the existing development checks:

```bash
bun test
bunx tsc --noEmit
git diff --check
```

Complete the revision/load and real bracketed-paste checks in the table.
