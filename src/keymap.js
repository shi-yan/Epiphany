import {wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
    joinUp, joinDown, lift, selectParentNode} from "prosemirror-commands"
import {wrapInList, splitListItem, liftListItem, sinkListItem} from "prosemirror-schema-list"
import {undo, redo} from "prosemirror-history"
import {undoInputRule} from "prosemirror-inputrules"
import {Schema} from "prosemirror-model"

const mac = typeof navigator != "undefined" ? /Mac|iP(hone|[oa]d)/.test(navigator.platform) : false



export function buildKeymap(schema, mapKeys) {
    let keys= {}, type
    function bind(key, cmd) {
      if (mapKeys) {
        let mapped = mapKeys[key]
        if (mapped === false) return
        if (mapped) key = mapped
      }
      keys[key] = cmd
    }
  
    bind("Mod-z", undo)
    bind("Shift-Mod-z", redo)
    bind("Backspace", undoInputRule)
    if (!mac) bind("Mod-y", redo)
  
    bind("Alt-ArrowUp", joinUp)
    bind("Alt-ArrowDown", joinDown)
    bind("Mod-BracketLeft", lift)
   // bind("Escape", selectParentNode)
  
    if (type = schema.marks.strong) {
      bind("Mod-b", toggleMark(type))
      bind("Mod-B", toggleMark(type))
    }
    if (type = schema.marks.em) {
      bind("Mod-i", toggleMark(type))
      bind("Mod-I", toggleMark(type))
    }
    if (type = schema.marks.code)
      bind("Mod-`", toggleMark(type))
  
    if (type = schema.nodes.bullet_list)
      bind("Shift-Ctrl-8", wrapInList(type))
    if (type = schema.nodes.ordered_list)
      bind("Shift-Ctrl-9", wrapInList(type))
    if (type = schema.nodes.blockquote)
      bind("Ctrl->", wrapIn(type))
    if (type = schema.nodes.hard_break) {
      let br = type, cmd = chainCommands(exitCode, (state, dispatch) => {
        if (dispatch) dispatch(state.tr.replaceSelectionWith(br.create()).scrollIntoView())
        return true
      })
      bind("Mod-Enter", cmd)
      bind("Shift-Enter", cmd)
      if (mac) bind("Ctrl-Enter", cmd)
    }
    if (type = schema.nodes.list_item) {
      bind("Enter", splitListItem(type))
      bind("Mod-[", liftListItem(type))
      bind("Mod-]", sinkListItem(type))
    }
    if (type = schema.nodes.paragraph)
      bind("Shift-Ctrl-0", setBlockType(type))
    if (type = schema.nodes.code_block)
      bind("Shift-Ctrl-\\", setBlockType(type))
    if (type = schema.nodes.heading)
      for (let i = 1; i <= 6; i++) bind("Shift-Ctrl-" + i, setBlockType(type, {level: i}))
    if (type = schema.nodes.horizontal_rule) {
      let hr = type
      bind("Mod-_", (state, dispatch) => {
        if (dispatch) dispatch(state.tr.replaceSelectionWith(hr.create()).scrollIntoView())
        return true
      })
    }
  
    return keys
  }
  