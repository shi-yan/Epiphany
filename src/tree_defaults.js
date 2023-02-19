export const defaults = {
    move: true,
    select: true,
    indentation: 10,
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
        padding: '0.5em 1em',
        margin: '0.1em',
        'background-color': 'trasparent',
        color:'#b7c3bb',
        'user-select': 'none',
        cursor: 'pointer',
        width: '100px',
        'border-radius': '8px',
    },
    indicatorStyles: {
        background: 'rgb(150,150,255)',
        height: '5px',
        width: '100px',
        padding: '0 1em',
    },
    contentStyles: {
        display: 'flex',
        'align-items': 'center',
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