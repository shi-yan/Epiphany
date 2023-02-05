import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import './style.css'
import { baseKeymap } from "prosemirror-commands"


const textSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    title: {
      content: "inline*",
      toDOM() { return ["h1", 0] },
      parseDOM: [{ tag: "h1" }]
    },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM() { return ["p", 0] },
      parseDOM: [{ tag: "p" }]
    },
    image: {
      attrs: {
        file: { default: '' },
        description: { default: '' },
        source: { default: '' }
      },
      toDOM() {
        return ["img", {
          "file": node.attrs.file,
          src: "/img/" + node.attrs.file + ".png",
          description: node.attrs.description,
          source: node.attrs.source
        }]
      },
      parseDOM: [{ tag: "img" }]
    },
    gallery: {
      group: "block",
      content: "image*",
      draggable: true,
      toDOM() { return ["gallery", 0] },
      parseDOM: [{ tag: "gallery" }]
    },
    tag: {
      content: "inline*",
      marks: "",
      toDOM(node) {
        return ["tag", 0]
      },

      parseDOM: [{ tag: "tag" }]
    },
    tags: {
      content: "tag*",
      marks: "",
      toDOM(node) {
        return ["tags", 0]
      },
      parseDOM: [{ tag: "tags" }]
    },
    doc: {
      content: "title tags block+"
    }
  }
})

class TagsView {
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



window.editorView = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('test'),
    plugins: [

      keymap(baseKeymap)
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos) }
  }
})
