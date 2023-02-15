import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

export default class TwitterView {
    constructor(node, view, getPos) {

        console.log("====================== create video");
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.style.textAlign = 'center';
        this.dom.innerHTML = '<blockquote class="twitter-tweet tw-align-center"><p lang="zh" dir="ltr">白“云”苍狗几千回，<br>惟有“吆喝”长不改。<br>😆🫶🏻 <a href="https://t.co/MTJ3bFYs9F">pic.twitter.com/MTJ3bFYs9F</a></p>&mdash; Leila (@leilahushe) <a href="https://twitter.com/leilahushe/status/1625704186775060482?ref_src=twsrc%5Etfw">February 15, 2023</a></blockquote>'
        twttr.widgets.load(
            this.dom
        );
    }

    update(node) {
        if (node.type !== this.node.type) return false
        this.node = node;

        return true;
    }

    stopEvent() {
        return true;
    }

    selectNode() {

    }

    deselectNode() { }

    destroy() {

    }
}
