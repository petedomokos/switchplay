import { grey } from "@material-ui/core/colors";

//export const INIT_CHAIN_STATE = [{op:{id:"home",name:"For Each" }}]
export const INIT_CHAIN_STATE = [{type:"home", of:{}}]

const defaultMargin = { left:10, right:10, top:10, bottom:10 };
const smallMargin = { left:5, right:5, top:5, bottom:5 };
const noMargin = { left:0, right:0, top:0, bottom:0 };
export const DIMNS = {
    margin:defaultMargin,
    smallMargin,
    noMargin,
    svg:{
        width:700,
        minHeight:600
    },
    expBuilder:{
        margin:defaultMargin
    },
    planets:{
        width:100,
    },
    chainWrapper:{
        margin:defaultMargin
    },
    //editor
    editor:{
        width:550,
        height:150, //temp
        children:{
            margin:{ left:5 }
        },
        icons:{
            width:120,
            height:20
        },
        box:{
        },
    },
    //exp chain
    exp:{
        height:200, //temp
        connector:{
            margin:{
                horiz:3
            }
        }
    },
    block:{
        margin: { top: 10, bottom: 10, left: 20, right: 20},
        width:{
            default:150,
            homeSel:150,
            sel:170,
            filter:150,
            agg:100,
            map:100
        },
        children:{
            margin:{ left:0, right:0, top:0, bottom:0 }
        },
        box: { height: 50 },
        count: { height : 30 },
        vis:{
            margins:{
                preIcon:5,
                val:30
            },
            home:{
                margins:{
                    val:50
                }
            },
            get:{
                margins:{

                }
            },
            agg:{
                margins:{

                }
            },
            empty:{
                margins:{

                }
            }
        }
    },
    //btns
    chainButtons:{
        height:30,
    }
}



const grey10 = (i) => ["#FFFFFF", "#E8E8E8","#D3D3D3", "#BEBEBE", "#A8A8A8", "#888888", "#696969", "#505050", "#303030", "#000000"][i-1]

export const COLOURS = {
    svg:{
        bg:grey10(2)
    },
    planet:{
        bg:"aqua",
        name:grey10(8),
        property:grey10(5)
    },
    chainWrapper:{
        btn:{
            bg:"transparent",
            block:grey10(6)
        }
    },
    exp:{
        bg:grey10(2), //!!!
        block:{
            bg:grey10(2) //!!!
        },
        box:{
            bg:{
                active: grey10(1),
                inactive: grey10(2)
            },
            primary:{
                active:"blue",
                inactive:grey10(10)
            },
            secondary:{
                active:"blue",
                inactive:grey10(8)
            },
            pre:{
                active:"blue",
                inactive:grey10(7)
            }
        },
        vis:{
            bg:grey10(1),
            val:grey10(7),
            preIcon:grey10(1),
            count:grey10(5),
            pre:grey10(5)
        },
        connector:grey10(5) //!!!
    },
    editor:{
        bg:grey10(1),
        func:{
            selected:"blue",
            nonSelected:grey10(5)
        },
        instruction:grey10(8),
        optionBtn:{
            selected:{
                fill:"blue",
                text:grey10(1)
            },
            nonSelected:{
                fill:grey10(2),
                text:grey10(6)
            }
        },
        applyBtn:{
            fill:grey10(2),
            text:grey10(8)
        }
    },
    instruction:grey10(9),
}