import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"
import katex from "katex"
import 'katex/dist/katex.min.css'

export default class EquationView {
    constructor(node, view, getPos, manager) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos
        this.displayId = 0;
        this.key = new Date().getTime();
        this.manager = manager

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.setAttribute('data-key', this.key);
        this.dom.classList.add('limpid-equation');

        this.input = document.createElement("textarea");
        this.input.className = "limpid-equation-input"
        this.input.classList.add("limpid-equation-input-edit-mode");
        this.dom.appendChild(this.input);

        this.display = document.createElement("div");
        this.display.className = "limpid-equation-display";
        this.display.classList.add("limpid-equation-display-edit-mode");
        this.dom.appendChild(this.display);

        this.idElm = document.createElement("div");
        this.idElm.className = 'limpid-equation-counter';
        this.idElm.classList.add('limpid-equation-counter-edit-mode');
        this.idElm.setAttribute('data-key', this.key);
        this.idElm.innerText = '(' + this.displayId + ')';
        this.dom.appendChild(this.idElm);

        let self = this;
        let ns = new NodeSelection(this.outerView.state.doc.resolve(getPos()));

        let tr = self.outerView.state.tr.setSelection(ns).scrollIntoView()
        setTimeout(() => {
            self.outerView.dispatch(tr)
            self.outerView.focus()
        });

        this.input.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') {

                let curLine = this.input.value.substring(0, this.input.selectionStart).split("\n").length - 1;

                if (curLine == 0) {
                    self.input.blur();
                    let targetPos = getPos()
                    let pos = self.outerView.state.doc.resolve(targetPos)
                    let selection = Selection.near(pos, -1)
                    let tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
                    setTimeout(() => {
                        self.outerView.dispatch(tr)
                        self.outerView.focus()
                    }, 100);
                }
            } else if (e.code === 'ArrowDown') {

                let curLine = this.input.value.substring(0, this.input.selectionStart).split("\n").length - 1;
                let allLines = this.input.value.split("\n").length - 1;

                if (curLine == allLines) {
                    self.input.blur();
                    let targetPos = getPos() + self.node.nodeSize
                    let selection = Selection.near(self.outerView.state.doc.resolve(targetPos), 1)
                    let tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
                    setTimeout(() => {
                        self.outerView.dispatch(tr)
                        self.outerView.focus()
                    });
                }
            }

            e.stopImmediatePropagation();
            e.stopPropagation();
        });

        this.manager.register(this.key, this);
    }

    update(node) {
        if (node.type != this.node.type) return false
        this.node = node;

        let content = this.node.textContent;

        if (content.length == 0) {
            content = this.input.value;
        }

        katex.render(this.node.textContent, this.display, {
            displayMode: true,
            throwOnError: false
        });

        return true;
    }

    selectNode() {
        //this.dom.classList.add("ProseMirror-selectednode")
        this.input.classList.add("limpid-equation-input-edit-mode");
        this.display.classList.add("limpid-equation-display-edit-mode");
        this.idElm.classList.add('limpid-equation-counter-edit-mode');

        if (this.node.content.size == 0) {
            this.input.value = "c = \\pm\\sqrt{a^2 + b^2}";
        }
        else {
            this.input.value = this.node.textContent;
        }
        this.input.focus();
    }

    deselectNode() {
        //this.dom.classList.remove("ProseMirror-selectednode")
        this.input.classList.remove("limpid-equation-input-edit-mode");
        this.display.classList.remove("limpid-equation-display-edit-mode");
        this.idElm.classList.remove('limpid-equation-counter-edit-mode');
        this.input.blur();
        let nn = textSchema.text(this.input.value);

        if (this.input.value == this.node.textContent) {
            katex.render(this.node.textContent, this.display, {
                displayMode: true,
                throwOnError: false
            });
        } else {
            setTimeout(() => {
                let tr = this.outerView.state.tr.replaceWith(this.getPos() + 1, this.getPos() + 1 + this.node.nodeSize - 2, nn);
                this.outerView.dispatch(tr);

                // let tr = this.outerView.state.tr.setNodeAttribute(this.getPos(), 'latex', this.input.value);
                // this.outerView.dispatch(tr);

            }, 100);
        }
    }

    stopEvent() {
        return true;
    }

    destroy() {
        this.manager.remove(this.key);
    }
}
