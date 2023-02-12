import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState, Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap } from "prosemirror-commands"
import TagsView from "./tags"
import GalleryView from "./gallery"
import EquationView from "./equation"
import { gapCursor } from "prosemirror-gapcursor"
import textSchema from "./textschema"
import EquationManager from "./equation_manager"

function menuPlugin(items) {
  return new Plugin({
    filterTransaction(tr, state) {
      console.log("filter", tr)
     // window.confirm("sometext");

      return true;
    },
    view(editorView) {
      let menuView = document.createElement('div');
      menuView.style.zIndex = 100;
      menuView.style.position = 'fixed';
      menuView.style.left = 'calc(50% - 480px)';
      menuView.style.display = 'flex';
      menuView.style.flexDirection = 'column';

      let imageButton = document.createElement('button');

      imageButton.id = 'image';
      imageButton.innerText = "Im"


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



      let equationButton = document.createElement('button');

      equationButton.id = 'equation';
      equationButton.innerText = "Eq"

      equationButton.onclick = (e) => {
        e.preventDefault();
        let type = textSchema.nodes.equation;
      
        let nn = textSchema.nodes.equation.createAndFill(null, null);
       // let tr = new Transform(node);
        let {$from} = window.editorView.state.selection;
        let index = $from.index();
        console.log("index",index);
      
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.equation.create()))
      
      
      }

      menuView.appendChild(imageButton);
      menuView.appendChild(equationButton);
      editorView.dom.parentNode.insertBefore(menuView, editorView.dom);
      return menuView;
    }
  })
}


let imageButton = document.getElementById('gallery');
let equationButton = document.getElementById('equation');
let equationManager = new EquationManager();

window.editorView = new EditorView(document.querySelector("#editor"), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('<h1>test</h1><tags></tags>'),
    plugins: [

      keymap(baseKeymap),
      gapCursor(),
      menuPlugin()
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos) },
    gallery(node, view, getPos) {return new GalleryView(node, view, getPos) },
    equation(node, view, getPos) {return new EquationView(node, view, getPos, equationManager) },
  }
})
/*



*/