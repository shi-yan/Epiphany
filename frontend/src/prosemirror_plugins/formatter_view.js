import {
    isNodeSelection,
    isTextSelection,
    posToDOMRect,
} from "@tiptap/core";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";
import textSchema from "./textschema";
import { sinkListItem, liftListItem } from "prosemirror-schema-list"


import {
    wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
    joinUp, joinDown, lift, selectParentNode
} from "prosemirror-commands"

class FormatterView {
    constructor(pluginkey, menuItems) {
        this.dom = document.createElement('div');
        // this.dom.style.width = '320px';
        this.dom.style.height = '42px';
        this.dom.className = 'formatter-menu';
        this.dom.style.position = "absolute";
        this.dom.style.flexDirection = "row";
        this.dom.style.left = '0px';
        this.dom.style.top = '0px';
        this.dom.style.display = 'none';
        this.dom.style.padding = '4px';
        const boldButton = document.createElement('button');
        boldButton.innerHTML = '<i class="icon icon-bold">&#x61;</i>';
        boldButton.className = 'formatter-button';

        const italicButton = document.createElement('button');
        italicButton.innerHTML = '<i class="icon icon-italic">&#x62;</i>';
        italicButton.className = 'formatter-button';

        const underscoreButton = document.createElement('button');
        underscoreButton.innerHTML = '<i class="icon icon-underline">&#x63;</i>';
        underscoreButton.className = 'formatter-button';

        const strikeThroughButton = document.createElement('button');
        strikeThroughButton.innerHTML = '<i class="icon icon-strike">&#x64;</i>';
        strikeThroughButton.className = 'formatter-button';

        const increaseIndentationButton = document.createElement('button');
        increaseIndentationButton.innerHTML = '<i class="icon icon-indent-right">&#x65;</i>';
        increaseIndentationButton.className = 'formatter-button';

        const decreaseIndentationButton = document.createElement('button');
        decreaseIndentationButton.innerHTML = '<i class="icon icon-indent-left">&#x66;</i>';
        decreaseIndentationButton.className = 'formatter-button';

        const codeButton = document.createElement('button');
        codeButton.innerHTML = '<i class="icon icon-code">&#x67;</i>';
        codeButton.className = 'formatter-button';

        const linkButton = document.createElement('button');
        linkButton.innerHTML = '<i class="icon icon-link">&#x68;</i>';
        linkButton.className = 'formatter-button';

        this.firstLevelContainer = document.createElement('div');
        this.firstLevelContainer.style.display = 'flex';
        this.firstLevelContainer.style.flexDirection = 'row';
        this.firstLevelContainer.appendChild(boldButton);
        this.firstLevelContainer.appendChild(italicButton);
        this.firstLevelContainer.appendChild(underscoreButton);
        this.firstLevelContainer.appendChild(strikeThroughButton);
        this.firstLevelContainer.appendChild(increaseIndentationButton);
        this.firstLevelContainer.appendChild(decreaseIndentationButton);
        this.firstLevelContainer.appendChild(codeButton);
        this.firstLevelContainer.appendChild(linkButton);
        this.dom.appendChild(this.firstLevelContainer);
        this.secondaryLevelContainer = document.createElement('div');
        this.secondaryLevelContainer.style.display = 'none';
        this.secondaryLevelContainer.style.flexDirection = 'row';
        this.dom.appendChild(this.secondaryLevelContainer);
        document.body.appendChild(this.dom);

        setTimeout(() => {
            window.editorView.dom.addEventListener("mousedown", this.viewMousedownHandler);
            window.editorView.dom.addEventListener("mouseup", this.viewMouseupHandler);
            window.editorView.dom.addEventListener("dragstart", this.dragstartHandler);
        }, 500);

        boldButton.onclick = (e) => {
            e.preventDefault();
            this.toggleBold();
        }

        italicButton.onclick = (e) => {
            e.preventDefault();
            this.toggleItalic();
        }

        codeButton.onclick = (e) => {
            e.preventDefault();
            this.toggleCode();
        }

        underscoreButton.onclick = (e) => {
            e.preventDefault();
            this.toggleUnderscore();
        }

        strikeThroughButton.onclick = (e) => {
            e.preventDefault();
            this.toggleStrikeThrough();
        }

        increaseIndentationButton.onclick = (e) => {
            e.preventDefault();
            this.increaseIndentation();
        }

        decreaseIndentationButton.onclick = (e) => {
            e.preventDefault();
            this.decreaseIndentation();
        }

        linkButton.onclick = (e) => {
            e.preventDefault();

            while (this.secondaryLevelContainer.firstChild) {
                this.secondaryLevelContainer.removeChild(this.secondaryLevelContainer.firstChild);
            }

            let input = document.createElement('input');
            input.type = 'input';
            input.className = 'limpid-link-input';

            let icon = document.createElement('span');

            const color = '#d5ded4'
            icon.innerHTML = '<svg style="min-width:28px; min-height:28px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>link</title><path stroke="' + color + '" fill="' + color + '" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>'
            icon.style.position = 'absolute';
            icon.style.top = '6px';
            icon.style.left = '8px';

            this.secondaryLevelContainer.appendChild(input);
            this.secondaryLevelContainer.appendChild(icon);

            const confirmButton = document.createElement('button');
            confirmButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>check</title><path  fill="#233231" stroke="#233231"  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>';
            confirmButton.className = 'formatter-button';

            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path  fill="#233231" stroke="#233231"  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>';
            cancelButton.className = 'formatter-button';
            confirmButton.style.marginLeft = '4px';
            this.secondaryLevelContainer.appendChild(confirmButton);
            this.secondaryLevelContainer.appendChild(cancelButton);


            cancelButton.onclick = (e) => {
                this.firstLevelContainer.style.display = 'flex';
                this.secondaryLevelContainer.style.display = 'none';
            }


            this.firstLevelContainer.style.display = 'none';
            this.secondaryLevelContainer.style.display = 'flex';
        }
    }

    toggleBold() {
        setTimeout(() => {
            window.editorView.focus();
            const command = toggleMark(textSchema.marks.strong);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    toggleItalic() {
        setTimeout(() => {
            window.editorView.focus();
            const command = toggleMark(textSchema.marks.em);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    increaseIndentation() {
        setTimeout(() => {
            window.editorView.focus();
            const command = liftListItem(textSchema.nodes.list_item);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    decreaseIndentation() {
        setTimeout(() => {
            window.editorView.focus();
            const command = sinkListItem(textSchema.nodes.list_item);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    toggleStrikeThrough() {
        setTimeout(() => {
            window.editorView.focus();
            const command = toggleMark(textSchema.marks.del);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    toggleCode() {
        setTimeout(() => {
            window.editorView.focus();
            const command = toggleMark(textSchema.marks.code);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    toggleUnderscore() {
        setTimeout(() => {
            window.editorView.focus();
            const command = toggleMark(textSchema.marks.u);
            command(window.editorView.state, window.editorView.dispatch, window.editorView);
        }, 100);
    }

    destroy() {
        window.editorView.dom.removeEventListener("mousedown", this.viewMousedownHandler);
        window.editorView.dom.removeEventListener("mouseup", this.viewMouseupHandler);
        window.editorView.dom.removeEventListener("dragstart", this.dragstartHandler);
        document.body.removeChild(this.dom);
    }

    viewMousedownHandler = () => {
        this.preventShow = true;
    };

    viewMouseupHandler = () => {
        this.preventShow = false;
        setTimeout(() => this.update(window.editorView));
    };

    dragstartHandler = () => {
        this.dom.style.display = 'none';
        this.toolbarIsOpen = false;
    };

    shouldShow(view, state, from, to) {
        const { doc, selection } = state;
        const { empty } = selection;

        // Sometime check for `empty` is not enough.
        // Doubleclick an empty paragraph returns a node size of 2.
        // So we check also for an empty text size.
        const isEmptyTextBlock =
            !doc.textBetween(from, to).length && isTextSelection(state.selection);


        let result = !(!view.hasFocus() || empty || isEmptyTextBlock);

        return result;
    }

    getBlockInfoFromPos(
        doc,
        posInBlock
    ) {
        if (posInBlock <= 0 || posInBlock > doc.nodeSize) {
            return undefined;
        }

        const $pos = doc.resolve(posInBlock);

        const maxDepth = $pos.depth;
        let node = $pos.node(maxDepth);
        let depth = maxDepth;

        while (depth >= 0) {
            // If the outermost node is not a block, it means the position does not lie within a block.
            if (depth === 0) {
                return undefined;
            }
            if (node.type.name === "paragraph") {
                break;
            }

            depth -= 1;
            node = $pos.node(depth);
        }

        const id = node.attrs["id"];
        const contentNode = node.firstChild;
        const contentType = contentNode.type;
        const numChildBlocks = node.childCount === 2 ? node.lastChild.childCount : 0;

        const startPos = $pos.start(depth);
        const endPos = $pos.end(depth);

        return {
            id,
            node,
            contentNode,
            contentType,
            numChildBlocks,
            startPos,
            endPos,
            depth,
        };
    }

    update(view, oldState) {
        const { state, composing } = view;
        const { doc, selection } = state;

        if (selection.node) {
            return;
        }

        const isSame =
            oldState && oldState.doc.eq(doc) && oldState.selection.eq(selection);

        if (composing || isSame) {
            return;
        }

        // support for CellSelections
        const { ranges } = selection;

        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));
        const shouldShow = this.shouldShow(
            view,
            state,
            from,
            to,
        );

        // Checks if menu should be shown.
        if (
            !this.toolbarIsOpen &&
            !this.preventShow &&
            (shouldShow || this.preventHide)
        ) {
            this.toolbarIsOpen = true;
            this.dom.style.display = 'flex';
            this.secondaryLevelContainer.style.display = 'none';
            this.firstLevelContainer.style.display = 'flex';
            this.positionMenu(view);
            // TODO: Is this necessary? Also for other menu plugins.
            // Listener stops focus moving to the menu on click.
            // this.dom.addEventListener("mousedown", (event) =>
            //     event.preventDefault()
            // );
            return;
        }

        if (
            this.toolbarIsOpen &&
            !this.preventShow &&
            (shouldShow || this.preventHide)
        ) {
            this.positionMenu(view);
            return;
        }

        if (
            this.toolbarIsOpen &&
            !this.preventHide &&
            (!shouldShow || this.preventShow)
        ) {
            this.dom.style.display = 'none';
            this.toolbarIsOpen = false;
            // Listener stops focus moving to the menu on click.
            //   this.dom.removeEventListener(
            //     "mousedown",
            //   (event) => event.preventDefault()
            // );

            return;
        }

    }

    positionMenu(view) {

        const anchorRect = this.getSelectionBoundingBox();
        const editorRect = view.dom.parentNode.parentNode.getBoundingClientRect();
        const menuRect = this.dom.getBoundingClientRect();

        const distanceToBottom = editorRect.top + editorRect.height - anchorRect.top - anchorRect.height - 8;
        const distanceToTop = anchorRect.top - editorRect.top - 8;
        const rightToBorder = editorRect.left + editorRect.width - anchorRect.left - menuRect.width;

        this.dom.style.left = (anchorRect.left + (rightToBorder < 0 ? rightToBorder : 0)) + 'px';

        if (distanceToTop > menuRect.height + 8) {
            this.dom.style.top = (anchorRect.top - menuRect.height - 8) + 'px';
        }
        else if (distanceToBottom > menuRect.height + 8) {
            this.dom.style.top = (anchorRect.top + anchorRect.height + 8) + 'px';
        }
        else {
            if (distanceToBottom > distanceToTop) {
                this.dom.style.top = (anchorRect.top + anchorRect.height + 8) + 'px';
            }
            else {
                this.dom.style.top = (anchorRect.top - menuRect.height - 8) + 'px';
            }
        }

    }

    getSelectionBoundingBox() {
        const { state } = window.editorView;
        const { selection } = state;

        // support for CellSelections
        const { ranges } = selection;
        const from = Math.min(...ranges.map((range) => range.$from.pos));
        const to = Math.max(...ranges.map((range) => range.$to.pos));

        if (isNodeSelection(selection)) {
            const node = window.editorView.nodeDOM(from);

            if (node) {
                return node.getBoundingClientRect();
            }
        }

        return posToDOMRect(window.editorView, from, to);
    }

}

export default function formatterPlugin() {
    const key = new PluginKey("formatterplugin");
    return new Plugin({
        key: key,
        view: (view) => new FormatterView(key, null),
    });
}