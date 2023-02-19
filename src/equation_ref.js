import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"

export default class EquationRefView {
    constructor(node, view, getPos, equationManager) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos
       
        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("span");
        this.dom.className = "limpid-equation-ref";
        let key = this.node.attrs.id;
        this.dom.setAttribute('data-equation-key', key);

        this.dom.innerText = "Eq. " + equationManager.fetchCountByKey(key);
        console.log("create view for ref", this.node)
    }

    update(node) {
        if (node.type != this.node.type) return false
        this.node = node;
        return true;
    }

    selectNode() {
        this.dom.classList.add("ProseMirror-selectednode")
    }

    deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode")
    }

    stopEvent() {
        return true;
    }

    destroy() {
        console.log('equation destroyed ')
    }
}
