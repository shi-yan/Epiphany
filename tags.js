import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"


export default class TagsView {
    constructor(node, view, getPos) {
      // We'll need these later
      this.node = node
      this.outerView = view
      this.getPos = getPos
  
      console.log('debug node', node);
  
      // The node's representation in the editor (empty, for now)
      this.dom = document.createElement("div");
      this.input = document.createElement("input");
      this.dom.appendChild(this.input);
      this.dom.onclick = (e) => {
        e.preventDefault();
        this.input.focus();
      }
  
      this.input.addEventListener('keydown', function (e) {
        var str = 'fake';
  
        console.log("keydown", e.code)
  
        if (!!(~['Enter', 'Tab', 'Comma'].indexOf(e.code))) {
          e.preventDefault();
          let nn = textSchema.nodes.tag.createAndFill(null, textSchema.text("fake"));
          let tr = new Transform(node);
  
          tr.replaceWith(0, node.nodeSize - 2, [nn]);
          console.log(tr);
          let offsetMap = StepMap.offset(getPos() + 1);
          let outerTr = view.state.tr;
          let steps = tr.steps
          for (let j = 0; j < steps.length; j++) {
            outerTr.step(steps[j].map(offsetMap))
          }
          if (outerTr.docChanged) view.dispatch(outerTr);
  
          console.log('trigger', getPos(), node)
          //  input.value = "";
          // if(str != "")
          //   tags.addTag(str);
        }
  
      });
      // These are used when the footnote is selected
      this.innerView = null
    }
  
    update(node) {
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
    }
  }
  