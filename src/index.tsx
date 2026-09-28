/** @jsxImportSource @opentui/solid */
import type {
  TuiHostSlotMap,
  TuiPlugin,
  TuiPluginModule,
  TuiPromptRef,
  TuiSlotContext,
} from "@opencode-ai/plugin/tui"
import { expandLastPastedPlaceholder } from "./expand"

const id = "opencode-paste-expand"

const homePlaceholders = {
  normal: ["Fix a TODO in the codebase", "What is the tech stack of this project?", "Fix broken tests"],
  shell: ["ls -la", "git status", "pwd"],
}

const tui: TuiPlugin = async (api) => {
  let sessionRef: TuiPromptRef | undefined
  let homeRef: TuiPromptRef | undefined

  const expand = (): boolean => {
    for (const ref of [sessionRef, homeRef]) {
      if (!ref?.focused) continue

      const expanded = expandLastPastedPlaceholder(ref.current.input, ref.current.parts)
      if (!expanded) continue
      ref.set({ input: expanded.input, parts: expanded.parts })
      return true
    }
    return false
  }

  api.keymap.registerLayer({
    commands: [
      {
        name: `${id}.expand`,
        title: "Expand pasted placeholder",
        category: "Prompt",
        run() {
          expand()
        },
      },
    ],
  })

  const onPaste = (event: { defaultPrevented: boolean; preventDefault(): void }) => {
    if (event.defaultPrevented) return
    if (expand()) event.preventDefault()
  }
  api.renderer.keyInput.on("paste", onPaste)
  api.lifecycle.onDispose(() => {
    api.renderer.keyInput.off("paste", onPaste)
  })

  api.slots.register({
    order: 100,
    slots: {
      session_prompt(_ctx: Readonly<TuiSlotContext>, props: TuiHostSlotMap["session_prompt"]) {
        return (
          <api.ui.Prompt
            sessionID={props.session_id}
            visible={props.visible}
            disabled={props.disabled}
            onSubmit={props.on_submit}
            ref={(ref) => {
              sessionRef = ref
              props.ref?.(ref)
            }}
            right={<api.ui.Slot name="session_prompt_right" session_id={props.session_id} />}
          />
        )
      },
      home_prompt(_ctx: Readonly<TuiSlotContext>, props: TuiHostSlotMap["home_prompt"]) {
        return (
          <api.ui.Prompt
            ref={(ref) => {
              homeRef = ref
              props.ref?.(ref)
            }}
            placeholders={homePlaceholders}
            right={<api.ui.Slot name="home_prompt_right" />}
          />
        )
      },
    },
  })
}

const plugin: TuiPluginModule & { id: string } = {
  id,
  tui,
}

export default plugin
