import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"

export default class GalleryView {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.className = 'gallery-container';

        this.prev = document.createElement('a');
        this.prev.className = 'image-prev';
        this.prev.innerText = "❮";
        this.slideIndex = 0;
        this.prev.onclick = (e) => {
            this.showSlides(this.slideIndex-1);
        } 
   
        this.next = document.createElement('a');
        this.next.className = 'image-next';
        this.next.innerText = "❯";
        this.next.onclick = (e) => {
            this.showSlides(this.slideIndex+1);
        }

        this.imageContainer = document.createElement("div");
        this.imageContainer.className = 'gallery-image-container';

        this.elems = [];

        let inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.id = "actual-btn";
        inputElem.hidden = true;
        let labelElem = document.createElement("label");

        inputElem.onchange = function (e) {
            e.preventDefault();
            let nns = [];
            node.forEach((node, offset, index) => {
                let nn = textSchema.nodes.image.createAndFill({
                    file: node.attrs.file
                }, null);
                nns.push(nn);
            });

            let nn = textSchema.nodes.image.createAndFill({
                file: node.attrs.file
            }, null);

            nns.push(nn);
            let tr = new Transform(node);
            tr.replaceWith(0, node.nodeSize - 2, nns);
            let offsetMap = StepMap.offset(getPos() + 1);
            let outerTr = view.state.tr;
            let steps = tr.steps
            for (let j = 0; j < steps.length; j++) {
                outerTr.step(steps[j].map(offsetMap))
            }
            if (outerTr.docChanged) view.dispatch(outerTr);

            //labelElem.style.display = 'none';
        };

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

        while (this.imageContainer.firstChild) {
            this.imageContainer.removeChild(this.imageContainer.firstChild);
        }

        this.elems = [];

        node.forEach((node, offset, index) => {
            let div = document.createElement("div");
            div.className = "fade";
            let imgElem = document.createElement("img");
            imgElem.src = "https://www.cam.ac.uk/sites/www.cam.ac.uk/files/styles/content-885x432/public/news/research/news/crop_178.jpg";
            imgElem.style.width = '100%';
            imgElem.display='none';
            div.appendChild(imgElem);
            this.imageContainer.appendChild(div);
            this.elems.push(div);
        })

        this.imageContainer.appendChild(this.prev);
        this.imageContainer.appendChild(this.next);

        this.slideIndex = this.elems.length-1;
        this.showSlides(this.slideIndex);
        return true;
    }

    showSlides(n) {
        this.slideIndex = n;
        if (n > this.elems.length-1) { this.slideIndex = this.elems.length - 1 }
        if (n < 0) { this.slideIndex = 0 }
        
        for (let i = 0; i < this.elems.length; i++) {
            this.elems[i].style.display = "none";
        }
        console.log(this.elems, this.slideIndex)
        this.elems[this.slideIndex].style.display = "block";
    }

    selectNode() { }
    deselectNode() { }

    stopEvent() {
        return true;
    }
}