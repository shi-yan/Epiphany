import { EditorState, Plugin, Selection } from "prosemirror-state"
import { EditorView, Decoration, DecorationSet } from "prosemirror-view"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap, setBlockType } from "prosemirror-commands"

import textSchema from "./textschema"

export default function limpidPlugin() {
    return new Plugin({
      props: {
        transformPasted(slice, view) {
          console.log('handle paste', slice)
          return slice
        },
        decorations(state) {
          const { doc, selection } = state;

          const { anchor } = selection;

          let decorations = [];

          for(let i =0;i<doc.childCount;++i)
          {
            let rpos=doc.resolve(i);
            const pos =  rpos.posAtIndex(i,0);
            if (i == 0 && doc.firstChild.type.name === 'title' && doc.firstChild.textContent.length == 0) {
              const decoration = Decoration.node(pos, pos + doc.firstChild.nodeSize, {
                class: 'h1-placeholder',
              });
              decorations.push(decoration);
            }
            else {
              let node = doc.child(i);

              if (node.type.name === 'paragraph' && node.textContent.length == 0){
            
                const hasAnchor = anchor >= pos && anchor <= pos + node.nodeSize;
                if (hasAnchor) {
                  const decoration = Decoration.node(pos, pos +  node.nodeSize, {
                    class: 'p-placeholder',
                  });
                  decorations.push(decoration);
                }
              }
            }
          }

          if (decorations.length > 0) {
            return DecorationSet.create(doc, decorations);
          }
          return;
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
  
        let codeButton = document.createElement('button');
  
        codeButton.id = 'codeButton';
        codeButton.innerText = "Co";
  
        codeButton.onclick = (e) => {
          e.preventDefault();
          window.editorView.dispatch(window.editorView.state.tr.replaceSelectionWith(textSchema.nodes.code_block.create()));
        }
  
        menuView.appendChild(codeButton);
  
        editorView.dom.parentNode.insertBefore(menuView, editorView.dom);
        return menuView;
      }
    })
  }
  