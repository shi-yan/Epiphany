export const defaults = {
    move: true,
    select: true,
    indentation: 8,
    threshold: 10,
    holdTime: 1000,
    expandOnClick: true,
    dragOpacity: 0.75,
    prefixClassName: 'yy-tree',
    cursorName: 'grab -webkit-grab pointer',
    cursorExpand: 'pointer'
}

export const styleDefaults = {
    nameStyles: {
        padding: '0.3em 0.5em',
        margin: '0.1em',
        'background-color': 'trasparent',
        color:'#b7c3bb',
        'user-select': 'none',
        cursor: 'pointer',
        'border-radius': '4px',
        'font-weight': '800',
        'font-size': '20px',
        'font-family': "'Roboto', sans-serif",
        'white-space': 'nowrap',
        'overflow-x':'hidden'

    },
    indicatorStyles: {
        background: '#f7811f',
        height: '3px',
        width: '100px',
        padding: '0 1em',
    },
    contentStyles: {
        display: 'flex',
        'align-items': 'center',
        'margin-right': '6px',
        'padding-left': '8px'
    },
    expandStyles: {
        width: '15px',
        height: '15px',
        // cursor: 'pointer',
    },
    selectStyles: {
        background: '#364241',
        'border-radius': '8px',
    },
}