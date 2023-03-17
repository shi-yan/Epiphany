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
            this.showSlides(this.slideIndex - 1);
        }

        this.next = document.createElement('a');
        this.next.className = 'image-next';
        this.next.innerText = "❯";
        this.next.onclick = (e) => {
            this.showSlides(this.slideIndex + 1);
        }

        this.plus = document.createElement('a');
        this.plus.className = 'formatter-button';
        this.plus.style.position = 'absolute';
        this.plus.style.margin = '10px';
        this.plus.innerHTML = '<svg style="min-width:24px; min-height:24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>image-plus-outline</title><path fill="#38463e" stroke="#38463e" d="M13 19C13 19.7 13.13 20.37 13.35 21H5C3.9 21 3 20.11 3 19V5C3 3.9 3.9 3 5 3H19C20.11 3 21 3.9 21 5V13.35C20.37 13.13 19.7 13 19 13V5H5V19H13M13.96 12.29L11.21 15.83L9.25 13.47L6.5 17H13.35C13.75 15.88 14.47 14.91 15.4 14.21L13.96 12.29M20 18V15H18V18H15V20H18V23H20V20H23V18H20Z" /></svg>';
        this.plus.onclick = (e) => {
            e.preventDefault()
            this.addNewImage()
        }
        this.imageContainer = document.createElement("div");
        this.imageContainer.className = 'gallery-image-container';

        this.elems = [];

        let inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.id = "actual-btn";
        inputElem.hidden = true;
        this.labelElem = document.createElement("label");

        inputElem.onchange = (e) => {
            e.preventDefault();
            this.addNewImage();
        }

        this.labelElem.for = "actual-btn";
        this.labelElem.className = 'gallery-upload-button';
        this.labelElem.innerText = "Choose Image File";
        this.labelElem.appendChild(inputElem);
        this.dom.appendChild(this.imageContainer);
        this.dom.appendChild(this.labelElem)
    }

    addNewImage() {

        let nns = [];
        this.node.forEach((n, offset, index) => {
            let nn = textSchema.nodes.image.createAndFill({
                file: n.attrs.file,
                description: n.attrs.description
            }, null);
            nns.push(nn);
        });

        let nn = textSchema.nodes.image.createAndFill({
            file: this.node.attrs.file
        }, null);

        nns.push(nn);
        let tr = new Transform(this.node);
        tr.replaceWith(0, this.node.nodeSize - 2, nns);
        let offsetMap = StepMap.offset(this.getPos() + 1);
        let outerTr = this.outerView.state.tr;
        let steps = tr.steps
        for (let j = 0; j < steps.length; j++) {
            outerTr.step(steps[j].map(offsetMap))
        }
        if (outerTr.docChanged) this.outerView.dispatch(outerTr);

        this.labelElem.style.display = 'none';
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
            if (index == 0) {
                imgElem.src = "https://www.cam.ac.uk/sites/www.cam.ac.uk/files/styles/content-885x432/public/news/research/news/crop_178.jpg";
            } else {
                imgElem.src = "https://cdn.mos.cms.futurecdn.net/snbrHBRigvvzjxNGuUtcck-1920-80.jpg.webp";
            }
            imgElem.style.width = '100%';
            imgElem.display = 'none';
            div.appendChild(imgElem);

            const textarea = document.createElement("p");
            textarea.contentEditable = true;
            
            textarea.className = "image-description"
            textarea.setAttribute('data-ph', 'Image description ...')
            textarea.innerText = node.attrs.description

            textarea.onblur = (e) => {
                if (index < this.node.childCount) {
                    this.node.forEach((node, offset, eindex) => {
                        if (eindex == index) {
                            const innerContent = node.textContent;

                            if (textarea.textContent !== innerContent) {
                                setTimeout(() => {
                                    let tr = this.outerView.state.tr.setNodeAttribute(this.getPos() + 1 + offset, 'description',  textarea.textContent);
                                    this.outerView.dispatch(tr);
                                }, 100);
                            }
                        }
                    })
                }
            }

            div.appendChild(textarea);
            this.imageContainer.appendChild(div);
            this.elems.push(div);
        })

        if (this.elems.length > 0) {
            this.imageContainer.appendChild(this.prev);
            this.imageContainer.appendChild(this.next);
        }
        this.imageContainer.appendChild(this.plus);
        this.slideIndex = this.elems.length - 1;
        this.showSlides(this.slideIndex);
        return true;
    }

    showSlides(n) {
        this.slideIndex = n;
        if (n > this.elems.length - 1) { this.slideIndex = this.elems.length - 1 }
        if (n < 0) { this.slideIndex = 0 }

        for (let i = 0; i < this.elems.length; i++) {
            this.elems[i].style.display = "none";
        }
        this.elems[this.slideIndex].style.display = "block";
    }

    selectNode() { }
    deselectNode() { }

    stopEvent() {
        return true;
    }
}