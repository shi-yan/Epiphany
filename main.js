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
import textSchema from "./textschema"


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
