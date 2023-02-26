export default class SlashMenuItem {
    constructor(icon, title, subtitle, shortcut) {
        this.icon = icon;
        this.title = title;
        this.subtitle = subtitle;
        this.shortcut = shortcut;
        this.prevItem = null;
        this.nextItem = null;
        this.section = null;
        this.isActive = false;

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

    setActive() {
        this.isActive = true;
        this.elem.classList.add('slash-menu-item-active');
        this.itemShortcut.classList.add('slash-menu-item-shortcut-active');
        this.iconElem.classList.add('slash-menu-item-icon-active');
        this.elem.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    }

    deactive() {
        this.isActive = false;
        this.elem.classList.remove('slash-menu-item-active');
        this.itemShortcut.classList.remove('slash-menu-item-shortcut-active');
        this.iconElem.classList.remove('slash-menu-item-icon-active');
    }

    hasSecondaryMenu() {
        return false;
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