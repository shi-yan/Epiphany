import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

export default class VideoView {
    constructor(node, view, getPos) {

        console.log("====================== create video");
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.style.textAlign = 'center';
        this.dom.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/wJ7yyP4rzP0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
        this.dom.style.borderRadius='8px';
        this.dom.style.overflow = 'hidden';
    }

    update(node) {
        if (node.type !== this.node.type) return false
        this.node = node;

        return true;
    }

    stopEvent() {
        return true;
    }

    selectNode() {
  
    }

    deselectNode() {}

    destroy() {
       
    }
}
