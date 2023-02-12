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
import InlineEquationView from "./inline_equation"

let equationManager = new EquationManager();


function popup(content) {
  let exisiting = document.getElementById('limpid-popup-backdrop');

  if (exisiting) {
    exisiting.parentNode.removeChild(exisiting);
  }

  let backdrop = document.createElement('div');
  backdrop.id = 'limpid-popup-backdrop';
  document.body.appendChild(backdrop);
}


function menuPlugin() {
  return new Plugin({
    filterTransaction(tr, state) {
      console.log(tr)
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
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.gallery.create()));
      }

      let equationButton = document.createElement('button');

      equationButton.id = 'equation';
      equationButton.innerText = "Eq"

      equationButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.equation.create()));
      }

      let inlineEquationButton = document.createElement('button');

      inlineEquationButton.id = 'equation';
      inlineEquationButton.innerText = "IEq"

      inlineEquationButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.inline_equation.create()));
      }

      menuView.appendChild(imageButton);
      menuView.appendChild(equationButton);
      menuView.appendChild(inlineEquationButton);

      let showSelector = document.createElement('button');

      showSelector.id = 'show';
      showSelector.innerText = "SE";

      showSelector.onclick = (e) => {
        e.preventDefault();

        let exisiting = document.getElementById('limpid-equation-ref-selector');

        if (exisiting) {
          exisiting.parentNode.removeChild(exisiting);
        }

        let container = document.createElement('div');
        container.classList.add('limpid-equation-ref-selector');

        equationManager.assembleSelector(container);

        popup(container);
      }

      menuView.appendChild(showSelector);


      editorView.dom.parentNode.insertBefore(menuView, editorView.dom);
      return menuView;
    }
  })
}


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
    gallery(node, view, getPos) { return new GalleryView(node, view, getPos) },
    equation(node, view, getPos) { return new EquationView(node, view, getPos, equationManager) },
    inline_equation(node, view, getPos) { return new InlineEquationView(node, view, getPos) }
  }
})
