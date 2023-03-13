import { EditorState, Plugin, Selection, PluginKey } from "prosemirror-state"
import { EditorView, Decoration, DecorationSet } from "prosemirror-view"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap, setBlockType } from "prosemirror-commands"

import textSchema from "./textschema"

export default function trailingSpacePlugin() {
    const plugin = new Plugin({
      key: new PluginKey( 'trailing'),
      appendTransaction: (_, __, state) => {
        const { doc, tr, schema } = state;
        const shouldInsertNodeAtEnd = plugin.getState(state);
        const endPosition = doc.content.size;
        if (!shouldInsertNodeAtEnd) {
       //   console.log("append transaction called = no trailing")
          return null;
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