export default class Gallery {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.style.backgroundColor = 'red'
        this.dom.style.minHeight = '50px';
    }

    update(node) {
        return true;
    }

    selectNode() {}
    deselectNode() {}
}