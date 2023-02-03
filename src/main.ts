import typescriptLogo from './typescript.svg'
import { setupCounter } from './counter'
import {keymap} from "prosemirror-keymap"

import {EditorState} from "prosemirror-state"
import {EditorView} from "prosemirror-view"
import {Schema, DOMParser} from "prosemirror-model"
import {schema} from "prosemirror-schema-basic"
import {addListNodes} from "prosemirror-schema-list"
import {exampleSetup} from "prosemirror-example-setup"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import './style.css'
import {baseKeymap} from "prosemirror-commands"


const textSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    title: {
      content: "inline*",
      toDOM() { return ["h1", 0] },
      parseDOM: [{tag: "h1"}]
    },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM() { return ["p", 0] },
      parseDOM: [{tag: "p"}]
    },
    image: {
      parseDOM: [{tag: "img"}]
    },
    gallery: {
      group: "block",
      content: "image+",
      marks: "",
      toDOM(node) { 
        console.log(node);
        return ["p", {class: "boring"}, 0] },
      parseDOM: [{tag: "gallery"}]
    },
    doc: {
      content: "title block+"
    }
  }
})

window.view = new EditorView(document.querySelector<Element>("#editor")!, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('test'),
    plugins: [

      keymap(baseKeymap)
    ]
  })
})
