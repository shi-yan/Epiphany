import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap } from "prosemirror-commands"
import TagsView from "./tags"
import Gallery from "./gallery"
import { gapCursor } from "prosemirror-gapcursor"

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
      content: "title tags block+",
      allowGapCursor: true
    }
  }
})

let imageButton = document.getElementById('gallery');


window.editorView = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('<h1>test</h1><tags></tags>'),
    plugins: [

      keymap(baseKeymap),
      gapCursor()
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos) },
    gallery(node, view, getPos) {return new Gallery(node, view, getPos) }
  }
})

imageButton.onclick = (e) => {
  e.preventDefault();
  let type = textSchema.nodes.gallery;

  let nn = textSchema.nodes.gallery.createAndFill(null, null);
 // let tr = new Transform(node);
  let {$from} = window.editorView.state.selection;
  let index = $from.index();
  console.log("index",index);

  window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.gallery.create()))


  //tr.replaceWith(0, node.nodeSize - 2, [nn]);
  //console.log(tr);
}
