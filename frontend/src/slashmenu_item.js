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
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-javascript</title><path  fill="' + color + '"  d="M3,3H21V21H3V3M7.73,18.04C8.13,18.89 8.92,19.59 10.27,19.59C11.77,19.59 12.8,18.79 12.8,17.04V11.26H11.1V17C11.1,17.86 10.75,18.08 10.2,18.08C9.62,18.08 9.38,17.68 9.11,17.21L7.73,18.04M13.71,17.86C14.21,18.84 15.22,19.59 16.8,19.59C18.4,19.59 19.6,18.76 19.6,17.23C19.6,15.82 18.79,15.19 17.35,14.57L16.93,14.39C16.2,14.08 15.89,13.87 15.89,13.37C15.89,12.96 16.2,12.64 16.7,12.64C17.18,12.64 17.5,12.85 17.79,13.37L19.1,12.5C18.55,11.54 17.77,11.17 16.7,11.17C15.19,11.17 14.22,12.13 14.22,13.4C14.22,14.78 15.03,15.43 16.25,15.95L16.67,16.13C17.45,16.47 17.91,16.68 17.91,17.26C17.91,17.74 17.46,18.09 16.76,18.09C15.93,18.09 15.45,17.66 15.09,17.06L13.71,17.86Z" /></svg>',
            title: 'Javascript',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-python</title><path  fill="' + color + '"  d="M19.14,7.5A2.86,2.86 0 0,1 22,10.36V14.14A2.86,2.86 0 0,1 19.14,17H12C12,17.39 12.32,17.96 12.71,17.96H17V19.64A2.86,2.86 0 0,1 14.14,22.5H9.86A2.86,2.86 0 0,1 7,19.64V15.89C7,14.31 8.28,13.04 9.86,13.04H15.11C16.69,13.04 17.96,11.76 17.96,10.18V7.5H19.14M14.86,19.29C14.46,19.29 14.14,19.59 14.14,20.18C14.14,20.77 14.46,20.89 14.86,20.89A0.71,0.71 0 0,0 15.57,20.18C15.57,19.59 15.25,19.29 14.86,19.29M4.86,17.5C3.28,17.5 2,16.22 2,14.64V10.86C2,9.28 3.28,8 4.86,8H12C12,7.61 11.68,7.04 11.29,7.04H7V5.36C7,3.78 8.28,2.5 9.86,2.5H14.14C15.72,2.5 17,3.78 17,5.36V9.11C17,10.69 15.72,11.96 14.14,11.96H8.89C7.31,11.96 6.04,13.24 6.04,14.82V17.5H4.86M9.14,5.71C9.54,5.71 9.86,5.41 9.86,4.82C9.86,4.23 9.54,4.11 9.14,4.11C8.75,4.11 8.43,4.23 8.43,4.82C8.43,5.41 8.75,5.71 9.14,5.71Z" /></svg>',
            title: 'Python',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-cpp</title><path  fill="' + color + '"  d="M10.5,15.97L10.91,18.41C10.65,18.55 10.23,18.68 9.67,18.8C9.1,18.93 8.43,19 7.66,19C5.45,18.96 3.79,18.3 2.68,17.04C1.56,15.77 1,14.16 1,12.21C1.05,9.9 1.72,8.13 3,6.89C4.32,5.64 5.96,5 7.94,5C8.69,5 9.34,5.07 9.88,5.19C10.42,5.31 10.82,5.44 11.08,5.59L10.5,8.08L9.44,7.74C9.04,7.64 8.58,7.59 8.05,7.59C6.89,7.58 5.93,7.95 5.18,8.69C4.42,9.42 4.03,10.54 4,12.03C4,13.39 4.37,14.45 5.08,15.23C5.79,16 6.79,16.4 8.07,16.41L9.4,16.29C9.83,16.21 10.19,16.1 10.5,15.97M11,11H13V9H15V11H17V13H15V15H13V13H11V11M18,11H20V9H22V11H24V13H22V15H20V13H18V11Z" /></svg>',
            title: 'Cpp',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-rust</title><path  fill="' + color + '"  d="M21.9 11.7L21 11.2V11L21.7 10.3C21.8 10.2 21.8 10 21.7 9.9L21.6 9.8L20.7 9.5C20.7 9.4 20.7 9.3 20.6 9.3L21.2 8.5C21.3 8.4 21.3 8.2 21.1 8.1C21.1 8.1 21 8.1 21 8L20 7.8C20 7.7 19.9 7.7 19.9 7.6L20.3 6.7V6.4C20.2 6.3 20.1 6.3 20 6.3H19C19 6.3 19 6.2 18.9 6.2L19.1 5.2C19.1 5 19 4.9 18.9 4.9H18.8L17.8 5.1C17.8 5 17.7 5 17.6 4.9V3.9C17.6 3.7 17.5 3.6 17.3 3.6H17.2L16.3 4H16.2L16 3C16 2.8 15.8 2.7 15.7 2.8H15.6L14.8 3.4C14.7 3.4 14.6 3.4 14.6 3.3L14.3 2.4C14.2 2.3 14.1 2.2 13.9 2.2C13.9 2.2 13.8 2.2 13.8 2.3L13 3H12.8L12.3 2.2C12.2 2 12 2 11.8 2L11.7 2.1L11.2 3H11L10.3 2.3C10.2 2.2 10 2.2 9.9 2.3L9.8 2.4L9.5 3.3C9.4 3.3 9.3 3.3 9.3 3.4L8.5 2.8C8.3 2.7 8.1 2.7 8 2.9V3L7.8 4C7.8 4 7.7 4 7.6 4.1L6.7 3.7C6.6 3.6 6.4 3.7 6.3 3.8V4.9C6.3 5 6.2 5 6.2 5.1L5.2 4.9C5 4.8 4.9 4.9 4.9 5.1V5.2L5.1 6.2C5 6.2 5 6.3 4.9 6.3H3.9C3.7 6.3 3.6 6.4 3.6 6.6V6.7L4 7.6V7.8L3 8C2.8 8 2.7 8.2 2.7 8.3V8.4L3.3 9.2C3.3 9.3 3.3 9.4 3.2 9.4L2.4 9.8C2.3 9.9 2.2 10 2.2 10.2C2.2 10.2 2.2 10.3 2.3 10.3L3 11V11.2L2.2 11.7C2 11.8 2 12 2 12.1L2.1 12.2L3 12.8V13L2.3 13.7C2.2 13.8 2.2 14 2.3 14.1L2.4 14.2L3.3 14.5C3.3 14.6 3.3 14.7 3.4 14.7L2.8 15.5C2.7 15.6 2.7 15.8 2.9 15.9C2.9 15.9 3 15.9 3 16L4 16.2C4 16.3 4.1 16.3 4.1 16.4L3.7 17.3C3.6 17.4 3.7 17.6 3.8 17.7H4.9C5 17.7 5 17.8 5.1 17.8L4.9 18.8C4.9 19 5 19.1 5.1 19.1H5.2L6.2 18.9C6.2 19 6.3 19 6.4 19.1V20.1C6.4 20.3 6.5 20.4 6.7 20.4H6.8L7.7 20H7.8L8 21C8 21.2 8.2 21.3 8.3 21.2H8.4L9.2 20.6C9.3 20.6 9.4 20.6 9.4 20.7L9.7 21.6C9.8 21.7 9.9 21.8 10.1 21.8C10.1 21.8 10.2 21.8 10.2 21.7L11 21H11.2L11.7 21.8C11.8 21.9 12 22 12.1 21.9L12.2 21.8L12.7 21H12.9L13.6 21.7C13.7 21.8 13.9 21.8 14 21.7L14.1 21.6L14.4 20.7C14.5 20.7 14.6 20.7 14.6 20.6L15.4 21.2C15.5 21.3 15.7 21.3 15.8 21.1C15.8 21.1 15.8 21 15.9 21L16.1 20C16.2 20 16.2 19.9 16.3 19.9L17.2 20.3C17.3 20.4 17.5 20.3 17.6 20.2V19.1L17.8 18.9L18.8 19.1C19 19.1 19.1 19 19.1 18.9V18.8L18.9 17.8L19.1 17.6H20.1C20.3 17.6 20.4 17.5 20.4 17.3V17.2L20 16.3C20 16.2 20.1 16.2 20.1 16.1L21.1 15.9C21.3 15.9 21.4 15.7 21.3 15.6V15.5L20.7 14.7L20.8 14.5L21.7 14.2C21.8 14.1 21.9 14 21.9 13.8C21.9 13.8 21.9 13.7 21.8 13.7L21 13V12.8L21.8 12.3C22 12.2 22 12 21.9 11.7C21.9 11.8 21.9 11.8 21.9 11.7M16.2 18.7C15.9 18.6 15.7 18.3 15.7 18C15.8 17.7 16.1 17.5 16.4 17.5C16.7 17.6 16.9 17.9 16.9 18.2C16.9 18.6 16.6 18.8 16.2 18.7M16 16.8C15.7 16.7 15.4 16.9 15.4 17.2L15 18.6C14.1 19 13.1 19.2 12 19.2C10.9 19.2 9.9 19 8.9 18.5L8.6 17.1C8.5 16.8 8.3 16.6 8 16.7L6.8 17C6.6 16.8 6.4 16.5 6.2 16.3H12.2C12.3 16.3 12.3 16.3 12.3 16.2V14.1C12.3 14 12.3 14 12.2 14H10.5V12.7H12.4C12.6 12.7 13.3 12.7 13.6 13.7C13.7 14 13.8 15 14 15.3C14.1 15.6 14.6 16.3 15.1 16.3H18.2C18 16.6 17.8 16.8 17.5 17.1L16 16.8M7.7 18.7C7.4 18.8 7.1 18.6 7 18.2C6.9 17.9 7.1 17.6 7.5 17.5S8.1 17.6 8.2 18C8.2 18.3 8 18.6 7.7 18.7M5.4 9.5C5.5 9.8 5.4 10.2 5.1 10.3C4.8 10.4 4.4 10.3 4.3 10C4.2 9.7 4.3 9.3 4.6 9.2C5 9.1 5.3 9.2 5.4 9.5M4.7 11.1L6 10.6C6.3 10.5 6.4 10.2 6.3 9.9L6 9.3H7V14H5C4.7 13 4.6 12.1 4.7 11.1M10.3 10.7V9.3H12.8C12.9 9.3 13.7 9.4 13.7 10C13.7 10.5 13.1 10.7 12.6 10.7H10.3M19.3 11.9V12.4H18.5C18.4 12.4 18.4 12.4 18.4 12.5V12.8C18.4 13.6 17.9 13.8 17.5 13.8C17.1 13.8 16.7 13.6 16.6 13.4C16.4 12.1 16 11.9 15.4 11.4C16.1 10.9 16.9 10.2 16.9 9.3C16.9 8.3 16.2 7.7 15.8 7.4C15.1 7 14.4 6.9 14.2 6.9H6.6C7.7 5.7 9.1 4.9 10.7 4.6L11.6 5.6C11.8 5.8 12.1 5.8 12.4 5.6L13.4 4.6C15.5 5 17.3 6.3 18.4 8.2L17.7 9.8C17.6 10.1 17.7 10.4 18 10.5L19.3 11.1V11.9M11.6 3.9C11.8 3.7 12.2 3.7 12.4 3.9C12.6 4.1 12.6 4.5 12.4 4.7C12.1 5 11.8 5 11.5 4.7C11.3 4.5 11.4 4.2 11.6 3.9M18.5 9.5C18.6 9.2 19 9.1 19.3 9.2C19.6 9.3 19.7 9.7 19.6 10C19.5 10.3 19.1 10.4 18.8 10.3C18.5 10.2 18.4 9.8 18.5 9.5Z" /></svg>',
            title: 'Rust',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-html5</title><path  fill="' + color + '"  d="M12,17.56L16.07,16.43L16.62,10.33H9.38L9.2,8.3H16.8L17,6.31H7L7.56,12.32H14.45L14.22,14.9L12,15.5L9.78,14.9L9.64,13.24H7.64L7.93,16.43L12,17.56M4.07,3H19.93L18.5,19.2L12,21L5.5,19.2L4.07,3Z" /></svg>',
            title: 'Html',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>language-css3</title><path  fill="' + color + '"  d="M5,3L4.35,6.34H17.94L17.5,8.5H3.92L3.26,11.83H16.85L16.09,15.64L10.61,17.45L5.86,15.64L6.19,14H2.85L2.06,18L9.91,21L18.96,18L20.16,11.97L20.4,10.76L21.94,3H5Z" /></svg>',
            title: 'Css',
        }, {
            icon: '<svg style="min-width:32px; min-height:32px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>code-json</title><path   fill="' + color + '"  d="M5,3H7V5H5V10A2,2 0 0,1 3,12A2,2 0 0,1 5,14V19H7V21H5C3.93,20.73 3,20.1 3,19V15A2,2 0 0,0 1,13H0V11H1A2,2 0 0,0 3,9V5A2,2 0 0,1 5,3M19,3A2,2 0 0,1 21,5V9A2,2 0 0,0 23,11H24V13H23A2,2 0 0,0 21,15V19A2,2 0 0,1 19,21H17V19H19V14A2,2 0 0,1 21,12A2,2 0 0,1 19,10V5H17V3H19M12,15A1,1 0 0,1 13,16A1,1 0 0,1 12,17A1,1 0 0,1 11,16A1,1 0 0,1 12,15M8,15A1,1 0 0,1 9,16A1,1 0 0,1 8,17A1,1 0 0,1 7,16A1,1 0 0,1 8,15M16,15A1,1 0 0,1 17,16A1,1 0 0,1 16,17A1,1 0 0,1 15,16A1,1 0 0,1 16,15Z" /></svg>',
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