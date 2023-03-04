import textSchema from "./textschema";
import { Transform, StepMap } from "prosemirror-transform"
import { TextSelection, Selection, NodeSelection } from "prosemirror-state"


export default class SlashMenuView {
    constructor(pluginkey, menuItems) {
        // We'll need these later
        // this.getPos = getPos
        this.displayId = 0;
        this.key = new Date().getTime();
        this.pluginkey = pluginkey;
        this.menuItems = menuItems;
        // The node's representation in the editor (empty, for now)
        this.dom = document.createElement("div");
        // this.dom.style.backgroundColor = 'red';
        this.dom.style.width = '360px';
        this.dom.style.height = '280px';
        this.dom.style.position = "absolute";
        this.dom.style.left = '0px';
        this.dom.style.top = '0px';
        this.dom.classList.add('slash-menu');
        this.dom.style.display = 'none'
        //'#498091';
        this.levelOneItems = document.createElement('div')
        this.levelOneItems.classList.add('slash-menu-container');
        this.levelTwoItems = document.createElement('div')
        this.levelTwoItems.classList.add('slash-menu-container');
        this.levelTwoItems.display = 'none';
        this.dom.appendChild(this.levelOneItems);
        this.dom.appendChild(this.levelTwoItems);

        document.body.appendChild(this.dom);
        this.currentActive = null;
        this.oldCommand = ''

        this.secondaryMenu = null;
        this.renderFirstLevelItems();
    }

    renderFirstLevelItems() {
        while (this.levelOneItems.firstChild) {
            this.levelOneItems.removeChild(this.levelOneItems.firstChild);
        }
        let firstItem = null;
        let prevItem = null;
        for (let i = 0; i < this.menuItems.length; ++i) {
            let section = document.createElement('div');
            section.classList.add('slash-menu-section');
            let sectionTitle = document.createElement('div');
            sectionTitle.classList.add('slash-menu-section-title');
            let sectionTitleSpan = document.createElement('span');
            sectionTitleSpan.textContent = this.menuItems[i].section;
            sectionTitle.appendChild(sectionTitleSpan);
            section.appendChild(sectionTitle);

            for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                section.appendChild(this.menuItems[i].items[e].elem);
                this.menuItems[i].items[e].section = i;
                if (!firstItem) {
                    firstItem = this.menuItems[i].items[e];
                }
                if (prevItem) {
                    prevItem.nextItem = this.menuItems[i].items[e];
                }
                this.menuItems[i].items[e].prevItem = prevItem;
                prevItem = this.menuItems[i].items[e];
            }
            this.levelOneItems.appendChild(section);
            this.menuItems[i].sectionElem = section;
        }

        if (prevItem && firstItem) {
            prevItem.nextItem = firstItem;
            firstItem.prevItem = prevItem;
        }

        for (let i = 0; i < this.menuItems.length; ++i) {
            let hasVisibleItem = false;
            for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                if (!this.menuItems[i].items[e].isAvailable()) {
                    this.menuItems[i].items[e].elem.style.display = 'none';
                } else {
                    this.menuItems[i].items[e].elem.style.display = 'flex';

                    hasVisibleItem = true;
                }
            }
            if (!hasVisibleItem) {
                this.menuItems[i].sectionElem.style.display = 'none';
            } else {
                this.menuItems[i].sectionElem.style.display = 'block';
            }
        }

        this.currentActive = firstItem;
        firstItem.setActive();
    }

    update(view, state) {
        const newState = view.state[this.pluginkey];
        const prevState = state[this.pluginkey];

        console.log("prev state", prevState)
        console.log("new state", newState)

        if (newState.active && !prevState.active) {
            this.dom.style.display = 'flex';
            for (let i = 0; i < this.menuItems.length; ++i) {
                let hasVisibleItem = false;
                for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                    if (!this.menuItems[i].items[e].isAvailable()) {
                        this.menuItems[i].items[e].elem.style.display = 'none';
                    } else {
                        this.menuItems[i].items[e].elem.style.display = 'flex';

                        hasVisibleItem = true;
                    }
                }
                if (!hasVisibleItem) {
                    this.menuItems[i].sectionElem.style.display = 'none';
                } else {
                    this.menuItems[i].sectionElem.style.display = 'block';
                }
            }
            //get position
            const elements = document.getElementsByClassName('suggestion-decorator')

            const anchorSpan = Array.prototype.filter.call(
                elements,
                (elm) => elm.getAttribute('data-decoration-id') === newState.decorationId
            );

            if (anchorSpan) {//.getBoundingClientRect()
                //avoid menu being rendered outside editor
                const anchorRect = anchorSpan[0].getBoundingClientRect();
                const editorRect = view.dom.parentNode.parentNode.getBoundingClientRect();
                const menuRect = this.dom.getBoundingClientRect();

                const distanceToBottom = editorRect.top + editorRect.height - anchorRect.top - anchorRect.height;
                const distanceToTop = anchorRect.top - editorRect.top;
                const rightToBorder = editorRect.left + editorRect.width - anchorRect.left - menuRect.width;

                this.dom.style.left = (anchorRect.left + (rightToBorder < 0 ? rightToBorder : 0)) + 'px';
                if (distanceToBottom > distanceToTop) {
                    this.dom.style.top = (anchorRect.top + anchorRect.height) + 'px';
                }
                else {
                    this.dom.style.top = (anchorRect.top - menuRect.height) + 'px';
                }
                this.currentActive.setActive(true);
            }
        }
        else if (newState.active && prevState.active) {
            if (newState.firstLevelSelected) {
                if (this.secondaryMenu == null) {
                    let elm = this.currentActive.getSecondaryMenu();

                    if (elm) {

                        let section = document.createElement('div');
                        section.classList.add('slash-menu-section');
                        let sectionTitle = document.createElement('div');
                        sectionTitle.classList.add('slash-menu-section-title');
                        let sectionTitleSpan = document.createElement('span');
                        sectionTitleSpan.textContent = "Hit 'Backspace' to go back";
                        sectionTitle.appendChild(sectionTitleSpan);
                        section.appendChild(sectionTitle);
                        section.appendChild(elm)

                        this.levelTwoItems.appendChild(section);

                        this.secondaryMenu = elm;

                        this.levelOneItems.style.display = 'none';
                        this.levelTwoItems.style.display = 'flex';
                    }
                    else {
                        const e = this.currentActive.execute;
                        setTimeout(() => {
                            view.dispatch(view.state.tr.deleteRange(newState.queryStartPos - newState.triggerCharacter.length,
                                view.state.selection.from));
                            view.dispatch(view.state.tr.setMeta({ key: this.pluginkey }, { deactivate: true }));
                            e(view);
                        }, 100);
                    }
                }
                else {
                    if (newState.menuBrowseDirection == 1) {
                        this.currentActive.probeNext();
                    }
                    else if (newState.menuBrowseDirection == -1) {
                        this.currentActive.probePrev();
                    }

                    if (newState.execute) {
                        const e = this.currentActive.execute.bind(this.currentActive);
                        setTimeout(() => {
                            view.dispatch(view.state.tr.deleteRange(newState.queryStartPos - newState.triggerCharacter.length,
                                view.state.selection.from));
                            view.dispatch(view.state.tr.setMeta({ key: this.pluginkey }, { deactivate: true }));
                            e(view);
                        }, 100);
                    }
                }
            } else {
                if (this.oldCommand !== newState.command) {
                    if (this.oldCommand.length < newState.command.length) {
                        for (let i = 0; i < this.menuItems.length; ++i) {
                            for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                                if (!this.menuItems[i].items[e].isFiltered) {
                                    this.menuItems[i].items[e].toggleAvailabilityByQuery(newState.command);
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < this.menuItems.length; ++i) {
                            for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                                this.menuItems[i].items[e].toggleAvailabilityByQuery(newState.command);
                            }
                        }
                    }
                    this.oldCommand = newState.command;

                    for (let i = 0; i < this.menuItems.length; ++i) {
                        let hasVisibleItem = false;
                        for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                            if (!this.menuItems[i].items[e].isAvailable()) {
                                this.menuItems[i].items[e].elem.style.display = 'none';
                            } else {
                                this.menuItems[i].items[e].elem.style.display = 'flex';

                                hasVisibleItem = true;
                            }
                        }
                        if (!hasVisibleItem) {
                            this.menuItems[i].sectionElem.style.display = 'none';
                        } else {
                            this.menuItems[i].sectionElem.style.display = 'block';
                        }
                    }
                }

                if (newState.menuBrowseDirection == 1) {
                    let next = this.currentActive.nextItem;

                    while (!next.isAvailable() && next !== this.currentActive) {
                        next = next.nextItem;
                    }

                    this.currentActive.deactive();
                    this.currentActive = next;
                    this.currentActive.setActive();
                }
                else if (newState.menuBrowseDirection == -1) {
                    let prev = this.currentActive.prevItem;

                    while (!prev.isAvailable() && prev !== this.currentActive) {
                        prev = prev.prevItem;
                    }

                    this.currentActive.deactive();
                    this.currentActive = prev;
                    this.currentActive.setActive();
                }
            }
        }
        else if (!newState.active && prevState.active) {
            this.dom.style.display = 'none';
            this.levelOneItems.style.display = 'flex';
            this.levelTwoItems.style.display = 'none';
            this.secondaryMenu = null;
            let firstItem = null;
            for (let i = 0; i < this.menuItems.length; ++i) {
                for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                    this.menuItems[i].items[e].restoreAvailability();
                    if (!firstItem) {
                        firstItem = this.menuItems[i].items[e];
                    }
                }
            }

            for (let i = 0; i < this.menuItems.length; ++i) {
                let hasVisibleItem = false;
                for (let e = 0; e < this.menuItems[i].items.length; ++e) {
                    if (!this.menuItems[i].items[e].isAvailable()) {
                        this.menuItems[i].items[e].elem.style.display = 'none';
                    } else {
                        this.menuItems[i].items[e].elem.style.display = 'flex';

                        hasVisibleItem = true;
                    }
                }
                if (!hasVisibleItem) {
                    this.menuItems[i].sectionElem.style.display = 'none';
                } else {
                    this.menuItems[i].sectionElem.style.display = 'block';
                }
            }
            this.currentActive.deactive();
            this.currentActive = firstItem;
        }
        return true;
    }

    destroy() {

    }
}
