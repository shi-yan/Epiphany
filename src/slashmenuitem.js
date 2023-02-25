export default class SlashMenuItem {
    constructor(icon, title, subtitle, shortcut) {
        this.icon = icon;
        this.title = title;
        this.subtitle = subtitle;
        this.shortcut = shortcut;

        let item = document.createElement('div');
        item.classList.add('slash-menu-item');
        let iconElem = document.createElement('div');
        iconElem.innerHTML = this.icon;
        iconElem.classList.add('slash-menu-item-icon');
        
        item.appendChild(iconElem);

        let itemTitleContainer = document.createElement('div');
        itemTitleContainer.classList.add('slash-menu-item-title-container');

        let itemTitle = document.createElement('div');
        itemTitle.classList.add('slash-menu-item-title');
        itemTitle.textContent = this.title;
        itemTitleContainer .appendChild(itemTitle);

        let itemSubtitle = document.createElement('div');
        itemSubtitle.classList.add('slash-menu-item-subtitle');
        itemSubtitle.textContent = this.subtitle;
        itemTitleContainer .appendChild(itemSubtitle);

        item.appendChild(itemTitleContainer);
        let itemShortcutDiv = document.createElement('div');
        itemShortcutDiv.classList.add('slash-menu-item-shortcut-container');
        let itemShortcut = document.createElement('span');
        itemShortcut.classList.add('slash-menu-item-shortcut');
        
        itemShortcut.textContent = this.shortcut;
        itemShortcutDiv.appendChild(itemShortcut);
        item.appendChild(itemShortcutDiv);

        this.elem = item;
    }

    hasSecondaryMenu() {
        return false;
    }

    getSecondaryMenu() {
        return null;
    }

    available(query) {

    }
}