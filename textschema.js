import { Schema, DOMParser } from "prosemirror-model"

const textSchema = new Schema({
  nodes: {
    text: {
      group: "inline",
    },
    title: {
      content: "inline*",
      toDOM() { return ["h1", 0] },
      parseDOM: [{ tag: "h1" }]
    },
    paragraph: {
      group: "block",
      content: "inline*",
      toDOM() { return ["p", 0] },
      parseDOM: [{ tag: "p" }]
    },
    image: {
      attrs: {
        file: { default: '' },
        description: { default: '' },
        source: { default: '' }
      },
      toDOM() {
        return ["img", {
          "file": node.attrs.file,
          src: "/img/" + node.attrs.file + ".png",
          description: node.attrs.description,
          source: node.attrs.source
        }]
      },
      parseDOM: [{
        tag: "img", getAttrs(dom) {
          return {
            file: dom.file,
            description: dom.description, source: dom.source
          }
        }
      }]
    },
    gallery: {
      group: "block",
      content: "image*",
      atom: true,
      toDOM() { return ["gallery", 0] },
      parseDOM: [{ tag: "gallery" }]
    },
    tag: {
      content: "text*",
      marks: "",
      toDOM(node) {
        return ["tag", 0]
      },

      parseDOM: [{ tag: "tag" }]
    },
    tags: {
      content: "tag*",
      marks: "",
      atom: true,
      toDOM(node) {
        return ["tags", 0]
      },
      parseDOM: [{ tag: "tags" }]
    },
    equation: {
      group: "block",
      content: "text*",
      defining:true,
      atom: true,
      toDOM(node) {
        return [{tag:"equation"},0]
      },
      parseDOM: [{ tag: "equation"  }]
    },
    inline_equation: {
      atom: true,
      group: "inline",
      content: "text*",
      inline: true,
      marks: "",
      toDOM(node) {
        return ["inline_equation", 0]
      },
      parseDOM: [{ tag: "inline_equation" }]
    },
    equation_ref: {
      attrs: { id: {} },
      group: "inline",
      inline: true,
      atom: true,
      marks: "",
      toDOM(node) {
        return ["equation_ref", { "id": node.attrs.id }]
      },
      parseDOM: [{ tag: "equation_ref", getAttrs(dom) { return { id: dom.id } } }]
    },
    doc: {
      content: "title tags block+",
      allowGapCursor: true
    }
  }
})

export default textSchema;