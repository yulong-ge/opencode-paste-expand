# opencode-paste-expand

TUI plugin for [OpenCode](https://opencode.ai): paste once to insert a collapsed `[Pasted ~N lines]` placeholder, paste again to expand it back to the original text — matching the Claude Code workflow.

## Behavior

- Any paste (Cmd+V on macOS, Ctrl+V on Windows/Linux, Edit > Paste, or bracketed-paste sequences from your terminal) lands collapsed as usual.
- Press the paste shortcut **again** while a placeholder exists → the **most recent** placeholder expands in place. Repeat to expand older placeholders one by one.
- Once every placeholder is expanded, the paste shortcut falls through to normal pasting.
- File/image attachments and agent mentions are untouched; only pasted-text placeholders expand.
- `app.toggle.paste_summary` honored automatically: if placeholder collapsing is disabled, the plugin is inert.

Version 0.2.0 supports both OpenCode v1 and v2. The v1 entry point keeps the
PromptRef-based implementation for OpenCode 1.x. The v2 entry point uses the
public TUI context and the focused editor's extmarks, so it does not replace
the host prompt component or load a second OpenTUI runtime.

## Install

For OpenCode v2, add the package to `~/.config/opencode/cli.json` (or the
project `opencode.json`):

```json
{
  "plugins": [
    "git+https://github.com/yulong-ge/opencode-paste-expand.git"
  ]
}
```

For OpenCode v1, add it to `~/.config/opencode/tui.json` (or
`.opencode/tui.json` in a project):

```json
{
  "plugin": ["git+https://github.com/yulong-ge/opencode-paste-expand.git"]
}
```

Or pin a commit/tag:

```json
{
  "plugin": ["git+https://github.com/yulong-ge/opencode-paste-expand.git#<commit-or-tag>"]
}
```

Local checkout (for development):

```json
{
  "plugin": ["file:///path/to/opencode-paste-expand"]
}
```

> **Important**: OpenCode v2 uses `plugins` in `cli.json`/`opencode.json`.
> OpenCode v1 uses `plugin` in `tui.json`/`tui.jsonc`. Keep only the config
> entry for the OpenCode version you run.

## How it works

In OpenCode v1, the plugin registers replacements for the `session_prompt` and
`home_prompt` host slots and expands through the official `PromptRef`. In
OpenCode v2, it listens to the global paste event, remembers the original text
when the host creates a collapsed placeholder extmark, and expands the newest
remembered extmark with the editor's public editing primitives before allowing
the next paste to continue.

It also registers a palette command `opencode-paste-expand.expand` (category "Prompt") you can bind to any key in `tui.json` keybinds.

## Notes

- The v2 bridge can remember placeholders created after the plugin loads. A
  placeholder already persisted in a draft may not be expandable if its
  original bytes were never observed by the plugin; the v2 API does not expose
  the host's historical paste store.
- Expanding via `ref.set` in v1 moves the cursor to the end of the buffer
  (same as OpenCode's own prompt restore).
- `ctrl+v` bound to `prompt.paste` (empty-clipboard fallback path) does not expand; only real paste events do.

## License

MIT
