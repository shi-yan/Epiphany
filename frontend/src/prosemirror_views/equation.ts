import textSchema from "../textschema.js"
import { Selection, NodeSelection } from "prosemirror-state"
import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"
import EquationManager from "../equation_manager.js"
import katex from "katex"
import 'katex/dist/katex.min.css'

export default class EquationView implements NodeView {
    dom: HTMLElement
    node: PMNode
    outerView: EditorView
    getPos: () => number | undefined
    displayId: number
    key: string
    manager: EquationManager

    private input: HTMLTextAreaElement
    display: HTMLDivElement
    private idElm: HTMLDivElement

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined, manager: EquationManager) {
        this.node = node
        this.outerView = view
        this.getPos = getPos
        this.displayId = 0
        this.key = node.attrs.id
        this.manager = manager

        this.dom = document.createElement("div")
        this.dom.setAttribute('data-key', this.key)
        this.dom.classList.add('limpid-equation')

        this.input = document.createElement("textarea")
        this.input.className = "limpid-equation-textarea"
        this.dom.appendChild(this.input)

        this.display = document.createElement("div")
        this.display.className = "limpid-equation-display"
        this.dom.appendChild(this.display)

        this.idElm = document.createElement("div")
        this.idElm.className = 'limpid-equation-counter'
        this.idElm.setAttribute('data-key', this.key)
        this.idElm.innerText = '(' + this.displayId + ')'
        this.dom.appendChild(this.idElm)

        const self = this

        this.input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === 'ArrowUp') {
                const curLine = this.input.value.substring(0, this.input.selectionStart).split("\n").length - 1

                if (curLine == 0) {
                    self.input.blur()
                    const targetPos = getPos()
                    if (targetPos !== undefined) {
                        const pos = self.outerView.state.doc.resolve(targetPos)
                        const selection = Selection.near(pos, -1)
                        const tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
                        setTimeout(() => {
                            self.outerView.dispatch(tr)
                            self.outerView.focus()
                        }, 100)
                    }
                }
            } else if (e.code === 'ArrowDown') {
                const curLine = this.input.value.substring(0, this.input.selectionStart).split("\n").length - 1
                const allLines = this.input.value.split("\n").length - 1

                if (curLine == allLines) {
                    self.input.blur()
                    const targetPos = getPos()
                    if (targetPos !== undefined) {
                        const pos = targetPos + self.node.nodeSize
                        const selection = Selection.near(self.outerView.state.doc.resolve(pos), 1)
                        const tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
                        setTimeout(() => {
                            self.outerView.dispatch(tr)
                            self.outerView.focus()
                        })
                    }
                }
            }

            e.stopImmediatePropagation()
            e.stopPropagation()
        })

        this.manager.register(this.key, this)

        if (this.node.textContent && this.node.textContent.length > 0) {
            this.input.blur()

            katex.render(this.node.textContent, this.display, {
                displayMode: true,
                throwOnError: false
            })
        }
        else {
            const pos = getPos()
            if (pos !== undefined) {
                const ns = new NodeSelection(this.outerView.state.doc.resolve(pos))
                const tr = self.outerView.state.tr.setSelection(ns).scrollIntoView()
                setTimeout(() => {
                    self.outerView.dispatch(tr)
                    self.outerView.focus()
                })
            }
        }
    }

    update(node: PMNode): boolean {
        if (node.type != this.node.type) return false
        this.node = node

        let content = this.node.textContent

        if (content.length == 0) {
            content = this.input.value
        }

        katex.render(this.node.textContent, this.display, {
            displayMode: true,
            throwOnError: false
        })

        return true
    }

    selectNode(): void {
        this.input.classList.add("limpid-equation-textarea-edit-mode")
        this.display.classList.add("limpid-equation-display-edit-mode")
        this.idElm.classList.add('limpid-equation-counter-edit-mode')

        if (this.node.content.size == 0) {
            this.input.value = "c = \\pm\\sqrt{a^2 + b^2}"
        }
        else {
            this.input.value = this.node.textContent
        }
        this.input.focus()
    }

    deselectNode(): void {
        this.input.classList.remove("limpid-equation-textarea-edit-mode")
        this.display.classList.remove("limpid-equation-display-edit-mode")
        this.idElm.classList.remove('limpid-equation-counter-edit-mode')
        this.input.blur()
        const nn = textSchema.text(this.input.value)

        if (this.input.value == this.node.textContent) {
            katex.render(this.node.textContent, this.display, {
                displayMode: true,
                throwOnError: false
            })
        } else {
            setTimeout(() => {
                const pos = this.getPos()
                if (pos !== undefined) {
                    const tr = this.outerView.state.tr.replaceWith(pos + 1, pos + 1 + this.node.nodeSize - 2, nn)
                    this.outerView.dispatch(tr)
                }
            }, 100)
        }
    }

    stopEvent(): boolean {
        return true
    }

    destroy(): void {
        this.manager.remove(this.key)
    }
}