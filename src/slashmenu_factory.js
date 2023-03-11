import EquationManager from './equation_manager'
import { SlashMenuItem, CodeEditorItem, EquationRefItem } from './slashmenuitem';
import textSchema from "./textschema"
import { baseKeymap, setBlockType } from "prosemirror-commands"
import { createId } from '@paralleldrive/cuid2';

//https://pictogrammers.com/library/mdi/

export default function createMenu(equationManager) {
    const color = "#337287";
    return [
        {
            section: 'Headings',
            items: [
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-1</title><path stroke="' + color + '" fill="' + color + '"   d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" /></svg>',
                    'Heading 1',
                    'Used for top-level headings',
                    'Shift+H',
                    (view) => {
                        let h2Command = setBlockType(textSchema.nodes.heading, { level: 2, id: createId() });
                        h2Command(view.state, view.dispatch, view);
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-2</title><path stroke="' + color + '" fill="' + color + '"  d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M21,18H15A2,2 0 0,1 13,16C13,15.47 13.2,15 13.54,14.64L18.41,9.41C18.78,9.05 19,8.55 19,8A2,2 0 0,0 17,6A2,2 0 0,0 15,8H13A4,4 0 0,1 17,4A4,4 0 0,1 21,8C21,9.1 20.55,10.1 19.83,10.83L15,16H21V18Z" /></svg>',
                    'Heading 2',
                    'Used for key sections',
                    'Shift+H',
                    (view) => {
                        let h3Command = setBlockType(textSchema.nodes.heading, { level: 3, id: createId() });
                        h3Command(view.state, view.dispatch, view);
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-3</title><path stroke="' + color + '" fill="' + color + '" d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M15,4H19A2,2 0 0,1 21,6V16A2,2 0 0,1 19,18H15A2,2 0 0,1 13,16V15H15V16H19V12H15V10H19V6H15V7H13V6A2,2 0 0,1 15,4Z" /></svg>',
                    'Heading 3',
                    'Used for subsections',
                    'Shift+H',
                    (view) => {
                        let h4Command = setBlockType(textSchema.nodes.heading, { level: 4, id: createId() });
                        h4Command(view.state, view.dispatch, view);
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-paragraph</title><path stroke="' + color + '" fill="' + color + '" d="M13,4A4,4 0 0,1 17,8A4,4 0 0,1 13,12H11V18H9V4H13M13,10A2,2 0 0,0 15,8A2,2 0 0,0 13,6H11V10H13Z" /></svg>',
                    'Paragraph',
                    'Convert to paragraph',
                    'Shift+H',
                    (view) => {
                        let paraCommand = setBlockType(textSchema.nodes.paragraph);
                        paraCommand(view.state, view.dispatch, view);
                    }),
            ]
        },
        {
            section: 'Lists & blockquote',
            items: [
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-list-bulleted</title><path stroke="' + color + '" fill="' + color + '" d="M7,5H21V7H7V5M7,13V11H21V13H7M4,4.5A1.5,1.5 0 0,1 5.5,6A1.5,1.5 0 0,1 4,7.5A1.5,1.5 0 0,1 2.5,6A1.5,1.5 0 0,1 4,4.5M4,10.5A1.5,1.5 0 0,1 5.5,12A1.5,1.5 0 0,1 4,13.5A1.5,1.5 0 0,1 2.5,12A1.5,1.5 0 0,1 4,10.5M7,19V17H21V19H7M4,16.5A1.5,1.5 0 0,1 5.5,18A1.5,1.5 0 0,1 4,19.5A1.5,1.5 0 0,1 2.5,18A1.5,1.5 0 0,1 4,16.5Z" /></svg>',
                    'Bullet Points',
                    'Add unordered list',
                    'Shift+H',
                    (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.bullet_list.create(null,
                            textSchema.nodes.list_item.create(null, textSchema.nodes.paragraph.create())
                        )));
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-list-numbered</title><path stroke="' + color + '" fill="' + color + '"  d="M7,13V11H21V13H7M7,19V17H21V19H7M7,7V5H21V7H7M3,8V5H2V4H4V8H3M2,17V16H5V20H2V19H4V18.5H3V17.5H4V17H2M4.25,10A0.75,0.75 0 0,1 5,10.75C5,10.95 4.92,11.14 4.79,11.27L3.12,13H5V14H2V13.08L4,11H2V10H4.25Z" /></svg>',
                    'Ordered List',
                    'Add ordered list',
                    'Shift+H',
                    (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.ordered_list.create(null,
                            textSchema.nodes.list_item.create(null, textSchema.nodes.paragraph.create())
                        )));
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-quote-open</title><path stroke="' + color + '" fill="' + color + '" d="M10,7L8,11H11V17H5V11L7,7H10M18,7L16,11H19V17H13V11L15,7H18Z" /></svg>',
                    'Blockquote',
                    'Add blockquote',
                    'Shift+H',
                    (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.blockquote.create(null,
                            textSchema.nodes.paragraph.create()
                        )));
                    }),
            ]
        },
        {
            section: 'Equations',
            items: [
                new EquationRefItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>sigma</title><path stroke="' + color + '" fill="' + color + '" d="M18,6H8.83L14.83,12L8.83,18H18V20H6V18L12,12L6,6V4H18V6Z" /></svg>',
                    'Equation Reference',
                    'Refer to an equation',
                    'Shift+H', equationManager),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>math-integral</title><path stroke="' + color + '" fill="' + color + '" d="M11.5 19.1C11.3 20.2 10.9 21 10.2 21.5C9.5 22 8.6 22.1 7.5 21.9C7.1 21.8 6.3 21.7 6 21.5L6.5 20C6.8 20.1 7.4 20.3 7.7 20.3C8.8 20.5 9.4 20 9.6 18.8L12 5.2C12.2 4 12.7 3.2 13.4 2.6C14.1 2.1 15.1 1.9 16.2 2.1C16.6 2.2 17.4 2.3 18 2.6L17.5 4C17.3 3.9 16.6 3.8 16.3 3.7C15 3.5 14.3 4.1 14 5.6L11.5 19.1Z" /></svg>',
                    'Equation block',
                    'Add display style equation',
                    'Shift+H',
                    (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.equation.create()));
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>division</title><path stroke="' + color + '" fill="' + color + '" d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" /></svg>',
                    'Inline Equation',
                    'Add inline equation',
                    'Shift+H', (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.inline_equation.create()));
                    }),
            ]
        },
        {
            section: 'Media & Embeds',
            items: [
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>image-multiple-outline</title><path  stroke="' + color + '" fill="' + color + '" d="M21,17H7V3H21M21,1H7A2,2 0 0,0 5,3V17A2,2 0 0,0 7,19H21A2,2 0 0,0 23,17V3A2,2 0 0,0 21,1M3,5H1V21A2,2 0 0,0 3,23H19V21H3M15.96,10.29L13.21,13.83L11.25,11.47L8.5,15H19.5L15.96,10.29Z" /></svg>',
                    'Gallery',
                    'Add gallery',
                    'Shift+H', (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.gallery.create()));
                    }),
                /* new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>tooltip-image-outline</title><path  stroke="' + color + '" fill="' + color + '" d="M4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H16L12,22L8,18H4A2,2 0 0,1 2,16V4A2,2 0 0,1 4,2M4,4V16H8.83L12,19.17L15.17,16H20V4H4M7.5,6A1.5,1.5 0 0,1 9,7.5A1.5,1.5 0 0,1 7.5,9A1.5,1.5 0 0,1 6,7.5A1.5,1.5 0 0,1 7.5,6M6,14L11,9L13,11L18,6V14H6Z" /></svg>',
                     'Image Reference',
                     'Refer to an image',
                     'Shift+H'),*/
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>youtube</title><path  stroke="' + color + '" fill="' + color + '"  d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.5,18.78 17.18,18.84C15.88,18.91 14.69,18.94 13.59,18.94L12,19C7.81,19 5.2,18.84 4.17,18.56C3.27,18.31 2.69,17.73 2.44,16.83C2.31,16.36 2.22,15.73 2.16,14.93C2.09,14.13 2.06,13.44 2.06,12.84L2,12C2,9.81 2.16,8.2 2.44,7.17C2.69,6.27 3.27,5.69 4.17,5.44C4.64,5.31 5.5,5.22 6.82,5.16C8.12,5.09 9.31,5.06 10.41,5.06L12,5C16.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z" /></svg>',
                    'YouTube',
                    'Embed YouTube video',
                    'Shift+H', (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.video.create({
                            src:
                                'https://www.youtube.com/watch?v=wJ7yyP4rzP0'
                        })));
                    }),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>twitter</title><path  stroke="' + color + '" fill="' + color + '"  d="M22.46,6C21.69,6.35 20.86,6.58 20,6.69C20.88,6.16 21.56,5.32 21.88,4.31C21.05,4.81 20.13,5.16 19.16,5.36C18.37,4.5 17.26,4 16,4C13.65,4 11.73,5.92 11.73,8.29C11.73,8.63 11.77,8.96 11.84,9.27C8.28,9.09 5.11,7.38 3,4.79C2.63,5.42 2.42,6.16 2.42,6.94C2.42,8.43 3.17,9.75 4.33,10.5C3.62,10.5 2.96,10.3 2.38,10C2.38,10 2.38,10 2.38,10.03C2.38,12.11 3.86,13.85 5.82,14.24C5.46,14.34 5.08,14.39 4.69,14.39C4.42,14.39 4.15,14.36 3.89,14.31C4.43,16 6,17.26 7.89,17.29C6.43,18.45 4.58,19.13 2.56,19.13C2.22,19.13 1.88,19.11 1.54,19.07C3.44,20.29 5.7,21 8.12,21C16,21 20.33,14.46 20.33,8.79C20.33,8.6 20.33,8.42 20.32,8.23C21.16,7.63 21.88,6.87 22.46,6Z" /></svg>',
                    'Tweet',
                    'Embed Tweet',
                    'Shift+H', (view) => {
                        view.dispatch(view.state.tr.replaceSelectionWith(textSchema.nodes.twitter.create({
                            src:
                                'ttt'
                        })));
                    })
            ]
        },
        {
            section: 'Code',
            items: [
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>code-braces</title><path stroke="' + color + '" fill="' + color + '" d="M8,3A2,2 0 0,0 6,5V9A2,2 0 0,1 4,11H3V13H4A2,2 0 0,1 6,15V19A2,2 0 0,0 8,21H10V19H8V14A2,2 0 0,0 6,12A2,2 0 0,0 8,10V5H10V3M16,3A2,2 0 0,1 18,5V9A2,2 0 0,0 20,11H21V13H20A2,2 0 0,0 18,15V19A2,2 0 0,1 16,21H14V19H16V14A2,2 0 0,1 18,12A2,2 0 0,1 16,10V5H14V3H16Z" /></svg>',
                    'Inline Code',
                    'Embed inline code block',
                    'Shift+H'),
                new CodeEditorItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>code-tags</title><path stroke="' + color + '" fill="' + color + '" d="M14.6,16.6L19.2,12L14.6,7.4L16,6L22,12L16,18L14.6,16.6M9.4,16.6L4.8,12L9.4,7.4L8,6L2,12L8,18L9.4,16.6Z" /></svg>',
                    'Code block',
                    'Embed code editor',
                    'Shift+H', null),
                new SlashMenuItem('<svg style="min-width:24px; min-height:24px;"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>github</title><path stroke="' + color + '" fill="' + color + '"  d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" /></svg>',
                    'Github Repo Card',
                    'Add a Github repo card',
                    'Shift+H')
            ]
        }
    ]
}