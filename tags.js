import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection } from "prosemirror-state"


export default class TagsView {
  constructor(node, view, getPos) {
    // We'll need these later
    this.node = node
    this.outerView = view
    this.getPos = getPos

    // The node's representation in the editor (empty, for now)
    this.dom = document.createElement("div");
    this.input = document.createElement("input");
    this.dom.appendChild(this.input);
    this.dom.onclick = (e) => {
      e.preventDefault();
      this.input.focus();
    }

    this.input.addEventListener('keyup', function (e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      e.stopPropagation();
    })
    let inputElm = this.input;
    let self = this;

    this.input.addEventListener('keydown', (e) => {

      var str = 'fake';

      console.log("keydown", e.code)

      if (!!(~['Enter', 'Tab', 'Comma'].indexOf(e.code))) {
        console.log("should update", e.code)
        let nn = textSchema.nodes.tag.createAndFill(null, textSchema.text("fake"));
        //let tr = new Transform(node);

        let tr = self.outerView.state.tr.replaceWith(getPos() + 1, getPos() + 1 + self.node.nodeSize - 2, [nn]);
        /*console.log(tr);
        let offsetMap = StepMap.offset(getPos() + 1);
        let outerTr = view.state.tr;
        let steps = tr.steps
        for (let j = 0; j < steps.length; j++) {
          outerTr.step(steps[j].map(offsetMap))
        }
        if (outerTr.docChanged)*/
        self.outerView.dispatch(tr);

        console.log('trigger', getPos(), self.node)
        //  input.value = "";
        // if(str != "")
        //   tags.addTag(str);
      }
      else if (e.code === 'ArrowUp') {
        inputElm.blur();
        let targetPos = getPos()
        let selection = Selection.near(self.outerView.state.doc.resolve(targetPos), -1)
        let tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
        setTimeout(() => {
          self.outerView.dispatch(tr)
          self.outerView.focus()
        }, 100);
      }
      else if (e.code === 'ArrowDown') {

        inputElm.blur();
        let targetPos = getPos() + self.node.nodeSize
        let selection = Selection.near(self.outerView.state.doc.resolve(targetPos), 1)
        let tr = self.outerView.state.tr.setSelection(selection).scrollIntoView()
        setTimeout(() => {
          self.outerView.dispatch(tr)
          self.outerView.focus()
        }, 100);
      }

      e.stopImmediatePropagation();
      e.stopPropagation();
    });
  }

  update(node) {
    this.node = node
    console.log('node update', node)

    node.forEach(
      (node, offset, index) => {
        console.log(node.textContent)

        let tags = this.dom.getElementsByTagName("span");


        for (let i = 0; i < tags.length; ++i) {
          this.dom.removeChild(tags[i]);
        }


        let tag = document.createElement("span");
        tag.innerText = node.textContent;
        this.dom.insertBefore(tag, this.dom.firstChild);
      }
    )
    return true;
  }

  selectNode() {
    console.log('node selected')
    this.dom.classList.add("ProseMirror-selectednode")
    this.input.focus();
  }

  deselectNode() {
    this.dom.classList.remove("ProseMirror-selectednode")
    this.input.blur();
  }

  stopEvent() {
    return true;
  }
}
