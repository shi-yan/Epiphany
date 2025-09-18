import {
    EditorView as CodeMirror, keymap as cmKeymap, drawSelection
} from "@codemirror/view"
import type { ViewUpdate } from "@codemirror/view"
import { Compartment } from "@codemirror/state"
import { defaultKeymap } from "@codemirror/commands"
import { exitCode } from "prosemirror-commands"
import { undo, redo } from "prosemirror-history"
import textSchema from "../textschema.ts"
import { TextSelection, Selection } from "prosemirror-state"
import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"
import { gruvboxDark } from 'cm6-theme-gruvbox-dark'

// Language module types - these are dynamic imports
interface LanguageModule {
    javascript?: () => any
    python?: () => any
    cpp?: () => any
    rust?: () => any
    html?: () => any
    css?: () => any
    json?: () => any
}

export default class CodeBlockView implements NodeView {
    dom: HTMLElement
    node: PMNode
    view: EditorView
    getPos: () => number | undefined

    private cm: CodeMirror
    private updating: boolean

    // Language modules for dynamic imports
    private javascript_module: LanguageModule | null = null
    private python_module: LanguageModule | null = null
    private cpp_module: LanguageModule | null = null
    private rust_module: LanguageModule | null = null
    private html_module: LanguageModule | null = null
    private json_module: LanguageModule | null = null
    private css_module: LanguageModule | null = null

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
        // Store for later
        this.node = node
        this.view = view
        this.getPos = getPos

        // Create a CodeMirror instance
        const langHolder = new Compartment()

        this.cm = new CodeMirror({
            doc: this.node.textContent,
            extensions: [
                cmKeymap.of([
                    ...this.codeMirrorKeymap(),
                    ...defaultKeymap
                ]),
                drawSelection(),
                langHolder.of([]),
                gruvboxDark,
                CodeMirror.updateListener.of(update => this.forwardUpdate(update))
            ]
        })

        // The editor's outer node is our DOM representation
        this.dom = this.cm.dom
        this.cm.dom.style.borderRadius = '8px'

        // This flag is used to avoid an update loop between the outer and
        // inner editor
        this.updating = false

        setTimeout(async () => {
            switch (this.node.attrs.lang) {
                case 'javascript': {
                    if (!this.javascript_module) {
                        this.javascript_module = await import('@codemirror/lang-javascript')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.javascript_module.javascript!()) })
                    break
                }
                case 'python': {
                    if (!this.python_module) {
                        this.python_module = await import('@codemirror/lang-python')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.python_module.python!()) })
                    break
                }
                case 'cpp': {
                    if (!this.cpp_module) {
                        this.cpp_module = await import('@codemirror/lang-cpp')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.cpp_module.cpp!()) })
                    break
                }
                case 'rust': {
                    if (!this.rust_module) {
                        this.rust_module = await import('@codemirror/lang-rust')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.rust_module.rust!()) })
                    break
                }
                case 'html': {
                    if (!this.html_module) {
                        this.html_module = await import('@codemirror/lang-html')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.html_module.html!()) })
                    break
                }
                case 'css': {
                    if (!this.css_module) {
                        this.css_module = await import('@codemirror/lang-css')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.css_module.css!()) })
                    break
                }
                case 'json': {
                    if (!this.json_module) {
                        this.json_module = await import('@codemirror/lang-json')
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.json_module.json!()) })
                    break
                }
            }
        }, 100)
    }

    forwardUpdate(update: ViewUpdate): void {
        if (this.updating || !this.cm || !this.cm.hasFocus) return
        let offset = this.getPos()! + 1
        const { main } = update.state.selection
        let selFrom = offset + main.from, selTo = offset + main.to
        let pmSel = this.view.state.selection
        if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
            let tr = this.view.state.tr
            update.changes.iterChanges((fromA: number, toA: number, fromB: number, toB: number, text: any) => {
                if (text.length)
                    tr.replaceWith(offset + fromA, offset + toA,
                        textSchema.text(text.toString()))
                else
                    tr.delete(offset + fromA, offset + toA)
                offset += (toB - fromB) - (toA - fromA)
            })
            tr.setSelection(TextSelection.create(tr.doc, selFrom, selTo))
            this.view.dispatch(tr)
        }
    }

    setSelection(anchor: number, head: number): void {
        this.cm.focus()
        this.updating = true
        this.cm.dispatch({ selection: { anchor, head } })
        this.updating = false
    }

    codeMirrorKeymap() {
        const view = this.view
        return [
            { key: "ArrowUp", run: () => this.maybeEscape("line", -1) },
            { key: "ArrowLeft", run: () => this.maybeEscape("char", -1) },
            { key: "ArrowDown", run: () => this.maybeEscape("line", 1) },
            { key: "ArrowRight", run: () => this.maybeEscape("char", 1) },
            {
                key: "Ctrl-Enter", run: () => {
                    if (!exitCode(view.state, view.dispatch)) return false
                    view.focus()
                    return true
                }
            },
            {
                key: "Ctrl-z", mac: "Cmd-z",
                run: () => undo(view.state, view.dispatch)
            },
            {
                key: "Shift-Ctrl-z", mac: "Shift-Cmd-z",
                run: () => redo(view.state, view.dispatch)
            },
            {
                key: "Ctrl-y", mac: "Cmd-y",
                run: () => redo(view.state, view.dispatch)
            }
        ]
    }

    maybeEscape(unit: "line" | "char", dir: number): boolean {
        const { state } = this.cm
        let { main } = state.selection
        if (!main.empty) return false
        if (unit == "line") {
            const line = state.doc.lineAt(main.head)
            if (dir < 0 ? line.from > 0 : line.to < state.doc.length) return false
        } else {
            if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false
        }
        const targetPos = this.getPos()! + (dir < 0 ? 0 : this.node.nodeSize)
        const selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
        const tr = this.view.state.tr.setSelection(selection).scrollIntoView()
        this.view.dispatch(tr)
        this.view.focus()
        return true
    }

    update(node: PMNode): boolean {
        if (node.type != this.node.type) return false
        this.node = node
        if (this.updating) return true
        const newText = node.textContent, curText = this.cm.state.doc.toString()
        if (newText != curText) {
            let start = 0, curEnd = curText.length, newEnd = newText.length
            while (start < curEnd &&
                curText.charCodeAt(start) == newText.charCodeAt(start)) {
                ++start
            }
            while (curEnd > start && newEnd > start &&
                curText.charCodeAt(curEnd - 1) == newText.charCodeAt(newEnd - 1)) {
                curEnd--
                newEnd--
            }
            this.updating = true
            this.cm.dispatch({
                changes: {
                    from: start, to: curEnd,
                    insert: newText.slice(start, newEnd)
                }
            })
            this.updating = false
        }
        return true
    }

    selectNode(): void {
        this.cm.focus()
    }

    stopEvent(): boolean {
        return true
    }
}