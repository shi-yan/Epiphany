import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { tauri_dialog , tauri_invoke, tauri_convertFileSrc} from "./tauri_mock";

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
        this.plus.innerHTML = '<i class="icon icon-image-plus">&#x69;</i>';
        this.plus.onclick = (e) => {
            e.preventDefault()
            this.addNewImage()
        }
        this.imageContainer = document.createElement("div");
        this.imageContainer.className = 'gallery-image-container';

        this.elems = [];

        this. inputElem = document.createElement("button");
        this.inputElem.id = "actual-btn";
        this.inputElem.className = 'gallery-upload-button';
        this.inputElem.innerText = "Choose Image File";

        this.inputElem.onclick = (e) => {
            e.preventDefault();
            this.addNewImage();
        }

        this.dom.appendChild(this.imageContainer);
        this.dom.appendChild(this.inputElem)


        this.elems = [];

        node.forEach((node, offset, index) => {
            let div = document.createElement("div");
            div.className = "fade";
            let imgElem = document.createElement("img");
            tauri_invoke('to_asset_absolute_path', {imageFilename: node.attrs.file}).then(filename => {
                console.log("image absolute path", filename);
                tauri_convertFileSrc(filename).then(url => {
                    console.log('url', url);
                    imgElem.src = url;
                    imgElem.style.width = '100%';
                    imgElem.display = 'none';
                })
            })

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
                                    let tr = this.outerView.state.tr.setNodeAttribute(this.getPos() + 1 + offset, 'description', textarea.textContent);
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
            this.imageContainer.appendChild(this.plus);
            this.showSlides(0);
            this.inputElem.style.display = 'none';
        }
    

    }

    async addNewImage() {

        const file = await tauri_dialog().open({
            multiple: false,
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp']
            }],
            title: 'Choose images'
        });

        console.log("selected", file)

        if (file){
            let newFilename = await tauri_invoke('save_image', {imageFilename: file});
            console.log("new image filename", newFilename);


            let nns = [];
            this.node.forEach((n, offset, index) => {
                let nn = textSchema.nodes.image.createAndFill({
                    file: n.attrs.file,
                    description: n.attrs.description
                }, null);
                nns.push(nn);
            });
    
            let nn = textSchema.nodes.image.createAndFill({
                file: newFilename
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
    
            this.inputElem.style.display = 'none';
        }
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
            tauri_invoke('to_asset_absolute_path', {imageFilename: node.attrs.file}).then(filename => {
                console.log("image absolute path", filename);
                tauri_convertFileSrc(filename).then(url => {
                    console.log('url', url);
                    imgElem.src = url;
                    imgElem.style.width = '100%';
                    imgElem.display = 'none';
                })
            })

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
                                    let tr = this.outerView.state.tr.setNodeAttribute(this.getPos() + 1 + offset, 'description', textarea.textContent);
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