import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"


export default class SlashMenuView {
    constructor(pluginkey, view) {
        // We'll need these later
       // this.getPos = getPos
        this.displayId = 0;
        this.key = new Date().getTime();
        this.pluginkey = pluginkey;
        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
       // this.dom.style.backgroundColor = 'red';
        this.dom.style.width = '320px';
        this.dom.style.height = '240px';
        this.dom.style.position = "absolute";
        this.dom.style.left='420px';
        this.dom.style.top='140px';
        this.dom.classList.add('slash-menu');
        this.dom.style.display = 'none'

        this.div = document.createElement('div')
        this.div.style.borderRadius = '4px';
        this.div.style.backgroundColor = '#498091';
        this.div.style.width = '100%';
        this.div.style.height='60px';
        this.dom.appendChild(this.div);

        document.body.appendChild(this.dom);
    }

    update(view, prevState) {
        const newState = view.state[this.pluginkey];
        if (newState.active && !prevState.active) {
            this.dom.style.display = 'inline-flex';

            //get position
            const elements =  document.getElementsByClassName('suggestion-decorator')

            const testDivs = Array.prototype.filter.call(
                elements,
                (elm) => elm.getAttribute('data-decoration-id') === newState.decorationId
              );

            if (testDivs) {//.getBoundingClientRect()
                //avoid menu being rendered outside editor
                const anchorRect = testDivs[0].getBoundingClientRect();
                const editorRect = view.dom.parentNode.parentNode.getBoundingClientRect();
                const menuRect =  this.dom.getBoundingClientRect();
                
                const distanceToBottom = editorRect.top + editorRect.height - anchorRect.top - anchorRect.height;
                const distanceToTop = anchorRect.top - editorRect.top;
                const rightToBorder = editorRect.left + editorRect.width - anchorRect.left - menuRect.width;

                this.dom.style.left= (anchorRect.left + (rightToBorder<0?rightToBorder:0))+ 'px';
                if (distanceToBottom > distanceToTop) {
                    this.dom.style.top= (anchorRect.top + anchorRect.height) +'px';
                }
                else {
                    this.dom.style.top= (anchorRect.top - menuRect.height) +'px';
                }
                this.div.innerText = newState.keyboardHoveredItemIndex;
            }

            else if (newState.active) {
                this.div.innerText = newState.keyboardHoveredItemIndex;

            }
            else if (!newState.active && prevState.active){
                this.dom.style.display = 'none';

            }
        }
        return true;
    }

    destroy() {

    }
}
