import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import "./katex.min";
import "./katex.min.css";

export default class InlineEquationView {
    constructor(node, view, getPos) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos
       
        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.style.display='inline-block';
        this.dom.style.marginLeft='8px';
        this.dom.style.marginRight = '8px';
        this.input = document.createElement("input");
        this.input.hidden = true;
        this.input.style.display = "none";
        this.dom.appendChild(this.input);

        this.display = document.createElement("span");
        this.display.style.display = "inline-block";
        this.dom.appendChild(this.display);

        katex.render("c = \\pm\\sqrt{a^2 + b^2}", this.display, {
            throwOnError: false
        });
    }

    update(node) {
        console.log('node update', node)
        this.node = node;
        return true;
    }

    selectNode() {
        console.log('node selected')
        this.dom.classList.add("ProseMirror-selectednode")
        this.input.style.display = 'inline-block';
        this.display.style.display = 'none';
        this.input.value = "c = \\pm\\sqrt{a^2 + b^2}";
        this.input.focus();
    }

    deselectNode() {
        this.dom.classList.remove("ProseMirror-selectednode")
        this.input.style.display = 'none';
        this.display.style.display = 'inline-block';
    }

    stopEvent() {
        return true;
    }

    destroy() {
        console.log('equation destroyed ')
    }
}
