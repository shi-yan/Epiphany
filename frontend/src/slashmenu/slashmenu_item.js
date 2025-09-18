import textSchema from "./textschema"


class SlashMenuItem {
    constructor(icon, title, subtitle, shortcut, execute) {
        this.icon = icon;
        this.title = title;
        this.subtitle = subtitle;
        this.shortcut = shortcut;
        this.prevItem = null;
        this.nextItem = null;
        this.section = null;
        this.isActive = false;
        this.execute = execute;

        let item = document.createElement('div');
        item.classList.add('slash-menu-item');
        this.iconElem = document.createElement('div');
        this.iconElem.innerHTML = this.icon;
        this.iconElem.classList.add('slash-menu-item-icon');

        item.appendChild(this.iconElem);

        let itemTitleContainer = document.createElement('div');
        itemTitleContainer.classList.add('slash-menu-item-title-container');

        let itemTitle = document.createElement('div');
        itemTitle.classList.add('slash-menu-item-title');
        itemTitle.textContent = this.title;
        itemTitleContainer.appendChild(itemTitle);

        let itemSubtitle = document.createElement('div');
        itemSubtitle.classList.add('slash-menu-item-subtitle');
        itemSubtitle.textContent = this.subtitle;
        itemTitleContainer.appendChild(itemSubtitle);

        item.appendChild(itemTitleContainer);
        let itemShortcutDiv = document.createElement('div');
        itemShortcutDiv.classList.add('slash-menu-item-shortcut-container');
        this.itemShortcut = document.createElement('span');
        this.itemShortcut.classList.add('slash-menu-item-shortcut');

        this.itemShortcut.textContent = this.shortcut;
        itemShortcutDiv.appendChild(this.itemShortcut);
        item.appendChild(itemShortcutDiv);

        this.elem = item;
        this.isFiltered = false;
        this.isApplicable = true;
    }

    setActive(noSmooth) {
        this.isActive = true;
        this.elem.classList.add('slash-menu-item-active');
        this.itemShortcut.classList.add('slash-menu-item-shortcut-active');
        this.iconElem.classList.add('slash-menu-item-icon-active');
        if (!noSmooth) {
            this.elem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        else {
            this.elem.scrollIntoView({ block: "center", inline: "nearest" });
        }
    }

    deactive() {
        this.isActive = false;
        this.elem.classList.remove('slash-menu-item-active');
        this.itemShortcut.classList.remove('slash-menu-item-shortcut-active');
        this.iconElem.classList.remove('slash-menu-item-icon-active');
    }

    getSecondaryMenu() {
        return null;
    }

    toggleAvailabilityByQuery(query) {
        if (!this.isApplicable) {
            this.isFiltered = false;
        } else if (this.title.toLowerCase().indexOf(query) == -1) {
            this.isFiltered = true;
        } else {
            this.isFiltered = false;
        }
    }

    restoreAvailability() {
        this.isFiltered = false;
    }

    isAvailable() {
        if (!this.isApplicable) {
            return false;
        }

        if (this.isFiltered) {
            return false;
        }

        return true;
    }
}

class CodeEditorItem extends SlashMenuItem {
    constructor(icon, title, subtitle, shortcut) {
        super(icon, title, subtitle, shortcut, (view) => {
            const lang = this.currentItem.title.toLowerCase();
            view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.code_block.create({lang:lang})));
        });
        const color = "#337287";

        let submenuItem = [{
            icon: '<i class="icon icon-language-javascript">&#x6a;</i>',
            title: 'Javascript',
        }, {
            icon: '<i class="icon icon-language-python">&#x6b;</i>',
            title: 'Python',
        }, {
            icon: '<i class="icon icon-language-cpp">&#x6c;</i>',
            title: 'Cpp',
        }, {
            icon: '<i class="icon icon-language-rust">&#x6d;</i>',
            title: 'Rust',
        }, {
            icon: '<i class="icon icon-language-html5">&#x6e;</i>',
            title: 'Html',
        }, {
            icon: '<i class="icon icon-language-css3">&#x6f;</i>',
            title: 'Css',
        }, {
            icon: '<i class="icon icon-code-json">&#x70;</i>',
            title: 'Json',
        }];

        let firstItem = null;
        let prevItem = null;

        this.secondaryElm = document.createElement('div');
        this.secondaryElm.style.display = 'flex';
        this.secondaryElm.style.flexDirection = 'column';

        for (let i = 0; i < submenuItem.length; ++i) {

            submenuItem[i].prevItem = prevItem;
            if (prevItem) {
                prevItem.nextItem = submenuItem[i];
            }
            if (!firstItem) {
                firstItem = submenuItem[i];
            }
            prevItem = submenuItem[i];


            let item = document.createElement('div');
            item.classList.add('slash-menu-item');
            let iconElem = document.createElement('div');
            iconElem.innerHTML = submenuItem[i].icon;
            iconElem.classList.add('slash-menu-item-icon');
            submenuItem[i].iconElem = iconElem;
            item.appendChild(iconElem);

            let itemTitleContainer = document.createElement('div');
            itemTitleContainer.classList.add('slash-menu-item-title-container');

            let itemTitle = document.createElement('div');

            itemTitle.classList.add('slash-menu-item-title');
            itemTitle.classList.add('slash-menu-item-secondary-title');

            itemTitle.textContent = submenuItem[i].title;
            itemTitleContainer.appendChild(itemTitle);
            item.appendChild(itemTitleContainer);
            submenuItem[i].elem = item;

            this.secondaryElm.appendChild(item);
        }
        prevItem.nextItem = firstItem;

        this.currentItem = firstItem;

        this.activeSubitem(firstItem);
    }

    activeSubitem(item) {
        item.elem.classList.add('slash-menu-item-active');
        item.iconElem.classList.add('slash-menu-item-icon-active');
        item.elem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    deactiveSubitem(item) {
        item.elem.classList.remove('slash-menu-item-active');
        item.iconElem.classList.remove('slash-menu-item-icon-active');
    }

    probeNext() {
        this.deactiveSubitem(this.currentItem);
        this.currentItem = this.currentItem.nextItem;
        this.activeSubitem(this.currentItem);
    }

    probePrev() {
        this.deactiveSubitem(this.currentItem);
        this.currentItem = this.currentItem.prevItem;
        this.activeSubitem(this.currentItem);
    }

    getSecondaryMenu() {
        return this.secondaryElm;
    }
}

class EquationRefItem extends SlashMenuItem {
    constructor(icon, title, subtitle, shortcut, equationManager) {
        super(icon, title, subtitle, shortcut, (view) => {
            view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.equation_ref.create({
                id:
                    this.currentItem.key
            })));
        });


        this.secondaryElm = document.createElement('div');
        this.secondaryElm.style.display = 'flex';
        this.secondaryElm.style.flexDirection = 'column';
        this.equationManager = equationManager;

    }

    activeSubitem(item) {
        item.elem.classList.add('slash-menu-item-active');
        item.elem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    deactiveSubitem(item) {
        item.elem.classList.remove('slash-menu-item-active');
    }

    probeNext() {
        this.deactiveSubitem(this.currentItem);
        this.currentItem = this.currentItem.nextItem;
        this.activeSubitem(this.currentItem);
    }

    probePrev() {
        this.deactiveSubitem(this.currentItem);
        this.currentItem = this.currentItem.prevItem;
        this.activeSubitem(this.currentItem);
    }

    getSecondaryMenu() {
        const exisitingEquations = this.equationManager.getOrderedExistingEquations();

        let firstItem = null;
        let prevItem = null;

        while (this.secondaryElm.firstChild) {
            this.secondaryElm.removeChild(this.secondaryElm.firstChild);
        }

        exisitingEquations.forEach((value, index, array) => {
            let container = document.createElement('div');
            container.className = 'limpid-equation-ref-selector-item';

            let count = document.createElement('span');
            count.innerText = '(' + value.id + ')';
            container.appendChild(count);

            container.appendChild(value.dom);

            value.dom.className = 'limpid-equation-ref-selector-display';

            this.secondaryElm.appendChild(container);

            let elem = { id: value.id, key: value.key, elem: container, prevItem: prevItem, nextItem: null };

            if (prevItem) {
                prevItem.nextItem = elem;
            }
            if (!firstItem) {
                firstItem = elem
            }

            prevItem = elem;
        })

        prevItem.nextItem = firstItem;

        this.currentItem = firstItem;

        this.activeSubitem(firstItem);


        return this.secondaryElm;
    }

    toggleAvailabilityByQuery(query) {
        if (this.equationManager.count() == 0) {
            this.isFiltered = false;
        } else if (this.title.toLowerCase().indexOf(query) == -1) {
            this.isFiltered = true;
        } else {
            this.isFiltered = false;
        }
    }

    restoreAvailability() {
        this.isFiltered = false;
    }

    isAvailable() {
        if (this.equationManager.count() == 0) {
            return false;
        }

        if (this.isFiltered) {
            return false;
        }

        return true;
    }
}

export { SlashMenuItem, CodeEditorItem, EquationRefItem };