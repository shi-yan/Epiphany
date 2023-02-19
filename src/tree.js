import Events from 'eventemitter3'
import {clicked } from 'clicked'

import { Input } from './tree_input'
import { defaults, styleDefaults } from './tree_defaults'
import * as utils from './tree_utils'
import { icons } from './tree_icons'

export class Tree extends Events {
    /**
     * Create Tree
     * @param {TreeData} tree - data for tree (see readme for description)
     * @param {object} [options]
     * @param {(HTMLElement|string)} [options.element] if a string then document.querySelector(element); if empty, it creates an element
     * @param {(HTMLElement|string)} [options.parent] appends the element to this parent (if string then document.querySelector(parent))
     * @param {boolean} [options.move=true] drag tree to rearrange
     * @param {boolean} [options.select=true] click to select node (if false then nodes are not selected and tree.selection is always null)
     * @param {number} [options.indentation=8] number of pixels to indent for each level
     * @param {number} [options.threshold=10] number of pixels to move to start a drag
     * @param {number} [options.holdTime=2000] number of milliseconds to press and hold name before editing starts (set to 0 to disable)
     * @param {boolean} [options.expandOnClick=true] expand and collapse node on click without drag except (will select before expanding if select=true)
     * @param {number} [options.dragOpacity=0.75] opacity setting for dragged item
     * @param {string} [options.prefixClassName=yy-tree] first part of className for all DOM objects (e.g., yy-tree, yy-tree-indicator)
     * @param {boolean} [options.addStyles=true] attaches a style sheet with default and overridden styles; set to false to use your own stylesheet
     * @param {object} [styles]
     * @param {string[]} [styles.nameStyles] use these to override individual styles for the name (will be included in the attached stylesheet)
     * @param {string[]} [styles.contentStyles] use these to override individual styles for the content (will be included in the attached stylesheet)
     * @param {string[]} [styles.indicatorStyles] use these to override individual styles for the move-line indicator (will be included in the attached stylesheet)
     * @param {string[]} [styles.selectedStyles] use these to override individual styles for the selected item (will be included in the attached stylesheet)
     * @fires render
     * @fires clicked
     * @fires expand
     * @fires collapse
     * @fires name-change
     * @fires move
     * @fires move-pending
     * @fires update
     */
    constructor(tree, options, styles) {
        super()
        this._options = utils.options(options, defaults)
        this._input = new Input(this)
        if (typeof this._options.element === 'undefined') {
            /**
             * Main div holding tree
             * @type {HTMLElement}
             */
            this.element = document.createElement('div')
        } else {
            this.element = utils.el(this._options.element)
        }
        if (this._options.parent) {
            utils.el(this._options.parent).appendChild(this.element)
        }
        this.element.classList.add(this.prefixClassName)
        this.element.data = tree
        if (this._options.addStyles !== false) {
            this._addStyles(styles)
        }
        this.update()
    }

    /**
     * Selected data
     * @type {*}
     */
    get selection() {
        return this._selection.data
    }
    set selection(data) {
    }

    /**
     * className's prefix (e.g., "yy-tree"-content)
     * @type {string}
     */
    get prefixClassName() {
        return this._options.prefixClassName
    }
    set prefixClassName(value) {
        if (value !== this._options.prefixClassName) {
            this._options.prefixClassName = value
            this.update()
        }
    }

    /**
     * indentation for tree
     * @type {number}
     */
    get indentation() {
        return this._options.indentation
    }
    set indentation(value) {
        if (value !== this._options.indentation) {
            this._options.indentation = value
            this._input._indicatorMarginLeft = value + 'px'
            this.update()
        }
    }

    /**
     * number of milliseconds to press and hold name before editing starts (set to 0 to disable)
     * @type {number}
     */
    get holdTime() {
        return this._options.holdTime
    }
    set holdTime(value) {
        if (value !== this._options.holdTime) {
            this._options.holdTime = value
        }
    }

    /**
     * whether tree may be rearranged
     * @type {boolean}
     */
    get move() {
        return this._options.move
    }
    set move(value) {
        this._options.move = value
    }

    /**
     * expand and collapse node on click without drag except (will select before expanding if select=true)
     * @type {boolean}
     */
    get expandOnClick() {
        return this._options.expandOnClick
    }
    set expandOnClick(value) {
        this._options.expandOnClick = value
    }

    /**
     * click to select node (if false then nodes are not selected and tree.selection is always null)
     * @type {boolean}
     */
    get select() {
        return this._options.select
    }
    set select(value) {
        this._options.select = value
    }

    /**
     * opacity setting for dragged item
     * @type {number}
     */
    get dragOpacity() {
        return this._options.dragOpacity
    }
    set dragOpacity(value) {
        this._options.dragOpacity = value
    }

    _leaf(data, level) {
        const leaf = utils.html({ className: `${this.prefixClassName}-leaf` })
        leaf.isLeaf = true
        leaf.data = data
        leaf.content = utils.html({ parent: leaf, className: `${this.prefixClassName}-content` })
        leaf.style.marginLeft = this.indentation + 'px'
        leaf.icon = utils.html({
            parent: leaf.content,
            html: data.expanded ? icons.open : icons.closed,
            className: `${this.prefixClassName}-expand`
        })
        leaf.name = utils.html({ parent: leaf.content, html: data.name, className: `${this.prefixClassName}-name` })
        leaf.name.addEventListener('mousedown', e => this._input._down(e))
        leaf.name.addEventListener('touchstart', e => this._input._down(e))
        for (let child of data.children) {
            const add = this._leaf(child, level + 1)
            add.data.parent = data
            leaf.appendChild(add)
            if (!data.expanded) {
                add.style.display = 'none'
            }
        }
        if (this._getChildren(leaf, true).length === 0) {
            this._hideIcon(leaf)
        }
        clicked(leaf.icon, () => this.toggleExpand(leaf))
        this.emit('render', leaf, this)
        return leaf
    }

    _getChildren(leaf, all) {
        leaf = leaf || this.element
        const children = []
        for (let child of leaf.children) {
            if (child.isLeaf && (all || child.style.display !== 'none')) {
                children.push(child)
            }
        }
        return children
    }

    _hideIcon(leaf) {
        if (leaf.isLeaf) {
            leaf.icon.style.opacity = 0
            leaf.icon.style.cursor = 'unset'
        }
    }

    _showIcon(leaf) {
        if (leaf.isLeaf) {
            leaf.icon.style.opacity = 1
            leaf.icon.style.cursor = this._options.cursorExpand
        }
    }

    /** Expands all leaves */
    expandAll() {
        this._expandChildren(this.element)
    }

    _expandChildren(leaf) {
        for (let child of this._getChildren(leaf, true)) {
            this.expand(child)
            this._expandChildren(child)
        }
    }

    /** Collapses all leaves */
    collapseAll() {
        this._collapseChildren(this)
    }

    _collapseChildren(leaf) {
        for (let child of this._getChildren(leaf, true)) {
            this.collapse(child)
            this._collapseChildren(child)
        }
    }

    /**
     * Toggles a leaf
     * @param {HTMLElement} leaf
     */
    toggleExpand(leaf) {
        if (leaf.icon.style.opacity !== '0') {
            if (leaf.data.expanded) {
                this.collapse(leaf)
            } else {
                this.expand(leaf)
            }
        }
    }

    /**
     * Expands a leaf
     * @param {HTMLElement} leaf
     */
    expand(leaf) {
        if (leaf.isLeaf) {
            const children = this._getChildren(leaf, true)
            if (children.length) {
                for (let child of children) {
                    child.style.display = 'block'
                }
                leaf.data.expanded = true
                leaf.icon.innerHTML = icons.open
                this.emit('expand', leaf, this)
                this.emit('update', leaf, this)
            }
        }
    }

    /**
     * Collapses a leaf
     * @param {HTMLElement} leaf
     */
    collapse(leaf) {
        if (leaf.isLeaf) {
            const children = this._getChildren(leaf, true)
            if (children.length) {
                for (let child of children) {
                    child.style.display = 'none'
                }
                leaf.data.expanded = false
                leaf.icon.innerHTML = icons.closed
                this.emit('collapse', leaf, this)
                this.emit('update', leaf, this)
            }
        }
    }

    /** call this after tree's data has been updated outside of this library */
    update() {
        const scroll = this.element.scrollTop
        utils.removeChildren(this.element)
        for (let leaf of this.element.data.children) {
            const add = this._leaf(leaf, 0)
            add.data.parent = this.element.data
            this.element.appendChild(add)
        }
        this.element.scrollTop = scroll + 'px'
    }

    /**
     * edit the name entry using the data
     * @param {object} data element of leaf
     */
    editData(data) {
        const children = this._getChildren(null, true)
        for (let child of children) {
            if (child.data === data) {
                this.edit(child)
            }
        }
    }

    /**
     * edit the name entry using the created element
     * @param {HTMLElement} leaf
     */
    edit(leaf) {
        this._editing = leaf
        this._editInput = utils.html({ parent: this._editing.name.parentNode, type: 'input', className: `${this.prefixClassName}-name` })
        const computed = window.getComputedStyle(this._editing.name)
        this._editInput.style.boxSizing = 'content-box'
        this._editInput.style.fontFamily = computed.getPropertyValue('font-family')
        this._editInput.style.fontSize = computed.getPropertyValue('font-size')
        this._editInput.value = this._editing.name.innerText
        this._editInput.setSelectionRange(0, this._editInput.value.length)
        this._editInput.focus()
        this._editInput.addEventListener('update', () => {
            this.nameChange(this._editing, this._editInput.value)
            this._holdClose()
        })
        this._editInput.addEventListener('keyup', (e) => {
            if (e.code === 'Escape') {
                this._holdClose()
            }
            if (e.code === 'Enter') {
                this.nameChange(this._editing, this._editInput.value)
                this._holdClose()
            }
        })
        this._editing.name.style.display = 'none'
        this._target = null
    }

    _holdClose() {
        if (this._editing) {
            this._editInput.remove()
            this._editing.name.style.display = 'block'
            this._editing = this._editInput = null
        }
    }

    /**
     * change the name of a leaf
     * @param {HTMLElement} leaf
     * @param {string} name
     */
    nameChange(leaf, name) {
        leaf.data.name = this._input.value
        leaf.name.innerHTML = name
        this.emit('name-change', leaf, this._input.value, this)
        this.emit('update', leaf, this)
    }

    /**
     * Find a leaf based using its data
     * @param {object} leaf
     * @param {HTMLElement} [root=this.element]
     */
    getLeaf(leaf, root = this.element) {
        this.findInTree(root, data => data === leaf)
    }

    /**
     * call the callback function on each node; returns the node if callback === true
     * @param {*} leaf data
     * @param {function} callback
     */
    findInTree(leaf, callback) {
        for (const child of leaf.children) {
            if (callback(child)) {
                return child
            }
            const find = this.findInTree(child, callback)
            if (find) {
                return find
            }
        }
    }

    _getFirstChild(element, all) {
        const children = this._getChildren(element, all)
        if (children.length) {
            return children[0]
        }
    }

    _getLastChild(element, all) {
        const children = this._getChildren(element, all)
        if (children.length) {
            return children[children.length - 1]
        }
    }

    _getParent(element) {
        element = element.parentNode
        while (element.style.display === 'none') {
            element = element.parentNode
        }
        return element
    }

    _addStyles(userStyles) {
        const styles = utils.options(userStyles, styleDefaults)
        let s = `.${this.prefixClassName}-name{`
        for (const key in styles.nameStyles) {
            s += `${key}:${styles.nameStyles[key]};`
        }
        s += `}.${this.prefixClassName}-content{`
        for (const key in styles.contentStyles) {
            s += `${key}:${styles.contentStyles[key]};`
        }
        s += `}.${this.prefixClassName}-indicator{`
        for (const key in styles.indicatorStyles) {
            s += `${key}:${styles.indicatorStyles[key]};`
        }
        s += `}.${this.prefixClassName}-expand{`
        for (const key in styles.expandStyles) {
            s += `${key}:${styles.expandStyles[key]};`
        }
        s += `}.${this.prefixClassName}-select{`
        for (const key in styles.selectStyles) {
            s += `${key}:${styles.selectStyles[key]};`
        }
        s + '}'
        const style = document.createElement('style')
        style.innerHTML = s
        document.head.appendChild(style)
    }
}

/**
 * @typedef {Object} Tree~TreeData
 * @property {TreeData[]} children
 * @property {string} name
 * @property {parent} [parent] if not provided then will traverse tree to find parent
 */

/**
  * trigger when expand is called either through UI interaction or Tree.expand()
  * @event Tree~expand
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */

/**
  * trigger when collapse is called either through UI interaction or Tree.expand()
  * @event Tree~collapse
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */

/**
  * trigger when name is change either through UI interaction or Tree.nameChange()
  * @event Tree~name-change
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {string} name
  * @property {Tree} Tree
  */

/**
  * trigger when a leaf is picked up through UI interaction
  * @event Tree~move-pending
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */

/**
  * trigger when a leaf's location is changed
  * @event Tree~move
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */

/**
  * trigger when a leaf is clicked and not dragged or held
  * @event Tree~clicked
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {UIEvent} event
  * @property {Tree} Tree
  */

/**
  * trigger when a leaf is changed (i.e., moved, name-change)
  * @event Tree~update
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */

/**
  * trigger when a leaf's div is created
  * @event Tree~render
  * @type {object}
  * @property {HTMLElement} tree element
  * @property {Tree} Tree
  */