import textSchema from "../textschema.js"
import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"
import katex from "katex"
import { Selection, NodeSelection } from "prosemirror-state"

export default class InlineEquationView implements NodeView {
    dom: HTMLElement
    node: PMNode
    outerView: EditorView
    getPos: () => number | undefined

    private input: HTMLInputElement
    private display: HTMLSpanElement

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
        this.node = node
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.style.display = 'inline-block'
        this.dom.style.marginLeft = '8px'
        this.dom.style.marginRight = '8px'

        this.input = document.createElement("input")
        this.input.hidden = true
        this.input.className = "limpid-equation-input"
        this.input.style.paddingLeft = "0px"
        this.input.style.display = "none"
        this.dom.appendChild(this.input)

        this.display = document.createElement("span")
        this.display.style.display = "inline-block"
        this.dom.appendChild(this.display)

        const self = this

        this.input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.code === 'ArrowLeft') {
                const curPos = this.input.selectionStart

                if (curPos == 0) {
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
            } else if (e.code === 'ArrowRight') {
                const curPos = this.input.selectionStart

                if (curPos == this.input.value.length) {
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

        if (this.node.textContent && this.node.textContent.length > 0) {
            katex.render(this.node.textContent, this.display, {
                displayMode: false,
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
            displayMode: false,
            throwOnError: false
        })

        return true
    }

    selectNode(): void {
        this.input.style.display = 'inline-block'
        this.display.style.display = 'none'

        if (this.node.content.size == 0) {
            this.input.value = "c = \\pm\\sqrt{a^2 + b^2}"
        }
        else {
            this.input.value = this.node.textContent
        }
        this.input.focus()
    }

    deselectNode(): void {
        this.input.style.display = 'none'
        this.display.style.display = 'inline-block'

        this.input.blur()
        const nn = textSchema.text(this.input.value)

        if (this.input.value == this.node.textContent) {
            katex.render(this.node.textContent, this.display, {
                displayMode: false,
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
        console.log('equation destroyed ')
    }
}