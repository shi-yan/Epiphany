import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

export default class VideoView {
    constructor(node, view, getPos) {
        this.node = node
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div");
        this.dom.style.textAlign = 'center';
        //this.dom.innerHTML = '<iframe width="560" height="315" src="https://www.youtube.com/embed/wJ7yyP4rzP0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
        this.dom.style.borderRadius = '8px';
        this.dom.style.marginTop = '8px';
        this.dom.style.marginBottom = '8px';
        this.dom.style.overflow = 'hidden';
        this.dom.style.position = 'relative';

        this.input = document.createElement("input");
        this.input.className = "limpid-equation-input"
        
        this. icon = document.createElement('span');

        const color = '#d5ded4'
        this.icon.innerHTML = '<svg style="min-width:32px; min-height:32px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>youtube</title><path  stroke="' + color + '" fill="' + color + '"  d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" /></svg>'
        this.icon.style.position = 'absolute';
        this.icon.style.top = '2px';
        this.icon.style.left = '8px';
        
        this.dom.appendChild(this.input);
        this.dom.appendChild(this.icon);

        this.display = document.createElement('div');
        this.dom.appendChild(this.display);

        this.input.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowUp') {
                this.input.blur();
                let targetPos = getPos()
                let pos = this.outerView.state.doc.resolve(targetPos)
                let selection = Selection.near(pos, -1)
                let tr = this.outerView.state.tr.setSelection(selection).scrollIntoView()
                setTimeout(() => {
                    this.outerView.dispatch(tr)
                    this.outerView.focus()
                }, 100);

            } else if (e.code === 'ArrowDown') {
                this.input.blur();
                let targetPos = getPos() + this.node.nodeSize
                let selection = Selection.near(this.outerView.state.doc.resolve(targetPos), 1)
                let tr = this.outerView.state.tr.setSelection(selection).scrollIntoView()
                setTimeout(() => {
                    this.outerView.dispatch(tr)
                    this.outerView.focus()
                });
            }

            e.stopImmediatePropagation();
            e.stopPropagation();
        });

        const src = this.node.attrs.src;
        const url = this.validateYouTubeUrl(src);
        console.log("youtube url", url, src)
        if (url) {
            this.display.innerHTML = '<iframe width="560" height="315" src="'+url+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
        }
        else{
            this.input.classList.add("limpid-equation-input-edit-mode");
            this.display.style.display = 'none';
        }
    }

    validateYouTubeUrl(url) {
        if (url != undefined || url != '') {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            var match = url.match(regExp);
            if (match && match[2].length == 11) {
                // Do anything for being valid
                // if need to change the url to embed url then use below line
                return 'https://www.youtube.com/embed/' + match[2] + '?autoplay=0';
            }
            else {
                return null;
                // Do anything for not being valid
            }
        }
    }

    update(node) {
        if (node.type !== this.node.type) return false
        this.node = node;

        const src = this.node.attrs.src;
        const url = this.validateYouTubeUrl(src);

        if (url) {
            while (this.display.firstChild) {
                this.display.removeChild(this.display.firstChild);
            }

            this.display.innerHTML = '<iframe width="560" height="315" src="'+url+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
        }

        return true;
    }

    stopEvent() {
        return true;
    }

    selectNode() {
        this.input.classList.add("limpid-equation-input-edit-mode");
        this.display.style.display = 'none';
        this.icon.style.display = 'inline-block';

        if (!this.node.attrs.src) {
            this.input.value = "https://www.youtube.com/watch?v=wJ7yyP4rzP0";
        } else {
            this.input.value = this.node.attrs.src;
        }
        this.input.focus();
    }

    deselectNode() {

        let url = this.input.value;

        url = this.validateYouTubeUrl(url);

        if (url) {
            this.input.classList.remove("limpid-equation-input-edit-mode");
            this.icon.style.display = 'none';

            this.display.style.display = 'block';
            this.input.blur();
            if (this.input.value === this.node.attrs.src) {
                while (this.display.firstChild) {
                    this.display.removeChild(this.display.firstChild);
                }
                this.display.innerHTML = '<iframe width="560" height="315" src="'+url+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
            } else {
                setTimeout(() => {
                    let tr = this.outerView.state.tr.setNodeAttribute(this.getPos(), 'src', url);
                    this.outerView.dispatch(tr);
                }, 100);
            }
        }
    }

    destroy() {
    }
}
