import { EditorState, Plugin, Selection } from "prosemirror-state"
import { EditorView, Decoration, DecorationSet } from "prosemirror-view"
import 'prosemirror-view/style/prosemirror.css'
import 'prosemirror-menu/style/menu.css'
import 'prosemirror-gapcursor/style/gapcursor.css'
import './style.css'
import { baseKeymap, setBlockType } from "prosemirror-commands"

import textSchema from "./textschema"
import SlashMenuView from "./slashmenuview"
import createMenu from "./slashmenu_factory"

export default function menuPlugin(equationManager) {

    const pluginKey = { key: 'menuplugin' }
    const defaultTriggerCharacter = '\\'
    const defaults = {
        active: false,
        triggerCharacter: null,
        decorationId: 0,
        menuBrowseDirection: 0
    };

    // Plugin key is passed in as a parameter, so it can be exported and used in the DraggableBlocksPlugin.
    return new Plugin({
        key: pluginKey,

        view: (view) => {
            return new SlashMenuView(pluginKey.key, createMenu(equationManager));
        },
        state: {
            // Initialize the plugin's internal state.
            init() {
                return defaults;
            },

            // Apply changes to the plugin state from an editor transaction.
            apply(transaction, prev, oldState, newState) {
                //step 2
                // Checks if the menu should be shown.
                if (transaction.getMeta(pluginKey) && transaction.getMeta(pluginKey).activate) {
                    return {
                        active: true,
                        triggerCharacter:
                            transaction.getMeta(pluginKey).triggerCharacter || "",
                        queryStartPos: newState.selection.from,
                        /* items: items(""),*/
                        menuBrowseDirection: 0,
                        // TODO: Maybe should be 1 if the menu has no possible items? Probably redundant since a menu with no items
                        //  is useless in practice.
                        //  notFoundCount: 0,
                        decorationId: `id_${Math.floor(Math.random() * 0xffffffff)}`,
                    };
                }

                // Checks if the menu is hidden, in which case it doesn't need to be hidden or updated.
                if (!prev.active) {
                    return prev;
                }

                if (
                    // Highlighting text should hide the menu.
                    newState.selection.from !== newState.selection.to ||
                    // Transactions with plugin metadata {deactivate: true} should hide the menu.
                   ( transaction.getMeta(pluginKey)&& transaction.getMeta(pluginKey).deactivate) ||
                    // Certain mouse events should hide the menu.
                    // TODO: Change to global mousedown listener.
                  /*  transaction.getMeta("focus") ||
                    transaction.getMeta("blur") ||
                    transaction.getMeta("pointer") ||*/
                    // Moving the caret before the character which triggered the menu should hide it.
                    (prev.active && newState.selection.from < prev.queryStartPos)
                    /*||
                    // Entering more than 3 characters, after the last query that matched with at least 1 menu item, should hide
                    // the menu.
                    next.notFoundCount > 3*/
                ) {
                    return defaults;
                }
                prev.menuBrowseDirection = 0;
                if (transaction.getMeta(pluginKey) &&transaction.getMeta(pluginKey).menuBrowseDirection !== undefined) {
                    prev.menuBrowseDirection = transaction.getMeta(pluginKey).menuBrowseDirection;
                }

                return prev;
            },
        },

        props: {
            handleKeyDown(view, event) {
                const menuIsActive = this.getState(view.state).active;
                // step 1.
                // Shows the menu if the default trigger character was pressed and the menu isn't active.
                if (event.key === defaultTriggerCharacter && !menuIsActive) {
                    view.dispatch(
                        view.state.tr
                            .insertText(defaultTriggerCharacter)
                            .scrollIntoView()
                            .setMeta(pluginKey, {
                                activate: true,
                                triggerCharacter: defaultTriggerCharacter,
                            })
                    );

                    return true;
                }

                // Doesn't handle other keystrokes if the menu isn't active.
                if (!menuIsActive) {
                    return false;
                }

                // Handles keystrokes for navigating the menu.
                const {
                    triggerCharacter,
                    queryStartPos,
                    menuBrowseDirection
                } = this.getState(view.state);

                // Moves the keyboard selection to the previous item.
                if (event.key === "ArrowUp") {

                    view.dispatch(
                        view.state.tr.setMeta(pluginKey, {
                            menuBrowseDirection:  - 1,
                        })
                    );
                    return true;
                }

                // Moves the keyboard selection to the next item.
                if (event.key === "ArrowDown") {
                    view.dispatch(
                        view.state.tr.setMeta(pluginKey, {
                            menuBrowseDirection:  + 1,
                        })
                    );
                    return true;
                }
               
                if (event.key === "Enter") {
                    deactivate(view);
                    selectItemCallback({
                        item: items[menuBrowseDirection],
                        editor: editor,
                        range: {
                            from: queryStartPos - triggerCharacter.length,
                            to: view.state.selection.from,
                        },
                    });
                    return true;
                }
                // Closes the menu.
                if (event.key === "Escape") {
                    view.dispatch(view.state.tr.setMeta(pluginKey, { deactivate: true }));
                    return true;
                }

                return false;
            },

            // Hides menu in cases where mouse click does not cause an editor state change.
            handleClick(view) {
                view.dispatch(view.state.tr.setMeta(pluginKey, { deactivate: true }));
                    return true;
            },

            // Setup decorator on the currently active suggestion.
            decorations(state) {
                console.log(this.getState(state))
                // step3
                const { active, decorationId, queryStartPos, triggerCharacter } = this.getState(state);

                if (!active) {
                    return null;
                }
                //setup
                // If the menu was opened programmatically by another extension, it may not use a trigger character. In this
                // case, the decoration is set on the whole block instead, as the decoration range would otherwise be empty.
                if (triggerCharacter === "") {
                    const blockNode = findBlock(state.selection);
                    if (blockNode) {
                        return DecorationSet.create(state.doc, [
                            Decoration.node(
                                blockNode.pos,
                                blockNode.pos + blockNode.node.nodeSize,
                                {
                                    nodeName: "span",
                                    class: "suggestion-decorator",
                                    "data-decoration-id": decorationId,
                                }
                            ),
                        ]);
                    }
                }
                // Creates an inline decoration around the trigger character.
                return DecorationSet.create(state.doc, [
                    Decoration.inline(
                        queryStartPos - triggerCharacter.length,
                        queryStartPos,
                        {
                            nodeName: "span",
                            class: "suggestion-decorator",
                            "data-decoration-id": decorationId,
                        }
                    ),
                ]);
            },
        },
    });

}