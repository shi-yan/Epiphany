import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import katex from "katex"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

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
        this.input.className = "limpid-equation-input"
        this.input.style.paddingLeft="0px";

        this.input.style.display = "none";
        this.dom.appendChild(this.input);

        this.display = document.createElement("span");
        this.display.style.display = "inline-block";
        this.dom.appendChild(this.display);

        let self = this;

        this.input.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowLeft') {

                let curPos =  this.input.selectionStart;

                if (curPos == 0) {
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
            } else if (e.code === 'ArrowRight') {

                let curPos =  this.input.selectionStart;

                if (curPos == this.input.value.length) {
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

        if (this.node.textContent && this.node.textContent.length > 0) {
            katex.render(this.node.textContent, this.display, {
                displayMode: false,
                throwOnError: false
            });
        }
        else{
            let ns = new NodeSelection(this.outerView.state.doc.resolve(getPos()));

            let tr = self.outerView.state.tr.setSelection(ns).scrollIntoView()
            setTimeout(() => {
                self.outerView.dispatch(tr)
                self.outerView.focus()
            });
    
        }

    }

    update(node) {
        if (node.type != this.node.type) return false
        this.node = node;

        let content = this.node.textContent;

        if (content.length == 0) {
            content = this.input.value;
        }

        katex.render(this.node.textContent, this.display, {
            displayMode: false,
            throwOnError: false
        });

        return true;
    }

    selectNode() {
        this.input.style.display = 'inline-block';
        this.display.style.display = 'none';

        if (this.node.content.size == 0) {
            this.input.value = "c = \\pm\\sqrt{a^2 + b^2}";
        }
        else {
            this.input.value = this.node.textContent;
        }
        this.input.focus();
    }

    deselectNode() {
        this.input.style.display = 'none';
        this.display.style.display = 'inline-block';

        this.input.blur();
        let nn = textSchema.text(this.input.value);

        if (this.input.value == this.node.textContent) {
            katex.render(this.node.textContent, this.display, {
                displayMode: false,
                throwOnError: false
            });
        } else {
            setTimeout(() => {
                let tr = this.outerView.state.tr.replaceWith(this.getPos() + 1, this.getPos() + 1 + this.node.nodeSize - 2, nn);
                this.outerView.dispatch(tr);
            }, 100);
        }
    }

    stopEvent() {
        return true;
    }

    destroy() {
        console.log('equation destroyed ')
    }
}
