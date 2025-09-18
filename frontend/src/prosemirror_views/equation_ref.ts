import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"
import EquationManager from "../equation_manager.js"

export default class EquationRefView implements NodeView {
    dom: HTMLElement
    node: PMNode
    outerView: EditorView
    getPos: () => number | undefined

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined, equationManager: EquationManager) {
        this.node = node
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("span")
        this.dom.className = "limpid-equation-ref"
        const key = this.node.attrs.id
        this.dom.setAttribute('data-equation-key', key)

        this.dom.innerText = "Eq. " + equationManager.fetchCountByKey(key)
    }

    update(node: PMNode): boolean {
        if (node.type != this.node.type) return false
        this.node = node
        return true
    }

    selectNode(): void {
        this.dom.classList.add("ProseMirror-selectednode")
    }

    deselectNode(): void {
        this.dom.classList.remove("ProseMirror-selectednode")
    }

    stopEvent(): boolean {
        return true
    }

    destroy(): void {
        console.log('equation destroyed ')
    }
}