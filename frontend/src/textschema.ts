import { Schema } from "prosemirror-model"
import type { NodeSpec, MarkSpec, DOMOutputSpec } from "prosemirror-model"
import { addListNodes } from "prosemirror-schema-list"
import { createId } from '@paralleldrive/cuid2'
import OrderedMap from 'orderedmap'

// Node specifications
const baseNodes: Record<string, NodeSpec> = {
  text: {
    group: "inline",
  },
  title: {
    attrs: {
      createdAt: { default: Math.floor(Date.now() / 1000) },
      modifiedAt: { default: Math.floor(Date.now() / 1000) },
      summary: { default: '' },
      published: { default: false },
      id: { default: createId() }
    },
    content: "text*",
    toDOM(): DOMOutputSpec { return ["h1", 0] },
    parseDOM: [{
      tag: "h1",
      getAttrs(dom: HTMLElement) {
        return {
          id: dom.id,
          createdAt: (dom as any).createdAt,
          modifiedAt: (dom as any).modifiedAt,
          summary: (dom as any).summary,
          published: (dom as any).published
        }
      }
    }]
  },
  paragraph: {
    group: "block",
    content: "inline*",
    toDOM(): DOMOutputSpec { return ["p", 0] },
    parseDOM: [{ tag: "p" }]
  },
  image: {
    attrs: {
      file: { default: '' },
      description: { default: '' },
      source: { default: '' }
    },
    toDOM(node): DOMOutputSpec {
      return ["img", {
        "file": node.attrs.file,
        src: "/img/" + node.attrs.file + ".png",
        description: node.attrs.description,
        source: node.attrs.source
      }]
    },
    parseDOM: [{
      tag: "img",
      getAttrs(dom: HTMLElement) {
        return {
          file: (dom as any).file,
          description: (dom as any).description,
          source: (dom as any).source
        }
      }
    }]
  },
  gallery: {
    group: "block",
    content: "image*",
    atom: true,
    toDOM(): DOMOutputSpec { return ["gallery", 0] },
    parseDOM: [{ tag: "gallery" }]
  },
  tag: {
    content: "text*",
    marks: "",
    toDOM(): DOMOutputSpec {
      return ["tag", 0]
    },
    parseDOM: [{ tag: "tag" }]
  },
  tags: {
    content: "tag*",
    marks: "",
    atom: true,
    toDOM(): DOMOutputSpec {
      return ["tags", 0]
    },
    parseDOM: [{ tag: "tags" }]
  },
  equation: {
    attrs: {
      id: { default: "eq" }
    },
    group: "block",
    content: "text*",
    defining: true,
    atom: true,
    toDOM(): DOMOutputSpec {
      return ["equation", 0]
    },
    parseDOM: [{
      tag: "equation",
      getAttrs(dom: HTMLElement) {
        return { id: dom.id }
      }
    }]
  },
  inline_equation: {
    atom: true,
    group: "inline",
    content: "text*",
    inline: true,
    marks: "",
    toDOM(): DOMOutputSpec {
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
    toDOM(node): DOMOutputSpec {
      return ["equation_ref", { "id": node.attrs.id }]
    },
    parseDOM: [{
      tag: "equation_ref",
      getAttrs(dom: HTMLElement) {
        return { id: dom.id }
      }
    }]
  },
  heading: {
    attrs: { level: { default: 1 }, id: { default: createId() } },
    content: "text*",
    group: "block",
    defining: true,
    parseDOM: [
      { tag: "h2", attrs: { level: 2 } },
      { tag: "h3", attrs: { level: 3 } },
      { tag: "h4", attrs: { level: 4 } },
      { tag: "h5", attrs: { level: 5 } },
      { tag: "h6", attrs: { level: 6 } }
    ],
    toDOM(node): DOMOutputSpec { return ["h" + node.attrs.level, 0] }
  },
  video: {
    attrs: { src: {} },
    group: "block",
    defining: true,
    atom: true,
    toDOM(node): DOMOutputSpec {
      return ["video", { "src": node.attrs.src }]
    },
    parseDOM: [{
      tag: "video",
      getAttrs(dom: HTMLElement) {
        return { src: (dom as HTMLVideoElement).src }
      }
    }]
  },
  blockquote: {
    content: "block+",
    group: "block",
    defining: true,
    parseDOM: [{ tag: "blockquote" }],
    toDOM(): DOMOutputSpec { return ["blockquote", 0] }
  },
  code_block: {
    attrs: { lang: { default: 'javascript' } },
    content: "text*",
    marks: "",
    group: "block",
    code: true,
    defining: true,
    isolating: true,
    parseDOM: [{
      tag: "pre",
      preserveWhitespace: "full",
      getAttrs(dom: HTMLElement) {
        return { lang: (dom as any).lang }
      }
    }],
    toDOM(): DOMOutputSpec { return ["pre", ["code", 0]] }
  },
  doc: {
    content: "title tags block+",
    allowGapCursor: true
  }
}

// Add list nodes using prosemirror-schema-list
const nodes = addListNodes(OrderedMap.from(baseNodes), "paragraph (ordered_list | bullet_list)*", "block")

// Mark specifications
const marks: Record<string, MarkSpec> = {
  /**
  A link. Has `href` and `title` attributes. `title`
  defaults to the empty string. Rendered and parsed as an `<a>`
  element.
  */
  link: {
    attrs: {
      href: {},
      title: { default: null }
    },
    inclusive: false,
    parseDOM: [{
      tag: "a[href]",
      getAttrs(dom: HTMLElement) {
        return {
          href: dom.getAttribute("href"),
          title: dom.getAttribute("title")
        }
      }
    }],
    toDOM(node): DOMOutputSpec {
      const { href, title } = node.attrs
      return ["a", { href, title }, 0]
    }
  },
  /**
  An emphasis mark. Rendered as an `<em>` element. Has parse rules
  that also match `<i>` and `font-style: italic`.
  */
  em: {
    parseDOM: [
      { tag: "i" },
      { tag: "em" },
      { style: "font-style=italic" },
      { style: "font-style=normal", clearMark: m => m.type.name == "em" }
    ],
    toDOM(): DOMOutputSpec { return ["em", 0] }
  },

  u: {
    parseDOM: [
      { tag: "u" },
    ],
    toDOM(): DOMOutputSpec { return ["u", 0] }
  },

  del: {
    parseDOM: [
      { tag: "del" },
    ],
    toDOM(): DOMOutputSpec { return ["del", 0] }
  },
  /**
  A strong mark. Rendered as `<strong>`, parse rules also match
  `<b>` and `font-weight: bold`.
  */
  strong: {
    parseDOM: [
      { tag: "strong" },
      // This works around a Google Docs misbehavior where
      // pasted content will be inexplicably wrapped in `<b>`
      // tags with a font-weight normal.
      { tag: "b", getAttrs: (node: HTMLElement) => node.style.fontWeight != "normal" && null },
      { style: "font-weight=400", clearMark: m => m.type.name == "strong" },
      { style: "font-weight", getAttrs: (value: string) => /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null },
    ],
    toDOM(): DOMOutputSpec { return ["strong", 0] }
  },
  /**
  Code font mark. Represented as a `<code>` element.
  */
  code: {
    parseDOM: [{ tag: "code" }],
    toDOM(): DOMOutputSpec { return ["code", 0] }
  },
}

const textSchema = new Schema({
  nodes,
  marks
})

export default textSchema