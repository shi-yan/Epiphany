import {
    isNodeSelection,
    isTextSelection,
    posToDOMRect,
} from "@tiptap/core";
import { EditorState, Plugin, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Node, NodeType } from "prosemirror-model";
import textSchema from "./textschema";
import {
    wrapIn, setBlockType, chainCommands, toggleMark, exitCode,
    joinUp, joinDown, lift, selectParentNode
} from "prosemirror-commands"

class FormatterView {
    constructor(pluginkey, menuItems) {
        this.dom = document.createElement('div');
      //  this.dom.style.width = '320px';
        this.dom.style.height = '42px';
        this.dom.className = 'formatter-menu';
        this.dom.style.position = "absolute";
        this.dom.style.flexDirection = "row";
        this.dom.style.left = '0px';
        this.dom.style.top = '0px';
        this.dom.style.display = 'none';
        this.dom.style.padding = '4px';
        const boldButton = document.createElement('button');
        boldButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-bold</title><path fill="#233231" stroke="#233231" d="M13.5,15.5H10V12.5H13.5A1.5,1.5 0 0,1 15,14A1.5,1.5 0 0,1 13.5,15.5M10,6.5H13A1.5,1.5 0 0,1 14.5,8A1.5,1.5 0 0,1 13,9.5H10M15.6,10.79C16.57,10.11 17.25,9 17.25,8C17.25,5.74 15.5,4 13.25,4H7V18H14.04C16.14,18 17.75,16.3 17.75,14.21C17.75,12.69 16.89,11.39 15.6,10.79Z" /></svg>';
        boldButton.className='formatter-button';

        const italicButton = document.createElement('button');
        italicButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-italic</title><path fill="#233231" stroke="#233231"  d="M10,4V7H12.21L8.79,15H6V18H14V15H11.79L15.21,7H18V4H10Z" /></svg>';
        italicButton.className='formatter-button';


        const underscoreButton = document.createElement('button');
        underscoreButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-underline</title><path fill="#233231" stroke="#233231" d="M5,21H19V19H5V21M12,17A6,6 0 0,0 18,11V3H15.5V11A3.5,3.5 0 0,1 12,14.5A3.5,3.5 0 0,1 8.5,11V3H6V11A6,6 0 0,0 12,17Z" /></svg>';
        underscoreButton.className='formatter-button';

        const strikeThroughButton = document.createElement('button');
        strikeThroughButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-strikethrough</title><path fill="#233231" stroke="#233231" d="M3,14H21V12H3M5,4V7H10V10H14V7H19V4M10,19H14V16H10V19Z" /></svg>';
        strikeThroughButton.className='formatter-button';

        const increaseIndentationButton = document.createElement('button');
        increaseIndentationButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-indent-increase</title><path  fill="#233231" stroke="#233231"  d="M11,13H21V11H11M11,9H21V7H11M3,3V5H21V3M11,17H21V15H11M3,8V16L7,12M3,21H21V19H3V21Z" /></svg>';
        increaseIndentationButton.className='formatter-button';

        const decreaseIndentationButton = document.createElement('button');
        decreaseIndentationButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-indent-decrease</title><path  fill="#233231" stroke="#233231"  d="M11,13H21V11H11M11,9H21V7H11M3,3V5H21V3M3,21H21V19H3M3,12L7,16V8M11,17H21V15H11V17Z" /></svg>';
        decreaseIndentationButton.className='formatter-button';

        const codeButton = document.createElement('button');
        codeButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>code-tags</title><path  fill="#233231" stroke="#233231" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" /></svg>';
        codeButton.className='formatter-button';  

        const linkButton = document.createElement('button');
        linkButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>link</title><path  fill="#233231" stroke="#233231" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>';
        linkButton.className='formatter-button';  

        this. firstLevelContainer = document.createElement('div');
        this.firstLevelContainer.style.display='flex';
        this.firstLevelContainer.style.flexDirection = 'row'
        this.firstLevelContainer.appendChild(boldButton);
        this.firstLevelContainer.appendChild(italicButton);
        this. firstLevelContainer.appendChild(underscoreButton);
        this.firstLevelContainer.appendChild(strikeThroughButton);
        this.firstLevelContainer.appendChild(increaseIndentationButton);
        this. firstLevelContainer.appendChild(decreaseIndentationButton);
        this.firstLevelContainer.appendChild(codeButton);
        this. firstLevelContainer.appendChild(linkButton);
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

        linkButton.onclick = (e) => {
            e.preventDefault();

            while(this.secondaryLevelContainer.firstChild) {
                this.secondaryLevelContainer.removeChild(this.secondaryLevelContainer.firstChild);
            }

            let input = document.createElement('input');
            input.type = 'input';
            input.className = 'limpid-link-input';

            let icon = document.createElement('span');

            const color = '#d5ded4'
            icon.innerHTML = '<svg style="min-width:28px; min-height:28px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>link</title><path stroke="'+color+'" fill="'+color+'" d="M3.9,12C3.9,10.29 5.29,8.9 7,8.9H11V7H7A5,5 0 0,0 2,12A5,5 0 0,0 7,17H11V15.1H7C5.29,15.1 3.9,13.71 3.9,12M8,13H16V11H8V13M17,7H13V8.9H17C18.71,8.9 20.1,10.29 20.1,12C20.1,13.71 18.71,15.1 17,15.1H13V17H17A5,5 0 0,0 22,12A5,5 0 0,0 17,7Z" /></svg>'
            icon.style.position = 'absolute';
            
            icon.style.top = '6px';
            icon.style.left = '8px';

            this.secondaryLevelContainer.appendChild(input);
            this.secondaryLevelContainer.appendChild(icon);

            const confirmButton = document.createElement('button');
            confirmButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>check</title><path  fill="#233231" stroke="#233231"  d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" /></svg>';
            confirmButton.className='formatter-button';  

            const cancelButton = document.createElement('button');
            cancelButton.innerHTML = '<svg style="min-width:12px;min-height:12px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>close</title><path  fill="#233231" stroke="#233231"  d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" /></svg>';
            cancelButton.className='formatter-button';  
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

    destroy() {
        window.editorView.dom.removeEventListener("mousedown", this.viewMousedownHandler);
        window.editorView.dom.removeEventListener("mouseup", this.viewMouseupHandler);
        window.editorView.dom.removeEventListener("dragstart", this.dragstartHandler);
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