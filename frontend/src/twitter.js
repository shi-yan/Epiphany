import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

import { tauri_invoke } from "./tauri_mock";

export default class TwitterView {
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
        this.input.classList.add("limpid-equation-input-edit-mode");

        this.icon = document.createElement('span');

        const color = '#d5ded4'
        this.icon.innerHTML = '<svg style="min-width:32px; min-height:32px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>twitter</title><path  stroke="' + color + '" fill="' + color + '"  d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" /></svg>'
        this.icon.style.position = 'absolute';
        this.icon.style.top = '2px';
        this.icon.style.left = '8px';

        this.dom.appendChild(this.input);
        this.dom.appendChild(this.icon);

        this.display = document.createElement('div');
        this.display.style.display = 'none';
        this.display.style.justifyContent = 'center';
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
    }

    validateTwitterUrl(url) {
        if (url != undefined || url != '') {
            var regExp = /^http(?:s)?:\/\/(?:www)?twitter\.com\/([a-zA-Z0-9_]+)\/status\/(\d+)/;
            var match = url.match(regExp);
            if (match) {
                // Do anything for being valid
                // if need to change the url to embed url then use below line
                return url;
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
        if (src) {
            while (this.display.firstChild) {
                this.display.removeChild(this.display.firstChild);
            }

            (async () => {
                const response = await tauri_invoke('fetch_tweet', src);
                console.log(response);
                this.display.innerHTML = response.html;
                twttr.widgets.load(this.display);
            })();

            // this.display.innerHTML = '<iframe width="560" height="315" src="'+src+'" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>'
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
            this.input.value = "https://twitter.com/71sGQ6rMXeDlyiU/status/1633958373447323648";
        } else {
            this.input.value = this.node.attrs.src;
        }
        this.input.focus();
    }

    deselectNode() {
        let url = this.input.value;
        url = this.validateTwitterUrl(url);

        if (url) {
            this.input.classList.remove("limpid-equation-input-edit-mode");
            this.icon.style.display = 'none';
            this.display.style.display = 'flex';
            this.input.blur();
            if (this.input.value === this.node.attrs.src) {
                while (this.display.firstChild) {
                    this.display.removeChild(this.display.firstChild);
                }
                (async () => {
                    const response = await tauri_invoke('fetch_tweet', url);
                    this.display.innerHTML = response.html;
                    twttr.widgets.load(this.display);
                })();
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
