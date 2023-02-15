import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"

export default class GalleryView {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.style.backgroundColor = 'red'
        this.dom.style.minHeight = '50px';

        let inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.id = "actual-btn";
        inputElem.hidden = false;
        inputElem.onchange = function (e) {
            console.log(e)
            e.preventDefault();
            let nn = textSchema.nodes.image.createAndFill({
                file: 'file'
            }, null);
            let tr = new Transform(node);

            tr.replaceWith(0, node.nodeSize - 2, [nn]);
            console.log(tr);
            let offsetMap = StepMap.offset(getPos() + 1);
            let outerTr = view.state.tr;
            let steps = tr.steps
            for (let j = 0; j < steps.length; j++) {
                outerTr.step(steps[j].map(offsetMap))
            }
            if (outerTr.docChanged) view.dispatch(outerTr);

            console.log('trigger', getPos(), node)
        };

        let labelElem = document.createElement("label");
        labelElem.for = "actual-btn"
        labelElem.innerText = "Choose File"

        this.dom.appendChild(inputElem)
        this.dom.appendChild(labelElem)
    }

    createDom(node) {

    }

    update(node) {
        if (node.type != this.node.type) return false
        console.log("image node updated", node)
        this.node = node;
        if (node.childCount > 0) {
            console.log('img set')
            let imgElem = document.createElement("img");
            imgElem.src = "https://www.cam.ac.uk/sites/www.cam.ac.uk/files/styles/content-885x432/public/news/research/news/crop_178.jpg";
            this.dom.appendChild(imgElem)
            let inputElem = document.createElement("input");
            this.dom.appendChild(inputElem)
            let button = document.createElement("button");
            button.innerText = "set"
            this.dom.appendChild(button);
            console.log(node.child(0).resolve(0))
            console.log('trigger', this.getPos(), node)
        }

        return true;
    }

    selectNode() { }
    deselectNode() { }

    stopEvent() {
        return true;
      }
}