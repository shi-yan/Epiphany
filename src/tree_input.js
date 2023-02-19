import * as utils from './tree_utils'
import { Indicator } from './tree_indicator'

export class Input {
    constructor(tree) {
        this._tree = tree
        this._indicator = new Indicator(tree)
        document.body.addEventListener('mousemove', e => this._move(e))
        document.body.addEventListener('touchmove', e => this._move(e))
        document.body.addEventListener('mouseup', e => this._up(e))
        document.body.addEventListener('touchend', e => this._up(e))
        document.body.addEventListener('mouseleave', e => this._up(e))
    }

    _down(e) {
        this._target = e.currentTarget.parentNode.parentNode
        let alreadySelected = false
        if (this._tree._selection === this._target) {
            alreadySelected = true
        } else {
            if (this._tree._selection) {
                this._tree._selection.content.classList.remove(`${this._tree.prefixClassName}-select`)
            }
            this._tree._selection = this._target
            this._tree._selection.content.classList.add(`${this._tree.prefixClassName}-select`)
        }
        this._isDown = { x: e.pageX, y: e.pageY, alreadySelected }
        const pos = utils.toGlobal(this._target)
        this._offset = { x: e.pageX - pos.x, y: e.pageY - pos.y }
        if (this._tree.holdTime) {
            this._holdTimeout = window.setTimeout(() => this._hold(), this._tree.holdTime)
        }
        e.preventDefault()
        e.stopPropagation()
    }

    _hold() {
        this._holdTimeout = null
        this._tree.edit(this._target)
    }

    _checkThreshold(e) {
        if (!this._tree.move) {
            return false
        } else if (this._moving) {
            return true
        } else {
            if (utils.distance(this._isDown.x, this._isDown.y, e.pageX, e.pageY)) {
                this._moving = true
                this._pickup()
                return true
            } else {
                return false
            }
        }
    }

    _pickup() {
        if (this._holdTimeout) {
            window.clearTimeout(this._holdTimeout)
            this._holdTimeout = null
        }
        this._tree.emit('move-pending', this._target, this._tree)
        const parent = this._target.parentNode
        parent.insertBefore(this._indicator.get(), this._target)
        const pos = utils.toGlobal(this._target)
        document.body.appendChild(this._target)
        this._old = {
            opacity: this._target.style.opacity || 'unset',
            position: this._target.style.position || 'unset',
            boxShadow: this._target.name.style.boxShadow || 'unset'
        }
        this._target.style.position = 'absolute'
        this._target.name.style.boxShadow = '3px 3px 5px rgba(0,0,0,0.25)'
        this._target.style.left = pos.x + 'px'
        this._target.style.top = pos.y + 'px'
        this._target.style.opacity = this._tree.dragOpacity
        if (this._tree._getChildren(parent, true).length === 0) {
            this._tree._hideIcon(parent)
        }
    }

    _findClosest(e, entry) {
        const pos = utils.toGlobal(entry.name)
        if (pos.y + entry.name.offsetHeight / 2 <= e.pageY) {
            if (!this._closest.foundAbove) {
                if (utils.inside(e.pageX, e.pageY, entry.name)) {
                    this._closest.foundAbove = true
                    this._closest.above = entry
                } else {
                    const distance = utils.distancePointElement(e.pageX, e.pageY, entry.name)
                    if (distance < this._closest.distanceAbove) {
                        this._closest.distanceAbove = distance
                        this._closest.above = entry
                    }
                }
            }
        } else if (!this._closest.foundBelow) {
            if (utils.inside(e.pageX, e.pageY, entry.name)) {
                this._closest.foundBelow = true
                this._closest.below = entry
            } else {
                const distance = utils.distancePointElement(e.pageX, e.pageY, entry.name)
                if (distance < this._closest.distanceBelow) {
                    this._closest.distanceBelow = distance
                    this._closest.below = entry
                }
            }
        }
        for (let child of this._tree._getChildren(entry)) {
            this._findClosest(e, child)
        }
    }

    _move(e) {
        if (this._target && this._checkThreshold(e)) {
            const element = this._tree.element
            const indicator = this._indicator.get()
            const indentation = this._tree.indentation
            indicator.remove()
            this._target.style.left = e.pageX - this._offset.x + 'px'
            this._target.style.top = e.pageY - this._offset.y + 'px'
            const x = utils.toGlobal(this._target.name).x
            this._closest = { distanceAbove: Infinity, distanceBelow: Infinity }
            for (let child of this._tree._getChildren()) {
                this._findClosest(e, child)
            }
            if (!this._closest.above && !this._closest.below) {
                element.appendChild(indicator)
            } else if (!this._closest.above)  {
                // null [] leaf
                element.insertBefore(indicator, this._tree._getFirstChild(element))
            } else if (!this._closest.below) {
                // leaf [] null
                let pos = utils.toGlobal(this._closest.above.name)
                if (x > pos.x + indentation) {
                    this._closest.above.insertBefore(indicator, this._tree._getFirstChild(this._closest.above, true))
                } else if (x > pos.x - indentation) {
                    this._closest.above.parentNode.appendChild(indicator)
                } else {
                    let parent = this._closest.above
                    while (parent !== element && x < pos.x) {
                        parent = this._tree._getParent(parent)
                        if (parent !== element) {
                            pos = utils.toGlobal(parent.name)
                        }
                    }
                    parent.appendChild(indicator)
                }
            } else if (this._closest.below.parentNode === this._closest.above) {
                // parent [] child
                this._closest.above.insertBefore(indicator, this._closest.below)
            } else if (this._closest.below.parentNode === this._closest.above.parentNode) {
                // sibling [] sibling
                const pos = utils.toGlobal(this._closest.above.name)
                if (x > pos.x + indentation) {
                    this._closest.above.insertBefore(indicator, this._tree._getLastChild(this._closest.above, true))
                } else {
                    this._closest.above.parentNode.insertBefore(indicator, this._closest.below)
                }
            } else {
                // child [] parent^
                let pos = utils.toGlobal(this._closest.above.name)
                if (x > pos.x + indentation) {
                    this._closest.above.insertBefore(indicator, this._tree._getLastChild(this._closest.above, true))
                } else if (x > pos.x - indentation) {
                    this._closest.above.parentNode.appendChild(indicator)
                } else if (x < utils.toGlobal(this._closest.below.name).x) {
                    this._closest.below.parentNode.insertBefore(indicator, this._closest.below)
                } else {
                    let parent = this._closest.above
                    while (parent.parentNode !== this._closest.below.parentNode && x < pos.x) {
                        parent = this._tree._getParent(parent)
                        pos = utils.toGlobal(parent.name)
                    }
                    parent.appendChild(indicator)
                }
            }
        }
    }

    _up(e) {
        if (this._target) {
            if (!this._moving) {
                if (this._tree.expandOnClick && (!this._tree.select || this._isDown.alreadySelected)) {
                    this._tree.toggleExpand(this._target)
                }
                this._tree.emit('clicked', this._target, e, this._tree)
            } else {
                const indicator = this._indicator.get()
                indicator.parentNode.insertBefore(this._target, indicator)
                this._tree.expand(indicator.parentNode)
                this._tree._showIcon(indicator.parentNode)
                this._target.style.position = this._old.position === 'unset' ? '' : this._old.position
                this._target.name.style.boxShadow = this._old.boxShadow === 'unset' ? '' : this._old.boxShadow
                this._target.style.opacity = this._old.opacity === 'unset' ? '' : this._old.opacity
                indicator.remove()
                this._moveData()
                this._tree.emit('move', this._target, this._tree)
                this._tree.emit('update', this._target, this._tree)
            }
            if (this._holdTimeout) {
                window.clearTimeout(this._holdTimeout)
                this._holdTimeout = null
            }
            this._target = this._moving = null
        }
    }

    _moveData() {
        this._target.data.parent.children.splice(this._target.data.parent.children.indexOf(this._target.data), 1)
        this._target.parentNode.data.children.splice(utils.getChildIndex(this._target.parentNode, this._target), 0, this._target.data)
        this._target.data.parent = this._target.parentNode.data
    }

    _indicatorMarginLeft(value) {
        this._indicator.marginLeft = value
    }
}