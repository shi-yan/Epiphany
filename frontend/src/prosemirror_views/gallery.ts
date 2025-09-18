import textSchema from "../textschema.js"
import { Transform, StepMap } from "prosemirror-transform"
import type { Node as PMNode } from "prosemirror-model"
import type { EditorView, NodeView } from "prosemirror-view"
// @ts-ignore - tauri_mock module
import { tauri_dialog, tauri_invoke, tauri_convertFileSrc } from "../tauri_mock"

export default class GalleryView implements NodeView {
    dom: HTMLElement
    node: PMNode
    outerView: EditorView
    getPos: () => number | undefined

    private prev: HTMLAnchorElement
    private next: HTMLAnchorElement
    private plus: HTMLAnchorElement
    private slideIndex: number
    private imageContainer: HTMLDivElement
    private elems: HTMLDivElement[]
    private inputElem: HTMLButtonElement

    constructor(node: PMNode, view: EditorView, getPos: () => number | undefined) {
        this.node = node
        this.outerView = view
        this.getPos = getPos

        this.dom = document.createElement("div")
        this.dom.className = 'gallery-container'

        this.prev = document.createElement('a')
        this.prev.className = 'image-prev'
        this.prev.innerText = "❮"
        this.slideIndex = 0
        this.prev.onclick = () => {
            this.showSlides(this.slideIndex - 1)
        }

        this.next = document.createElement('a')
        this.next.className = 'image-next'
        this.next.innerText = "❯"
        this.next.onclick = () => {
            this.showSlides(this.slideIndex + 1)
        }

        this.plus = document.createElement('a')
        this.plus.className = 'formatter-button'
        this.plus.style.position = 'absolute'
        this.plus.style.margin = '10px'
        this.plus.innerHTML = '<i class="icon icon-image-plus">&#x69;</i>'
        this.plus.onclick = (e) => {
            e.preventDefault()
            this.addNewImage()
        }
        this.imageContainer = document.createElement("div")
        this.imageContainer.className = 'gallery-image-container'

        this.elems = []

        this.inputElem = document.createElement("button")
        this.inputElem.id = "actual-btn"
        this.inputElem.className = 'gallery-upload-button'
        this.inputElem.innerText = "Choose Image File"

        this.inputElem.onclick = (e) => {
            e.preventDefault()
            this.addNewImage()
        }

        this.dom.appendChild(this.imageContainer)
        this.dom.appendChild(this.inputElem)

        this.elems = []

        node.forEach((node: PMNode, _offset: number, index: number) => {
            const div = document.createElement("div")
            div.className = "fade"
            const imgElem = document.createElement("img")
            tauri_invoke('to_asset_absolute_path', { imageFilename: node.attrs.file }).then((filename: string) => {
                console.log("image absolute path", filename)
                tauri_convertFileSrc(filename).then((url: string) => {
                    console.log('url', url)
                    imgElem.src = url
                    imgElem.style.width = '100%'
                    imgElem.style.display = 'none'
                })
            })

            div.appendChild(imgElem)

            const textarea = document.createElement("p")
            textarea.contentEditable = 'true'

            textarea.className = "image-description"
            textarea.setAttribute('data-ph', 'Image description ...')
            textarea.innerText = node.attrs.description || ''

            textarea.onblur = () => {
                if (index < this.node.childCount) {
                    this.node.forEach((node: PMNode, offset: number, eindex: number) => {
                        if (eindex == index) {
                            const innerContent = node.textContent

                            if (textarea.textContent !== innerContent) {
                                setTimeout(() => {
                                    const pos = this.getPos()
                                    if (pos !== undefined) {
                                        const tr = this.outerView.state.tr.setNodeAttribute(pos + 1 + offset, 'description', textarea.textContent || '')
                                        this.outerView.dispatch(tr)
                                    }
                                }, 100)
                            }
                        }
                    })
                }
            }

            div.appendChild(textarea)
            this.imageContainer.appendChild(div)
            this.elems.push(div)
        })

        if (this.elems.length > 0) {
            this.imageContainer.appendChild(this.prev)
            this.imageContainer.appendChild(this.next)
            this.imageContainer.appendChild(this.plus)
            this.showSlides(0)
            this.inputElem.style.display = 'none'
        }
    }

    async addNewImage(): Promise<void> {
        const file = await tauri_dialog().open({
            multiple: false,
            filters: [{
                name: 'Images',
                extensions: ['png', 'jpeg', 'jpg', 'gif', 'webp']
            }],
            title: 'Choose images'
        })

        console.log("selected", file)

        if (file) {
            const newFilename = await tauri_invoke('save_image', { imageFilename: file })
            console.log("new image filename", newFilename)

            const nns: PMNode[] = []
            this.node.forEach((n: PMNode, _offset: number, _index: number) => {
                const nn = textSchema.nodes.image.createAndFill({
                    file: n.attrs.file,
                    description: n.attrs.description
                }, null)
                if (nn) {
                    nns.push(nn)
                }
            })

            const nn = textSchema.nodes.image.createAndFill({
                file: newFilename
            }, null)

            if (nn) {
                nns.push(nn)
            }

            const tr = new Transform(this.node)
            tr.replaceWith(0, this.node.nodeSize - 2, nns)
            const offsetMap = StepMap.offset(this.getPos()! + 1)
            const outerTr = this.outerView.state.tr
            const steps = tr.steps
            for (let j = 0; j < steps.length; j++) {
                const mappedStep = steps[j].map(offsetMap)
                if (mappedStep) {
                    outerTr.step(mappedStep)
                }
            }
            if (outerTr.docChanged) this.outerView.dispatch(outerTr)

            this.inputElem.style.display = 'none'
        }
    }

    createDom(_node: PMNode): void {
        // This method appears to be unused in the original code
    }

    update(node: PMNode): boolean {
        if (node.type != this.node.type) return false
        this.node = node

        while (this.imageContainer.firstChild) {
            this.imageContainer.removeChild(this.imageContainer.firstChild)
        }

        this.elems = []

        node.forEach((childNode: PMNode, _offset: number, index: number) => {
            const div = document.createElement("div")
            div.className = "fade"
            const imgElem = document.createElement("img")
            tauri_invoke('to_asset_absolute_path', { imageFilename: childNode.attrs.file }).then((filename: string) => {
                console.log("image absolute path", filename)
                tauri_convertFileSrc(filename).then((url: string) => {
                    console.log('url', url)
                    imgElem.src = url
                    imgElem.style.width = '100%'
                    imgElem.style.display = 'none'
                })
            })

            div.appendChild(imgElem)

            const textarea = document.createElement("p")
            textarea.contentEditable = 'true'

            textarea.className = "image-description"
            textarea.setAttribute('data-ph', 'Image description ...')
            textarea.innerText = childNode.attrs.description || ''

            textarea.onblur = () => {
                if (index < this.node.childCount) {
                    this.node.forEach((node: PMNode, offset: number, eindex: number) => {
                        if (eindex == index) {
                            const innerContent = node.textContent

                            if (textarea.textContent !== innerContent) {
                                setTimeout(() => {
                                    const pos = this.getPos()
                                    if (pos !== undefined) {
                                        const tr = this.outerView.state.tr.setNodeAttribute(pos + 1 + offset, 'description', textarea.textContent || '')
                                        this.outerView.dispatch(tr)
                                    }
                                }, 100)
                            }
                        }
                    })
                }
            }

            div.appendChild(textarea)
            this.imageContainer.appendChild(div)
            this.elems.push(div)
        })

        if (this.elems.length > 0) {
            this.imageContainer.appendChild(this.prev)
            this.imageContainer.appendChild(this.next)
        }
        this.imageContainer.appendChild(this.plus)
        this.slideIndex = this.elems.length - 1
        this.showSlides(this.slideIndex)
        return true
    }

    showSlides(n: number): void {
        this.slideIndex = n
        if (n > this.elems.length - 1) { this.slideIndex = this.elems.length - 1 }
        if (n < 0) { this.slideIndex = 0 }

        for (let i = 0; i < this.elems.length; i++) {
            this.elems[i].style.display = "none"
        }
        if (this.elems[this.slideIndex]) {
            this.elems[this.slideIndex].style.display = "block"
        }
    }

    selectNode(): void { }
    deselectNode(): void { }

    stopEvent(): boolean {
        return true
    }
}