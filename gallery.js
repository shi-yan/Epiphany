export default class Gallery {
    constructor(node, view, getPos) {
        this.node = node;
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.style.backgroundColor = 'red'
        this.dom.style.minHeight = '50px';

        let inputElem = document.createElement("input");
        inputElem.type = "file";
        inputElem.id = "actual-btn";
        inputElem.hidden = true;

        let labelElem = document.createElement("label");
        labelElem.for = "actual-btn"
        labelElem.innerText = "Choose File"

        this.dom.appendChild(inputElem)
        this.dom.appendChild(labelElem)
    }

    update(node) {
        return true;
    }

    selectNode() {}
    deselectNode() {}
}