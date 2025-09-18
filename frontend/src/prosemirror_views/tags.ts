import textSchema from "../textschema.js"
import { Selection } from "prosemirror-state"
import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"

export default class TagsView implements NodeView {
    dom: HTMLElement
    node: PMNode
    outerView: EditorView
    getPos: () => number | undefined

    private input: HTMLInputElement

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
        this.node = node
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.classList.add('limpid-tag-area')

        this.input = document.createElement("input")
        this.input.classList.add('limpid-tag-input')
        this.input.classList.add('limpid-no-outline')
        this.input.placeholder = "Hit Enter, Tab or Comma to add a tag. Click on a tag to remove..."
        this.dom.appendChild(this.input)

        this.dom.onclick = (e: MouseEvent) => {
            e.preventDefault()
            this.input.focus()
        }

        this.input.addEventListener('keyup', function (e: KeyboardEvent) {
            e.preventDefault()
            e.stopImmediatePropagation()
            e.stopPropagation()
        })

        this.input.addEventListener('keydown', (e: KeyboardEvent) => {
            if (!!(~['Enter', 'Tab', 'Comma'].indexOf(e.code))) {
                e.preventDefault()

                if (this.input.value.length == 0) {
                    if (e.code === 'Tab') {
                        this.input.blur()
                        const targetPos = getPos()
                        if (targetPos !== undefined) {
                            const pos = targetPos + this.node.nodeSize
                            const selection = Selection.near(this.outerView.state.doc.resolve(pos), 1)
                            const tr = this.outerView.state.tr.setSelection(selection).scrollIntoView()
                            setTimeout(() => {
                                this.outerView.dispatch(tr)
                                this.outerView.focus()
                            }, 100)
                        }
                        return
                    }
                    else {
                        return
                    }
                }

                const existingSet = new Set<string>()

                this.node.forEach((node: PMNode) => {
                    existingSet.add(node.textContent.toLowerCase())
                })

                existingSet.add(this.input.value.toLowerCase())
                let existingArray = Array.from(existingSet)
                existingArray.sort()
                existingArray.reverse()

                this.input.value = ''
                const tagNodes: PMNode[] = []
                existingArray.forEach((v: string) => {
                    const nn = textSchema.nodes.tag.createAndFill(null, textSchema.text(v))
                    if (nn) {
                        tagNodes.push(nn)
                    }
                })

                const pos = getPos()
                if (pos !== undefined) {
                    const tr = this.outerView.state.tr.replaceWith(pos + 1, pos + 1 + this.node.nodeSize - 2, tagNodes)
                    this.outerView.dispatch(tr)
                }
            }
            else if (e.code === 'ArrowUp') {
                this.input.blur()
                const targetPos = getPos()
                if (targetPos !== undefined) {
                    const selection = Selection.near(this.outerView.state.doc.resolve(targetPos), -1)
                    const tr = this.outerView.state.tr.setSelection(selection).scrollIntoView()
                    setTimeout(() => {
                        this.outerView.dispatch(tr)
                        this.outerView.focus()
                    }, 100)
                }
            }
            else if (e.code === 'ArrowDown') {
                this.input.blur()
                const targetPos = getPos()
                if (targetPos !== undefined) {
                    const pos = targetPos + this.node.nodeSize
                    const selection = Selection.near(this.outerView.state.doc.resolve(pos), 1)
                    const tr = this.outerView.state.tr.setSelection(selection).scrollIntoView()
                    setTimeout(() => {
                        this.outerView.dispatch(tr)
                        this.outerView.focus()
                    }, 100)
                }
            }
            this.input.style.opacity = '1.0'
            e.stopImmediatePropagation()
            e.stopPropagation()
        })

        this.node.forEach((subNode: PMNode) => {
            const tag = document.createElement("span")
            tag.classList.add('limpid-tag-item')
            tag.innerText = '#' + subNode.textContent
            this.dom.insertBefore(tag, this.dom.firstChild)

            if (this.input.placeholder.length > 0) {
                this.input.placeholder = ''
                this.input.style.minWidth = '100px'
            }
        })
    }

    update(node: PMNode): boolean {
        if (node.type != this.node.type) return false
        this.node = node
        let tags = this.dom.getElementsByTagName("span")

        while (tags.length > 0) {
            this.dom.removeChild(tags[0])
            tags = this.dom.getElementsByTagName("span")
        }

        this.node.forEach((subNode: PMNode) => {
            const tag = document.createElement("span")
            tag.classList.add('limpid-tag-item')
            tag.innerText = '#' + subNode.textContent
            this.dom.insertBefore(tag, this.dom.firstChild)

            if (this.input.placeholder.length > 0) {
                this.input.placeholder = ''
                this.input.style.minWidth = '100px'
            }
        })

        return true
    }

    selectNode(): void {
        this.input.focus()
    }

    deselectNode(): void {
        this.input.blur()
    }

    stopEvent(): boolean {
        return true
    }
}