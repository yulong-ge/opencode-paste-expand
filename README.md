# opencode-paste-expand

TUI plugin for [OpenCode](https://opencode.ai): paste once to insert a collapsed `[Pasted ~N lines]` placeholder, paste again to expand it back to the original text — matching the Claude Code workflow.

## Behavior

- Any paste (Cmd+V on macOS, Ctrl+V on Windows/Linux, Edit > Paste, or bracketed-paste sequences from your terminal) lands collapsed as usual.
- Press the paste shortcut **again** while a placeholder exists → the **most recent** placeholder expands in place. Repeat to expand older placeholders one by one.
- Once every placeholder is expanded, the paste shortcut falls through to normal pasting.
- File/image attachments and agent mentions are untouched; only pasted-text placeholders expand.
- `app.toggle.paste_summary` honored automatically: if placeholder collapsing is disabled, the plugin is inert.

## Install

Add to `~/.config/opencode/tui.json` (or `.opencode/tui.json` in a project):

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

> **Important**: TUI plugins go in **`tui.json` / `tui.jsonc`**, not `opencode.json`. Both `tui.json` and `tui.jsonc` are read and their `plugin` arrays are merged — if you have a `tui.jsonc`, the plugin must be added there (it shadows nothing, but keeping the spec in one file avoids confusion).

## How it works

The plugin registers replacements for the `session_prompt` and `home_prompt` host slots (rendering the same `api.ui.Prompt` component and forwarding the host's `ref` callback), so it gains the official `PromptRef` (`current`/`set`). A global `keyInput` "paste" listener — which fires before the textarea's `onPaste` — expands the latest placeholder via `PromptRef.set` and `preventDefault`s the paste when a placeholder existed.

It also registers a palette command `opencode-paste-expand.expand` (category "Prompt") you can bind to any key in `tui.json` keybinds.

## Notes

- Expanding via `ref.set` moves the cursor to the end of the buffer (same as OpenCode's own prompt restore).
- `ctrl+v` bound to `prompt.paste` (empty-clipboard fallback path) does not expand; only real paste events do.

## License

MIT
