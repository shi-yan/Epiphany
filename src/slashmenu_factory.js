import EquationManager from './equation_manager'
import SlashMenuItem from './slashmenuitem'


export default function createMenu(equationManager) {
    const color = "#337287";
    return [
        {
            section: 'Headings',
            items: [
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-1</title><path stroke="'+color+'" fill="'+color+'" d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" /></svg>',
                'Heading 2',
                'Used for key sections',
                'Shift+H'),
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-1</title><path stroke="'+color+'" fill="'+color+'" d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" /></svg>',
                'Heading 2',
                'Used for key sections',
                'Shift+H'),
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>format-header-1</title><path stroke="'+color+'" fill="'+color+'" d="M3,4H5V10H9V4H11V18H9V12H5V18H3V4M14,18V16H16V6.31L13.5,7.75V5.44L16,4H18V16H20V18H14Z" /></svg>',
                'Heading 2',
                'Used for key sections',
                'Shift+H'),
            ]
        },
        {
            section: 'Equations',
            items: [
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>sigma</title><path stroke="'+color+'" fill="'+color+'" d="M18,6H8.83L14.83,12L8.83,18H18V20H6V18L12,12L6,6V4H18V6Z" /></svg>',
                'Equation Reference',
                'Refer to an equation',
                'Shift+H'),
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>math-integral</title><path stroke="'+color+'" fill="'+color+'" d="M11.5 19.1C11.3 20.2 10.9 21 10.2 21.5C9.5 22 8.6 22.1 7.5 21.9C7.1 21.8 6.3 21.7 6 21.5L6.5 20C6.8 20.1 7.4 20.3 7.7 20.3C8.8 20.5 9.4 20 9.6 18.8L12 5.2C12.2 4 12.7 3.2 13.4 2.6C14.1 2.1 15.1 1.9 16.2 2.1C16.6 2.2 17.4 2.3 18 2.6L17.5 4C17.3 3.9 16.6 3.8 16.3 3.7C15 3.5 14.3 4.1 14 5.6L11.5 19.1Z" /></svg>',
                'Equation block',
                'Add Display style equation',
                'Shift+H'),
                new SlashMenuItem('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>division</title><path stroke="'+color+'" fill="'+color+'" d="M19,13H5V11H19V13M12,5A2,2 0 0,1 14,7A2,2 0 0,1 12,9A2,2 0 0,1 10,7A2,2 0 0,1 12,5M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" /></svg>',
                'Inline Equation',
                'Add inline equation',
                'Shift+H'),
            ]
        }
    ]
}