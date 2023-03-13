import {
    EditorView as CodeMirror, keymap as cmKeymap, drawSelection
} from "@codemirror/view"
import { Compartment } from "@codemirror/state"

import { javascript } from "@codemirror/lang-javascript"
import { defaultKeymap } from "@codemirror/commands"
import { syntaxHighlighting, defaultHighlightStyle } from "@codemirror/language"

import { exitCode } from "prosemirror-commands"
import { undo, redo } from "prosemirror-history"
import textSchema from "./textschema"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"
import { solarizedDark } from 'cm6-theme-solarized-dark'
import { gruvboxDark } from 'cm6-theme-gruvbox-dark'
//const module = await import('@codemirror/lang-css')

//console.log("lang-css module", module);


export default class CodeBlockView {
    constructor(node, view, getPos) {
        // Store for later
        this.node = node;
        this.view = view;
        this.getPos = getPos;

        this.javascript_module = null;
        this.python_module = null;
        this.cpp_module = null;
        this.rust_module = null;
        this.html_module = null;
        this.json_module = null;
        this.css_module = null;

        // let self = this;

        //   const module = await import('@codemirror/lang-javascript')

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
                //   javascript(),
                langHolder.of([]),
                gruvboxDark,
                CodeMirror.updateListener.of(update => this.forwardUpdate(update))
            ]
        })

        // The editor's outer node is our DOM representation
        this.dom = this.cm.dom
        this.cm.dom.style.borderRadius = '8px';

        // This flag is used to avoid an update loop between the outer and
        // inner editor
        this.updating = false;

        setTimeout(async () => {
            switch (this.node.attrs.lang) {
                case 'javascript': {
                    if (!this.javascript_module) {
                        this.javascript_module = await import('@codemirror/lang-javascript');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.javascript_module.javascript()) });
                } break;
                case 'python': {
                    if (!this.python_module) {
                        this.python_module = await import('@codemirror/lang-python');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.python_module.python()) });
                } break;
                case 'cpp': {
                    if (!this.cpp_module) {
                        this.cpp_module = await import('@codemirror/lang-cpp');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.cpp_module.cpp()) });
                } break;
                case 'rust': {
                    if (!this.rust_module) {
                        this.rust_module = await import('@codemirror/lang-rust');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.rust_module.rust()) })
                } break;
                case 'html': {
                    if (!this.html_module) {
                        this.html_module = await import('@codemirror/lang-html');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.html_module.html()) })
                } break;
                case 'css': {
                    if (!this.css_module) {
                        this.css_module = await import('@codemirror/lang-css');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.css_module.css()) })
                } break;
                case 'json': {
                    if (!this.json_module) {
                        this.json_module = await import('@codemirror/lang-json');
                    }
                    this.cm.dispatch({ effects: langHolder.reconfigure(this.json_module.json()) })
                } break;

            }
        }, 100)

    }
    // }
    // nodeview_forwardUpdate{
    forwardUpdate(update) {
        if (this.updating || !this.cm || !this.cm.hasFocus) return
        let offset = this.getPos() + 1, { main } = update.state.selection
        let selFrom = offset + main.from, selTo = offset + main.to
        let pmSel = this.view.state.selection
        if (update.docChanged || pmSel.from != selFrom || pmSel.to != selTo) {
            let tr = this.view.state.tr
            update.changes.iterChanges((fromA, toA, fromB, toB, text) => {
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
    // }
    // nodeview_setSelection{
    setSelection(anchor, head) {
        this.cm.focus()
        this.updating = true
        this.cm.dispatch({ selection: { anchor, head } })
        this.updating = false
    }
    // }
    // nodeview_keymap{
    codeMirrorKeymap() {
        let view = this.view
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

    maybeEscape(unit, dir) {
        let { state } = this.cm, { main } = state.selection
        if (!main.empty) return false
        if (unit == "line") main = state.doc.lineAt(main.head)
        if (dir < 0 ? main.from > 0 : main.to < state.doc.length) return false
        let targetPos = this.getPos() + (dir < 0 ? 0 : this.node.nodeSize)
        let selection = Selection.near(this.view.state.doc.resolve(targetPos), dir)
        let tr = this.view.state.tr.setSelection(selection).scrollIntoView()
        this.view.dispatch(tr)
        this.view.focus()
    }
    // }
    // nodeview_update{
    update(node) {
        if (node.type != this.node.type) return false
        this.node = node
        if (this.updating) return true
        let newText = node.textContent, curText = this.cm.state.doc.toString()
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
    // }
    // nodeview_end{

    selectNode() { this.cm.focus() }
    stopEvent() { return true }
}