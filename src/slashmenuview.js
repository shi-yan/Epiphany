import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"


export default class SlashMenuView {
    constructor(pluginkey, menuItems) {
        // We'll need these later
        // this.getPos = getPos
        this.displayId = 0;
        this.key = new Date().getTime();
        this.pluginkey = pluginkey;
        this.menuItems = menuItems;
        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        // this.dom.style.backgroundColor = 'red';
        this.dom.style.width = '360px';
        this.dom.style.height = '280px';
        this.dom.style.position = "absolute";
        this.dom.style.left = '0px';
        this.dom.style.top = '0px';
        this.dom.classList.add('slash-menu');
        this.dom.style.display = 'none'
        //'#498091';
        this.levelOneItems = document.createElement('div')
        this.levelOneItems.classList.add('slash-menu-container');
        this.levelTwoItems = document.createElement('div')
        this.levelTwoItems.classList.add('slash-menu-container');
        this.levelTwoItems.display = 'none';
        this.dom.appendChild(this.levelOneItems);
        this.dom.appendChild(this.levelTwoItems);

        document.body.appendChild(this.dom);
    }

    renderFirstLevelItems() {
        while (this.levelOneItems.firstChild) {
            this.levelOneItems.removeChild(this.levelOneItems.firstChild);
        }

        for (let i = 0; i < this.menuItems.length; ++i) {
            let section = document.createElement('div');
            section.classList.add('slash-menu-section');
            let sectionTitle = document.createElement('div');
            sectionTitle.classList.add('slash-menu-section-title');
            let sectionTitleSpan = document.createElement('span');
            sectionTitleSpan.textContent = this.menuItems[i].section;
            sectionTitle.appendChild(sectionTitleSpan);
            section.appendChild(sectionTitle);

            for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                section.appendChild(this.menuItems[i].items[e].elem);
            }
            this.levelOneItems.appendChild(section);
        }
    }

    update(view, state) {
        const newState = view.state[this.pluginkey];
        const prevState = state[this.pluginkey];

        if (newState.active && !prevState.active) {
            this.dom.style.display = 'flex';

            //get position
            const elements = document.getElementsByClassName('suggestion-decorator')

            const anchorSpan = Array.prototype.filter.call(
                elements,
                (elm) => elm.getAttribute('data-decoration-id') === newState.decorationId
            );

            if (anchorSpan) {//.getBoundingClientRect()
                //avoid menu being rendered outside editor
                const anchorRect = anchorSpan[0].getBoundingClientRect();
                const editorRect = view.dom.parentNode.parentNode.getBoundingClientRect();
                const menuRect = this.dom.getBoundingClientRect();

                const distanceToBottom = editorRect.top + editorRect.height - anchorRect.top - anchorRect.height;
                const distanceToTop = anchorRect.top - editorRect.top;
                const rightToBorder = editorRect.left + editorRect.width - anchorRect.left - menuRect.width;

                this.dom.style.left = (anchorRect.left + (rightToBorder < 0 ? rightToBorder : 0)) + 'px';
                if (distanceToBottom > distanceToTop) {
                    this.dom.style.top = (anchorRect.top + anchorRect.height) + 'px';
                }
                else {
                    this.dom.style.top = (anchorRect.top - menuRect.height) + 'px';
                }
                //this.div.innerText = newState.keyboardHoveredItemIndex;
                this.renderFirstLevelItems();
            }
        }
        else if (newState.active) {
            //this.div.innerText = newState.keyboardHoveredItemIndex;

            if (newState.keyboardHoveredItemIndex > 3) {
                console.log("open submenu!");
                this.levelOneItems.style.display = 'none';
                this.levelTwoItems.style.display = 'flex';


                let container = document.createElement('div');
                container.className = 'limpid-equation-ref-selector-item';

                let section = document.createElement('div');
                section.classList.add('slash-menu-section');
                let sectionTitle = document.createElement('div');
                sectionTitle.classList.add('slash-menu-section-title');
                let sectionTitleSpan = document.createElement('span');
                sectionTitleSpan.textContent = "Hit 'Backspace' to go back";
                sectionTitle.appendChild(sectionTitleSpan);
                section.appendChild(sectionTitle);
    
                this.levelTwoItems.appendChild(section);

                let iconElem = document.createElement('div');
                iconElem.innerText = '1';
                iconElem.classList.add('slash-menu-item-icon');

                container.appendChild(iconElem);

                let element = document.createElement('div');
                element.style.textAlign="center";
                element.style.flexGrow=1;
                katex.render("\\int_{a}^{b} x^2 \\,dx", element, {
                    throwOnError: false
                });
                container.appendChild(element);

                section.appendChild(container);
            }
        }
        else if (!newState.active && prevState.active) {
            this.dom.style.display = 'none';
        }
        return true;
    }

    destroy() {

    }
}
