import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"

export default class TwitterView {
    constructor(node, view, getPos) {
        // We'll need these later
        this.node = node
        this.outerView = view
        this.getPos = getPos

        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        this.dom.style.textAlign = 'center';
        this.dom.innerHTML = '<blockquote class="twitter-tweet"><p lang="ja" dir="ltr">カリカリイヤイヤ期かしら <a href="https://t.co/kPrAG2dpMj">pic.twitter.com/kPrAG2dpMj</a></p>&mdash; こむぎ＠ポメ柴 (@Komugi8yoiko) <a href="https://twitter.com/Komugi8yoiko/status/1632227961771548673?ref_src=twsrc%5Etfw">March 5, 2023</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>'
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
