import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"


export default class SlashMenuView {
    constructor( view) {
        // We'll need these later
       // this.getPos = getPos
        this.displayId = 0;
        this.key = new Date().getTime();

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.style.backgroundColor = 'red';
        this.dom.style.width = '320px';
        this.dom.style.height = '240px';
        this.dom.style.position = "absolute";

        document.body.appendChild(this.dom);
    }

    update(view, state) {
  
        console.log('called slash menu update')
        return true;
    }

    destroy() {

    }
}
