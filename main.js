import { keymap } from "prosemirror-keymap"
import { Transform, StepMap } from "prosemirror-transform"
import { EditorState, Plugin, Selection } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
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
import {dropCursor} from "prosemirror-dropcursor"

let equationManager = new EquationManager();


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



function trailingSpacePlugin() {
  const plugin = new Plugin({
    key: 'trailing',
    appendTransaction: (_, __, state) => {
      console.log("append transaction called")
      const { doc, tr, schema } = state;
      const shouldInsertNodeAtEnd = plugin.getState(state);
      const endPosition = doc.content.size;
      if (!shouldInsertNodeAtEnd) {
        return;

      }
      return tr.insert(
        endPosition,
        textSchema.nodes.paragraph.create()
      );
    },
    state: {
      init: (_, _state) => {
        return false;
      },
      apply: (tr, value) => {
        if (!tr.docChanged) {
          return value;
        }
        let lastNode = tr.doc.lastChild;
        if (!lastNode) {
          throw new Error("Expected node");
        }
        if (lastNode.type.name === "paragraph") {
          return false;
        }
        return true;
      },
    },
  });

  return plugin;
}

function menuPlugin() {
  return new Plugin({
    props: {
      transformPasted(slice, view) {
        console.log('handle paste', slice)
        return slice
      }
    },
    filterTransaction(tr, state) {
      console.log(tr)
      return true;
    },
    view(editorView) {
      let menuView = document.createElement('div');
      menuView.style.zIndex = 100;
      menuView.style.position = 'fixed';
      menuView.style.left = 'calc(50% - 480px)';
      menuView.style.top = 'calc(50% - 80px)';
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

        equationManager.assembleSelector(container, (equationKey) => {
          console.log("insert equation ref", equationKey)

          let exisiting = document.getElementById('limpid-popup-backdrop');
          if (exisiting) {
            exisiting.parentNode.removeChild(exisiting);
          }

          e.preventDefault();
          window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.equation_ref.create({
            id:
              equationKey
          })));
        });

        popup(container);
      }

      menuView.appendChild(showSelector);


      let h2Button = document.createElement('button');

      h2Button.id = 'h2button';
      h2Button.innerText = "H2";
      let h2Command = setBlockType(textSchema.nodes.heading, { level: 2 });
      h2Button.onclick = (e) => {
        e.preventDefault();
        h2Command(window.editorView.state, window.editorView.dispatch, window.editorView);
      }

      menuView.appendChild(h2Button);

      let videoButton = document.createElement('button');

      videoButton.id = 'videobutton';
      videoButton.innerText = "Vi";

      videoButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.video.create({
          src:
            'ttt'
        })));
      }

      menuView.appendChild(videoButton);

      let twitterButton = document.createElement('button');

      twitterButton.id = 'twitterbutton';
      twitterButton.innerText = "Tw";

      twitterButton.onclick = (e) => {
        e.preventDefault();
        window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.twitter.create({
          src:
            'ttt'
        })));
      }

      menuView.appendChild(twitterButton);

      editorView.dom.parentNode.insertBefore(menuView, editorView.dom);
      return menuView;
    }
  })
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

window.editorView = new EditorView(editorElm, {
  state: EditorState.create({
    doc: DOMParser.fromSchema(textSchema).parse('<h1>test</h1><tags></tags>'),
    plugins: [
      keymap(buildKeymap(textSchema)),
      keymap(baseKeymap),
      gapCursor(),
      dropCursor(),
      menuPlugin(),
      trailingSpacePlugin(),
      history()
    ]
  }),
  nodeViews: {
    tags(node, view, getPos) { return new TagsView(node, view, getPos) },
    gallery(node, view, getPos) { return new GalleryView(node, view, getPos) },
    equation(node, view, getPos) { return new EquationView(node, view, getPos, equationManager) },
    inline_equation(node, view, getPos) { return new InlineEquationView(node, view, getPos) },
    equation_ref(node, view, getPos) {
      return new EquationRefView(node, view, getPos, equationManager)
    },
    video(node, view, getPos) {
      return new VideoView(node, view, getPos)
    },
    twitter(node, view, getPos) {
      return new TwitterView(node, view, getPos)
    },
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