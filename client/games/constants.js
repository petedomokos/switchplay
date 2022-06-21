const defaultMargin = { left:10, right:10, top:10, bottom:10 };
const smallMargin = { left:5, right:5, top:5, bottom:5 };
const noMargin = { left:0, right:0, top:0, bottom:0 };
export const DIMNS = {
    margin:defaultMargin,
    smallMargin,
    noMargin,
    svg:{
        width:850,
        minHeight:600
    }
}

export const NR_CELL_ROWS = 4;
export const NR_CELL_COLOURS = 5;


const grey10 = (i) => ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1]

export const COLOURS = {
    svg:{
        bg:grey10(2)
    },
    grid:{
        cell:{
            odd:grey10(3),
            even:grey10(4)
        }
    }
}