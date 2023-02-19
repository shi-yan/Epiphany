import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState, Plugin, Selection } from "prosemirror-state"
import { EditorView, Decoration, DecorationSet } from "prosemirror-view"
import { Schema, DOMParser } from "prosemirror-model"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap, setBlockType } from "prosemirror-commands"
import TagsView from "./tags"
import GalleryView from "./gallery"
import EquationView from "./equation"
import { gapCursor } from "prosemirror-gapcursor"
import textSchema from "./textschema"
import EquationManager from "./equation_manager"
import InlineEquationView from "./inline_equation"
import EquationRefView from "./equation_ref"
import VideoView from "./video"
import TwitterView from "./twitter"
import { undo, redo, history } from "prosemirror-history"
import { buildKeymap } from "./keymap"
import { dropCursor } from "prosemirror-dropcursor"
import CodeBlockView from "./code"
import limpidPlugin from "./limpid_plugin"
import trailingSpacePlugin from "./trailing_space_plugin"

let equationManager = new EquationManager();

function arrowHandler(dir) {
  return (state, dispatch, view) => {
    if (state.selection.empty && view.endOfTextblock(dir)) {
      let side = dir == "left" || dir == "up" ? -1 : 1
      let $head = state.selection.$head
      let nextPos = Selection.near(
        state.doc.resolve(side > 0 ? $head.after() : $head.before()), side)
      if (nextPos.$head && nextPos.$head.parent.type.name == "code_block") {
        dispatch(state.tr.setSelection(nextPos))
        return true
      }
    }
    return false
  }
}


function popup(content) {
  let exisiting = document.getElementById('limpid-popup-backdrop');

  if (exisiting) {
    exisiting.parentNode.removeChild(exisiting);
  }

  let backdrop = document.createElement('div');
  backdrop.id = 'limpid-popup-backdrop';
  document.body.appendChild(backdrop);

  let dialog = document.createElement('div');
  dialog.className = 'limpid-popup-dialog';
  backdrop.appendChild(dialog);

  let closeButton = document.createElement('button');
  closeButton.innerText = "Close";
  dialog.appendChild(closeButton);

  closeButton.onclick = (e) => {
    backdrop.parentNode.removeChild(backdrop);
  }

  dialog.appendChild(content);
}

let editorElm = document.querySelector("#editor");
let updateContentTimer = null;
function updateContent() {
  updateContentTimer = null;
  console.log("inside update content", window.editorView.state.doc);

  for (let i = 0; i < window.editorView.state.doc.content.content.length; ++i) {
    let node = window.editorView.state.doc.content.content[i];
    if (node.type.name === 'heading') {
      console.log(node.textContent)
    }
  }
}

const arrowHandlers = keymap({
  ArrowLeft: arrowHandler("left"),
  ArrowRight: arrowHandler("right"),
  ArrowUp: arrowHandler("up"),
  ArrowDown: arrowHandler("down")
})


window.editorView = new EditorView(editorElm, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('<h1>test</h1><tags></tags>'),
    plugins: [
      keymap(buildKeymap(textSchema)),
      keymap(baseKeymap),
      arrowHandlers,
      gapCursor(),
      dropCursor(),
      limpidPlugin(),
      trailingSpacePlugin(),
      history()
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos); },
    gallery(node, view, getPos) { return new GalleryView(node, view, getPos); },
    equation(node, view, getPos) { return new EquationView(node, view, getPos, equationManager); },
    inline_equation(node, view, getPos) { return new InlineEquationView(node, view, getPos); },
    equation_ref(node, view, getPos) {
      return new EquationRefView(node, view, getPos, equationManager);
    },
    video(node, view, getPos) {
      return new VideoView(node, view, getPos);
    },
    twitter(node, view, getPos) {
      return new TwitterView(node, view, getPos);
    },
    code_block(node, view, getPos) { return new CodeBlockView(node, view, getPos); }
  },
  dispatchTransaction: (tr) => {
    const state = window.editorView.state.apply(tr);
    window.editorView.updateState(state);

    function rebuildContentTable() {
      if (updateContentTimer) {
        clearTimeout(updateContentTimer);
        updateContentTimer = null;
      }
      updateContentTimer = setTimeout(() => {
        updateContent();
      }, 3000);
    }

    for (let i = 0; i < tr.steps.length; ++i) {
      console.log(tr.steps[i].slice)
      if (tr.steps[i].slice.content.size == 0) {
        rebuildContentTable();
        return;
      }

      for (let e = 0; e < tr.steps[i].slice.content.content.length; ++e) {
        let node = tr.steps[i].slice.content.content[e];

        if (node.type.name === 'heading') {
          rebuildContentTable();
          return;
        }
      }
    }

  }
})

editorElm.onclick = (e) => {
  if (e.target !== editorElm) {
    return;
  }
  e.preventDefault();


  let lastNode = window.editorView.state.doc.lastChild;
  let rpos = window.editorView.state.doc.resolve(window.editorView.state.doc.nodeSize - 2);
  let selection = Selection.near(rpos, 1)
  console.log("last sel", lastNode, rpos, selection)
  let tr = window.editorView.state.tr.setSelection(selection).scrollIntoView()
  setTimeout(() => {
    window.editorView.dispatch(tr)
    window.editorView.focus()
  }, 100);

  e.stopImmediatePropagation();
  e.stopPropagation();
}

/*const { invoke } = window.__TAURI__.tauri;

let greetInputEl;
let greetMsgEl;

async function greet() {
  // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  greetMsgEl.textContent = await invoke("greet", { name: greetInputEl.value });
}*/