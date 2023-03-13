import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"

export default class GalleryView {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.className = 'gallery-container';

        this.imageContainer = document.createElement("div");
        this.imageContainer.className = 'gallery-image-container';

        let inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.id = "actual-btn";
        inputElem.hidden = true;
        inputElem.onchange = function (e) {
            e.preventDefault();
            let nn = textSchema.nodes.image.createAndFill({
                file: 'file'
            }, null);
            let tr = new Transform(node);
            tr.replaceWith(0, node.nodeSize - 2, [nn]);
            let offsetMap = StepMap.offset(getPos() + 1);
            let outerTr = view.state.tr;
            let steps = tr.steps
            for (let j = 0; j < steps.length; j++) {
                outerTr.step(steps[j].map(offsetMap))
            }
            if (outerTr.docChanged) view.dispatch(outerTr);
        };

        let labelElem = document.createElement("label");
        labelElem.for = "actual-btn";
        labelElem.className = 'gallery-upload-button';
        labelElem.innerText = "Choose Image File";
        labelElem.appendChild(inputElem);
        this.dom.appendChild(this.imageContainer);
        this.dom.appendChild(labelElem)
    }

    createDom(node) {

    }

    update(node) {
        if (node.type != this.node.type) return false
        this.node = node;

        if (node.childCount > 0) {
            let imgElem = document.createElement("img");
            imgElem.src = "https://www.cam.ac.uk/sites/www.cam.ac.uk/files/styles/content-885x432/public/news/research/news/crop_178.jpg";
            this.imageContainer.appendChild(imgElem)
        }

        return true;
    }

    selectNode() { }
    deselectNode() { }

    stopEvent() {
        return true;
      }
}