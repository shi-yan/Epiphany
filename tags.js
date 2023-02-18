import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection } from "prosemirror-state"
import { inputRules } from "prosemirror-inputrules";


export default class TagsView {
  constructor(node, view, getPos) {
    // We'll need these later
    this.node = node
    this.outerView = view
    this.getPos = getPos

    // The node's representation in the editor (empty, for now)
    this.dom = document.createElement("div");
    this.dom.classList.add('limpid-tag-area');
    this.input = document.createElement("input");
    this.input.classList.add('limpid-tag-input');
    this.input.classList.add('limpid-no-outline');
    this.input.placeholder = "Hit Enter, Tab or Comma to add a tag. Click on a tag to remove..."
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

      if (!!(~['Enter', 'Tab', 'Comma'].indexOf(e.code))) {
        let nn = textSchema.nodes.tag.createAndFill(null, textSchema.text(inputElm.value));
        inputElm.value = '';
        e.preventDefault();

        let tr = self.outerView.state.tr.replaceWith(getPos() + 1, getPos() + 1 + self.node.nodeSize - 2, [nn]);
        
        self.outerView.dispatch(tr);
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
    if (node.type != this.node.type) return false
    this.node = node
    node.forEach(
      (node, offset, index) => {
        console.log(node.textContent)
        let tags = this.dom.getElementsByTagName("span");
        for (let i = 0; i < tags.length; ++i) {
          this.dom.removeChild(tags[i]);
        }

        let tag = document.createElement("span");
        tag.classList.add('limpid-tag-item');
        tag.innerText = '#'+node.textContent ;
        this.dom.insertBefore(tag, this.dom.firstChild);
      }
    )
    return true;
  }

  selectNode() {
    console.log('node selected')
    //this.dom.classList.add("ProseMirror-selectednode")
    this.input.focus();
  }

  deselectNode() {
    //this.dom.classList.remove("ProseMirror-selectednode")
    this.input.blur();
  }

  stopEvent() {
    return true;
  }
}
