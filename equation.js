import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import "./katex.min";
import "./katex.min.css";

export default class EquationView {
    constructor(node, view, getPos, manager) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos
        this.displayId=0;
        this.key = new Date().getTime();
        this.manager = manager

        console.log('debug equation node', node, this.key);

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.setAttribute('data-key', this.key);
        this.dom.classList.add('limpid-equation');
        this.input = document.createElement("textarea");
        this.input.hidden = true;
        this.input.style.display = "block";
        this.input.style.width = "100%";
        this.input.style.border = "none";
        this.input.style.outline = "none";
        this.dom.appendChild(this.input);
        this.dom.style.padding = "10px";
        this.dom.style.textAlign = "center";

        this.display = document.createElement("div");
        this.display.style.display = "inline-block";
        this.display.style.marginLeft = "auto";
        this.display.style.marginRight = "auto";
        //  this.display.hidden = true;
        this.dom.appendChild(this.display);

        this.idElm = document.createElement("span");
        this.idElm.classList.add('limpid-equation-counter');
        this.idElm.setAttribute('data-key', this.key);
        this.idElm.style.float = 'right';
        this.idElm.innerText = '('+this.displayId+')';
        this.dom.appendChild(this.idElm);

        katex.render("c = \\pm\\sqrt{a^2 + b^2}", this.display, {
            throwOnError: false
        });



        console.log('test ====')
        this.manager.register(this.key, this);
    }

    update(node) {
        console.log('node update', node)

        return true;
    }

    selectNode() {
        console.log('node selected')
        this.dom.classList.add("ProseMirror-selectednode")
        this.input.style.display = 'block';
        this.display.style.display = 'none';
        console.log(this.display)
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
        this.manager.remove(this.key);
        console.log('equation destroyed ')
    }
}
