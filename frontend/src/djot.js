//import sample from './sample.json'
import * as djot from '@djot/djot'
import slugify from 'slugify'
import { createId } from '@paralleldrive/cuid2';

export function prosemirror2djot(doc) {

    console.log(doc)
    if (doc.type === 'doc') {
        let title = "Unnamed Note"

        let compiled = {
            "tag": "doc",
            "references": {

            },
            "footnotes": {},
            "children": [{
                "tag": "section",
                "children": [

                ]
            }]
        }

        for (let i = 0; i < doc.content.length; ++i) {
            const block = doc.content[i];

            if (i == 0 && block.type !== 'title') {
                return null;
            }

            switch (block.type) {
                case 'title':
                    let titleBlock = {
                        "tag": "heading",
                        "level": 1,
                        "children": []
                    };

                    if (block.content.length > 1) {
                        return null;
                    }

                    for (let e = 0; e < block.content.length; ++e) {
                        const textContent = block.content[e];
                        if (textContent.type !== 'text') {
                            return null;
                        }

                        if (textContent.text.length > 0) {
                            title = textContent.text
                        }
                        else {
                            title = textContent.text = "Unnamed Note"
                        }
                        compiled.references[textContent.text] = {
                            "tag": "reference",
                            "label": textContent.text,
                            "destination": "#" + slugify(textContent.text, '_')
                        }
                        titleBlock.children.push({ "tag": "str", "text": textContent.text });
                    }

                    compiled.children[0].children.push(titleBlock);
                    break;
                case 'tags':
                    let tagStr = []
                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const tag = block.content[e];

                            if (tag.type !== 'tag') {
                                return null;
                            }

                            if (tag.content.length != 1) {
                                return null;
                            }

                            if (tag.content[0].type !== 'text') {
                                return null;
                            }

                            tagStr.push(tag.content[0].text);
                        }
                    }

                    const tagsBlock = {
                        "tag": "raw_block",
                        "format": "tags",
                        "text": tagStr.length > 0 ? tagStr.join(', ') : ""
                    };

                    compiled.children[0].children.push(tagsBlock);
                    break;

                case 'paragraph':
                    if (block.content) {
                        let paraBlock = {
                            "tag": "para",
                            "children": [

                            ]
                        };

                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e];
                            switch (inlineContent.type) {
                                case 'text':
                                    paraBlock.children.push({ "tag": "str", "text": inlineContent.text });
                                    break;

                                case 'inline_equation':
                                    paraBlock.children.push({
                                        "tag": "inline_math",
                                        "text": inlineContent.text
                                    });
                                    break;
                                case 'equation_ref':
                                    paraBlock.children.push({
                                        "tag": "url",
                                        "text": "eq:re"
                                    })
                                    break;
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break;
                            }
                        }
                        compiled.children[0].children.push(paraBlock);
                    }
                    break;

                case 'heading':
                    let headingBlock = {
                        "tag": "heading",
                        "level": block.attrs.level,
                        "children": []
                    };
                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e];
                            switch (inlineContent.type) {
                                case 'text':
                                    headingBlock.children.push({ "tag": "str", "text": inlineContent.text });
                                    break;
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break;
                            }
                        }
                    }
                    compiled.children[0].children.push(headingBlock);
                    break;

                case 'equation':
                    let mathBlock = {
                        "tag": "para",
                        "children": [
                            {
                                "tag": "display_math",
                                "text": null,
                                "attributes": {
                                    "id": block.attrs.id
                                }
                            }
                        ]
                    }

                    if (block.content && block.content.length < 2) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e];
                            switch (inlineContent.type) {
                                case 'text':
                                    mathBlock.children[0].text = inlineContent.text;
                                    break;
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break;
                            }
                        }
                    }
                    else {
                        console.log("there should only be one text block under math.")
                        return null;
                    }
                    compiled.children[0].children.push(mathBlock);

                    break;

                case 'code_block':
                    let codeBlock = {
                        "tag": "code_block",
                        "text": null,
                        "lang": codeBlock.attrs.lang
                    }

                    if (block.content && block.content.length < 2) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e];
                            switch (inlineContent.type) {
                                case 'text':
                                    codeBlock.text = inlineContent.text;
                                    break;
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break;
                            }
                        }
                    }
                    else {
                        console.log("there should only be one text block under code_block.")
                        return null;
                    }
                    compiled.children[0].children.push(codeBlock);
                    break;
                case 'video':
                    let videoBlock = {
                        "tag": "raw_block",
                        "format": "video",
                        "text": block.attrs.src.trim()
                    };
                    compiled.children[0].children.push(videoBlock);
                    break;

                case 'twitter':
                    let twitterBlock = {
                        "tag": "raw_block",
                        "format": "twitter",
                        "text": block.attrs.src.trim()
                    }
                    compiled.children[0].children.push(twitterBlock);
                    break;

                case 'gallery':
                    let images = [];

                    if (block.content) {
                        for (let e = 0; e < block.content.length; ++e) {
                            const inlineContent = block.content[e];
                            switch (inlineContent.type) {
                                case 'image':
                                    images.push(inlineContent.attrs);
                                    break;
                                default:
                                    console.log('unimplemented inline block', inlineContent.type)
                                    break;
                            }
                        }
                    }
                    let galleryBlock = {
                        "tag": "raw_block",
                        "format": "gallery",
                        "text": JSON.stringify(images)
                    }
                    compiled.children[0].children.push(galleryBlock);
                    break;


                case 'github':
                    break;
                default:
                    console.log('unhandled block type', block.type)
                    break;
            }
        }
        return { compiled, title };
    }
    return null;
}

function flattenDoc(doc) {
    const blocks = [];

    for (const b of doc.children) {
        if (b.tag === 'section') {
            blocks.push(...flattenDoc(b));
        }
        else {
            blocks.push(b);
        }
    }
    return blocks;
}

export function djot2prosemirror(doc, id, createAt, lastModifiedAt) {
    console.log(doc);

    if (doc.tag === 'doc' && doc.children.length > 0 && doc.children[0].tag === 'section' && doc.children[0].children.length > 0) {

        const blocks = flattenDoc(doc.children[0]);

        let content = [];
        for (let b of blocks) {
            switch (b.tag) {
                case 'heading': {
                    if (b.level == 1) {
                        if (content.length == 0) {
                            if (b.children.length == 1 && b.children[0].tag === 'str') {
                                content.push(
                                    {
                                        type: "title",
                                        attrs: {
                                            createdAt: createAt,
                                            lastModifiedAt: lastModifiedAt,
                                            id: id
                                        },
                                        content: [
                                            {
                                                type: "text",
                                                text: b.children[0].text
                                            }
                                        ]
                                    }
                                )
                            }
                            else {
                                console.error('syntax error, only one text block is expected under the title block.');
                                return null;
                            }
                        }
                        else {
                            console.error('only one title is allowed');
                            return null;
                        }
                    }
                    else if (b.level >= 2) {
                        if (b.children.length == 1 && b.children[0].tag === 'str') {
                            content.push(
                                {
                                    type: "heading",
                                    attrs: {
                                        level: b.level
                                    },
                                    content: [
                                        {
                                            "type": "text",
                                            "text": b.children[0].text
                                        }
                                    ]
                                }
                            )
                        }
                        else {
                            console.error('syntax error, only one text block is expected under a heading block.');
                            return null;
                        }

                    }
                } break;
                case 'raw_block': {
                    switch (b.format) {
                        case 'tags': {
                            const tags = b.text.split(',');
                            const converted = {
                                type: "tags",
                                content: []
                            };

                            for (const t of tags) {
                                let tag = t.trim();

                                if (tag.length > 0) {
                                    converted.content.push(
                                        {
                                            type: "tag",
                                            content: [
                                                {
                                                    type: "text",
                                                    text: tag
                                                }
                                            ]
                                        }
                                    )
                                }
                            }
                            content.push(converted);
                        }
                            break;

                        case 'video': {
                            const converted = {
                                "type": "video",
                                "attrs": {
                                    "src": b.text.trim()
                                }
                            };
                            content.push(converted);
                        }
                            break;

                        case 'twitter': {
                            const converted = {
                                "type": "twitter",
                                "attrs": {
                                    "src": b.text.trim()
                                }
                            };
                            content.push(converted);
                        }
                            break;

                        case 'gallery': {
                            try {
                                const images = JSON.parse(b.text);

                                const converted = {
                                    type: "gallery",
                                    content: [

                                    ]
                                };

                                for (const img of images) {
                                    if (!img.file) {
                                        console.error("no file in image")
                                    }

                                    converted.content.push(
                                        {
                                            type: "image",
                                            attrs: {
                                                file: img.file.trim(),
                                                description: img.description ? img.description : '',
                                                source: img.source ? img.source : ''
                                            }
                                        }
                                    )
                                }
                                content.push(converted);

                            }
                            catch (err) {
                                console.error('parsing gallery block failed', err)
                            }
                        }
                            break

                        default:
                            console.error("unimplemented raw block ", b.format);
                            break;
                    }
                } break;

                case 'para': {
                    if (b.children.length == 1 && b.children[0].tag === 'display_math') {
                        //equation
                        const converted = {
                            type: "equation",
                            content: [
                                {
                                    type: "text",
                                    text: b.children[0].text
                                }
                            ]
                        };
                        content.push(converted);
                    } else {
                        const converted = {
                            type: "paragraph",
                            content: [

                            ]
                        };

                        for (let s of b.children) {
                            if (s.tag === 'str') {
                                converted.content.push({
                                    type: "text",
                                    text: s.text
                                });
                            }
                            else if (s.tag === 'smart_punctuation') {
                                if (converted.content.length > 0) {
                                    // workaround an issue in the parser 
                                    const last = converted.content[converted.content.length - 1];
                                    switch (s.type) {
                                        case 'right_single_quote':
                                            last.text += "'";
                                            break;
                                        case 'left_single_quote':
                                            last.text += "'";
                                            break;
                                    }
                                }
                            }
                            else if (s.tag === 'url') {
                                const match = s.text.match(/^eq:([a-zA-Z0-9]+)$/);
                                if (match && match.length > 1) {
                                    const convertedEquationRef = {
                                        type: "equation_ref",
                                        attrs: {
                                            id: match[1]
                                        }
                                    };
                                    converted.content.push(convertedEquationRef);
                                }
                                else {
                                    console.log("equation reference syntax error ", s.text);
                                }
                            }
                            else if (s.tag === 'inline_math') {
                                const convertedInlineMath = {
                                    type: "inline_equation",
                                    text: s.text
                                }
                                converted.content.push(convertedInlineMath);
                            }
                            else {
                                console.log("unimplemented para type ", s.tag);
                            }
                        }

                        content.push(converted);
                    }
                }
                    break;

                case 'code_block':
                    {
                        const converted = {
                            type: "code_block",
                            attrs: {
                                "lang": b.lang
                            },
                            content: [
                                {
                                    type: "text",
                                    text: b.text
                                }
                            ]
                        };

                        content.push(converted);


                    }
                    break;

                default:
                    console.error("unimplemented block", b)
                    break;

            }
        }
        //trailing line
        if (content.length > 0 && content[content.length - 1].type !== 'paragraph') {
            content.push({
                type: "paragraph",
                content: [
                ]
            })
        }

        return {
            type: "doc",
            content: content
        };
    }
}

//console.log(JSON.stringify(djot));
//const testdoc = djot.parse("hello <eq:math>", { sourcePositions: true });

//const ast = prosemirror2djot(sample)

//console.log('ast', JSON.stringify(ast))

//console.log('html', djot.renderDjot(ast))

//let pm = djot2prosemirror(ast);
//console.log(pm)

//let json = String.raw`{"tag":"doc","references":{"this is a title":{"tag":"reference","label":"this is a title","destination":"#this_is_a_title"}},"footnotes":{},"children":[{"tag":"section","children":[{"tag":"para","children":[{"tag":"str","text":"and reference "},{"tag":"url","text":"https://pandoc.org/lua-filters"},{"tag":"str","text":" and inline? "},{"tag":"inline_math","text":"x^n + y^n = z^n"}]}]}]}`;
//console.log(djot.renderDjot(JSON.parse(json)))



