import slugify from 'slugify'

// Minimal djot AST interfaces for our usage (djot package doesn't export these)
interface DjotNode {
    tag: string
    attributes?: Record<string, string>
    children?: DjotNode[]
    text?: string
}

interface Doc extends DjotNode {
    tag: 'doc'
    references: Record<string, DjotReference>
    footnotes: Record<string, unknown>
    children: Section[]
}

interface Section extends DjotNode {
    tag: 'section'
    children: Block[]
}

interface DjotReference extends DjotNode {
    tag: 'reference'
    label: string
    destination: string
}

type Block = Para | Heading | RawBlock | CodeBlock | Section

interface Para extends DjotNode {
    tag: 'para'
    children: Inline[]
}

interface Heading extends DjotNode {
    tag: 'heading'
    level: number
    children: Inline[]
}

interface RawBlock extends DjotNode {
    tag: 'raw_block'
    format: string
    text: string
}

interface CodeBlock extends DjotNode {
    tag: 'code_block'
    text: string
    lang?: string
}

type Inline = Str | InlineMath | DisplayMath | Url | SmartPunctuation

interface Str extends DjotNode {
    tag: 'str'
    text: string
}

interface InlineMath extends DjotNode {
    tag: 'inline_math'
    text: string
}

interface DisplayMath extends DjotNode {
    tag: 'display_math'
    text: string
    attributes: {
        id: string
    }
}

interface Url extends DjotNode {
    tag: 'url'
    text: string
}

interface SmartPunctuation extends DjotNode {
    tag: 'smart_punctuation'
    type: 'right_single_quote' | 'left_single_quote'
    text: string
}

// We use the JSON representation of ProseMirror nodes for serialization/deserialization
// This represents the structure from node.toJSON() and what's expected by Node.fromJSON()
interface ProseMirrorNodeJSON {
    type: string
    attrs?: Record<string, unknown>
    content?: ProseMirrorNodeJSON[]
    text?: string
}

// Data interface for additional metadata
interface NoteData {
    created_at?: number
    modified_at?: number
    published?: boolean
    summary?: string
}

// Image interface for gallery parsing
interface ImageAttrs {
    file: string
    description?: string
    source?: string
}

// Conversion result interface
interface ConversionResult {
    compiled: Doc
    title: string
}

export function prosemirror2djot(doc: ProseMirrorNodeJSON, createdAt: number, modifiedAt: number): ConversionResult | null {
    console.log(doc)
    if (doc.type === 'doc') {
        let title = "Unnamed Note"

        const compiled: Doc = {
            "tag": "doc",
            "references": {},
            "footnotes": {},
            "children": [{
                "tag": "section",
                "children": []
            } as Section]
        }

        if (!doc.content) {
            return { compiled, title }
        }

        for (let i = 0; i < doc.content.length; ++i) {
            const block = doc.content[i]

            if (i == 0 && block.type !== 'title') {
                return null
            }

            switch (block.type) {
                case 'title': {
                    const djotTitleBlock: Heading = {
                        "tag": "heading",
                        "level": 1,
                        "children": [],
                        "attributes": {
                            "createdAt": createdAt + '',
                            "modifiedAt": modifiedAt + '',
                            "summary": block.attrs?.summary as string,
                            "published": block.attrs?.published + ''
                        }
                    }

                    if (!block.content || block.content.length > 1) {
                        return null
                    }

                    for (let e = 0; e < block.content.length; ++e) {
                        const textContent = block.content[e]
                        if (textContent.type !== 'text') {
                            return null
                        }

                        if (textContent.text && textContent.text.length > 0) {
                            title = textContent.text
                        } else {
                            title = "Unnamed Note"
                        }
                        compiled.references[textContent.text || title] = {
                            "tag": "reference",
                            "label": textContent.text || title,
                            "destination": "#" + slugify(textContent.text || title, '_')
                        }
                        djotTitleBlock.children.push({ "tag": "str", "text": textContent.text || title } as Str)
                    }

                    compiled.children[0].children.push(djotTitleBlock)
                    break
                }
                case 'tags': {
                    const tagStr: string[] = []
                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const tag = block.content[e]

                            if (tag.type !== 'tag') {
                                return null
                            }

                            if (!tag.content || tag.content.length != 1) {
                                return null
                            }

                            if (tag.content[0].type !== 'text') {
                                return null
                            }

                            tagStr.push(tag.content[0].text || '')
                        }
                    }

                    const djotTagsBlock: RawBlock = {
                        "tag": "raw_block",
                        "format": "tags",
                        "text": tagStr.length > 0 ? tagStr.join(', ') : ""
                    }

                    compiled.children[0].children.push(djotTagsBlock)
                    break
                }

                case 'paragraph': {
                    if (block.content) {
                        const paraBlock: Para = {
                            "tag": "para",
                            "children": []
                        }

                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e]
                            switch (inlineContent.type) {
                                case 'text':
                                    paraBlock.children.push({ "tag": "str", "text": inlineContent.text || '' } as Str)
                                    break

                                case 'inline_equation': {
                                    paraBlock.children.push({
                                        "tag": "inline_math",
                                        "text": inlineContent.text || ''
                                    } as InlineMath)
                                    break
                                }
                                case 'equation_ref': {
                                    paraBlock.children.push({
                                        "tag": "url",
                                        "text": "eq:" + inlineContent.attrs?.id
                                    } as Url)
                                    break
                                }
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break
                            }
                        }
                        compiled.children[0].children.push(paraBlock)
                    }
                    break
                }

                case 'heading': {
                    const djotHeadingBlock: Heading = {
                        "tag": "heading",
                        "level": block.attrs?.level as number,
                        "children": []
                    }
                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e]
                            switch (inlineContent.type) {
                                case 'text':
                                    djotHeadingBlock.children.push({ "tag": "str", "text": inlineContent.text || '' } as Str)
                                    break
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break
                            }
                        }
                    }
                    compiled.children[0].children.push(djotHeadingBlock)
                    break
                }

                case 'equation': {
                    const mathBlock: Para = {
                        "tag": "para",
                        "children": [
                            {
                                "tag": "display_math",
                                "text": '',
                                "attributes": {
                                    "id": block.attrs?.id as string
                                }
                            } as DisplayMath
                        ]
                    }

                    if (block.content && block.content.length < 2) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e]
                            switch (inlineContent.type) {
                                case 'text':
                                    (mathBlock.children[0] as DisplayMath).text = inlineContent.text || ''
                                    break
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break
                            }
                        }
                    } else {
                        console.log("there should only be one text block under math.")
                        return null
                    }
                    compiled.children[0].children.push(mathBlock)
                    break
                }

                case 'code_block': {
                    const codeBlock: CodeBlock = {
                        "tag": "code_block",
                        "text": '',
                        "lang": block.attrs?.lang as string
                    }

                    if (block.content && block.content.length < 2) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e]
                            switch (inlineContent.type) {
                                case 'text':
                                    codeBlock.text = inlineContent.text || ''
                                    break
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break
                            }
                        }
                    } else {
                        console.log("there should only be one text block under code_block.")
                        return null
                    }
                    compiled.children[0].children.push(codeBlock)
                    break
                }
                case 'video': {
                    const djotVideoBlock: RawBlock = {
                        "tag": "raw_block",
                        "format": "video",
                        "text": (block.attrs?.src as string).trim()
                    }
                    compiled.children[0].children.push(djotVideoBlock)
                    break
                }

                case 'gallery': {
                    const images: ImageAttrs[] = []

                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e]
                            switch (inlineContent.type) {
                                case 'image': {
                                    images.push(inlineContent.attrs as unknown as ImageAttrs)
                                    break
                                }
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break
                            }
                        }
                    }
                    const djotGalleryBlock: RawBlock = {
                        "tag": "raw_block",
                        "format": "gallery",
                        "text": JSON.stringify(images)
                    }
                    compiled.children[0].children.push(djotGalleryBlock)
                    break
                }

                case 'github':
                    break
                default:
                    console.log('unhandled block type', block.type)
                    break
            }
        }
        return { compiled, title }
    }
    return null
}

function flattenDoc(doc: Section): Block[] {
    const blocks: Block[] = []

    for (const b of doc.children) {
        if (b.tag === 'section') {
            blocks.push(...flattenDoc(b as Section))
        } else {
            blocks.push(b)
        }
    }
    return blocks
}

export function djot2prosemirror(doc: Doc, id: string, data: NoteData): ProseMirrorNodeJSON | null {
    console.log(JSON.stringify(doc))

    if (doc.tag === 'doc' && doc.children.length > 0
        && doc.children[0].tag === 'section' && doc.children[0].children.length > 0) {

        if (doc.children[0].attributes) {
            const attributes = doc.children[0].attributes

            if (attributes.createdAt) {
                data.created_at = parseInt(attributes.createdAt)
            }

            if (attributes.modifiedAt) {
                data.modified_at = parseInt(attributes.modifiedAt)
            }

            if (attributes.published) {
                data.published = (attributes.published === 'true')
            }

            if (attributes.summary) {
                data.summary = attributes.summary
            }
        }

        const blocks = flattenDoc(doc.children[0] as Section)

        const content: ProseMirrorNodeJSON[] = []
        for (const b of blocks) {
            switch (b.tag) {
                case 'heading': {
                    const headingNode = b as Heading
                    if (headingNode.level == 1) {
                        if (content.length == 0) {
                            if (headingNode.children.length == 1 && headingNode.children[0].tag === 'str') {
                                content.push({
                                    type: "title",
                                    attrs: {
                                        createdAt: data.created_at || 0,
                                        modifiedAt: data.modified_at || 0,
                                        summary: data.summary,
                                        published: data.published || false,
                                        id: id
                                    },
                                    content: [{
                                        type: "text",
                                        text: (headingNode.children[0] as Str).text
                                    }]
                                })
                            } else {
                                console.error('syntax error, only one text block is expected under the title block.')
                                return null
                            }
                        } else {
                            console.error('only one title is allowed')
                            return null
                        }
                    } else if (headingNode.level >= 2) {
                        if (headingNode.children.length == 1 && headingNode.children[0].tag === 'str') {
                            content.push({
                                type: "heading",
                                attrs: {
                                    level: headingNode.level
                                },
                                content: [{
                                    "type": "text",
                                    "text": (headingNode.children[0] as Str).text
                                }]
                            })
                        } else {
                            console.error('syntax error, only one text block is expected under a heading block.')
                            return null
                        }
                    }
                    break
                }
                case 'raw_block': {
                    const rawBlock = b as RawBlock
                    switch (rawBlock.format) {
                        case 'tags': {
                            const tags = rawBlock.text.split(',')
                            const converted: ProseMirrorNodeJSON = {
                                type: "tags",
                                content: []
                            }

                            for (const t of tags) {
                                const tag = t.trim()

                                if (tag.length > 0) {
                                    converted.content!.push({
                                        type: "tag",
                                        content: [{
                                            type: "text",
                                            text: tag
                                        }]
                                    })
                                }
                            }
                            content.push(converted)
                            break
                        }

                        case 'video': {
                            const converted: ProseMirrorNodeJSON = {
                                "type": "video",
                                "attrs": {
                                    "src": rawBlock.text.trim()
                                }
                            }
                            content.push(converted)
                            break
                        }

                        case 'gallery': {
                            try {
                                const images: ImageAttrs[] = JSON.parse(rawBlock.text)

                                const converted: ProseMirrorNodeJSON = {
                                    type: "gallery",
                                    content: []
                                }

                                for (const img of images) {
                                    if (!img.file) {
                                        console.error("no file in image")
                                    }

                                    converted.content!.push({
                                        type: "image",
                                        attrs: {
                                            file: img.file.trim(),
                                            description: img.description ? img.description : '',
                                            source: img.source ? img.source : ''
                                        }
                                    })
                                }
                                content.push(converted)
                            } catch (err) {
                                console.error('parsing gallery block failed', err)
                            }
                            break
                        }

                        default:
                            console.error("unimplemented raw block ", rawBlock.format)
                            break
                    }
                    break
                }

                case 'para': {
                    const paraNode = b as Para
                    if (paraNode.children.length == 1 && paraNode.children[0].tag === 'display_math') {
                        const displayMath = paraNode.children[0] as DisplayMath
                        const converted: ProseMirrorNodeJSON = {
                            type: "equation",
                            attrs: { id: displayMath.attributes?.id || '' },
                            content: [{
                                type: "text",
                                text: displayMath.text || ''
                            }]
                        }
                        content.push(converted)
                    } else {
                        const converted: ProseMirrorNodeJSON = {
                            type: "paragraph",
                            content: []
                        }

                        for (const s of paraNode.children) {
                            if (s.tag === 'str') {
                                const strNode = s as Str
                                converted.content!.push({
                                    type: "text",
                                    text: strNode.text
                                })
                            } else if (s.tag === 'smart_punctuation') {
                                const smartPunct = s as SmartPunctuation
                                if (converted.content!.length > 0) {
                                    // workaround an issue in the parser
                                    const last = converted.content![converted.content!.length - 1]
                                    switch (smartPunct.type) {
                                        case 'right_single_quote':
                                            last.text! += "'"
                                            break
                                        case 'left_single_quote':
                                            last.text! += "'"
                                            break
                                    }
                                }
                            } else if (s.tag === 'url') {
                                const urlNode = s as Url
                                const match = urlNode.text.match(/^eq:([a-zA-Z0-9]+)$/)

                                if (match && match.length > 1) {
                                    console.log("matched equation reference", match)

                                    const convertedEquationRef: ProseMirrorNodeJSON = {
                                        type: "equation_ref",
                                        attrs: {
                                            id: match[1]
                                        }
                                    }
                                    converted.content!.push(convertedEquationRef)
                                } else {
                                    console.log("equation reference syntax error ", urlNode.text)
                                }
                            } else if (s.tag === 'inline_math') {
                                const inlineMath = s as InlineMath
                                const convertedInlineMath: ProseMirrorNodeJSON = {
                                    type: "inline_equation",
                                    text: inlineMath.text
                                }
                                converted.content!.push(convertedInlineMath)
                            } else {
                                console.log("unimplemented para type ", s.tag)
                            }
                        }

                        content.push(converted)
                    }
                    break
                }

                case 'code_block': {
                    const codeBlockNode = b as CodeBlock
                    const converted: ProseMirrorNodeJSON = {
                        type: "code_block",
                        attrs: {
                            "lang": codeBlockNode.lang || ''
                        },
                        content: [{
                            type: "text",
                            text: codeBlockNode.text || ''
                        }]
                    }

                    content.push(converted)
                    break
                }

                default:
                    console.error("unimplemented block", b)
                    break
            }
        }

        // trailing line
        if (content.length > 0 && content[content.length - 1].type !== 'paragraph') {
            content.push({
                type: "paragraph",
                content: []
            })
        }

        return {
            type: "doc",
            content: content
        }
    } else {
        console.log("something wrong")
        return null
    }
}