import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import { grey10, COLOURS, DIMNS } from './constants';
import TelescopeIcon from './TelescopeIcon';
import StepsIcon from './StepsIcon';

const { CUSTOMER_LOGO_WIDTH, CUSTOMER_LOGO_HEIGHT } = DIMNS;

const useStyles = makeStyles(theme => ({
    tableHeaderRoot: {
        position:"absolute",
        //left:props => props.left,
        //top:0,
        width:props => `${props.width}px`,
        height:props => `${props.height}px`,
        padding:props => `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        display:"flex",
        justifyContent:"space-between",
        pointerEvents:"all",
        background:grey10(8),//"transparent",
        zIndex:1000,
    },
    customerLogoContainer:{
        width:CUSTOMER_LOGO_WIDTH,
        minWidth:CUSTOMER_LOGO_WIDTH,
        maxWidth:CUSTOMER_LOGO_WIDTH,
        height:CUSTOMER_LOGO_HEIGHT,
        alignSelf:"center",
        marginRight:props => `${props.customerLogo.marginRight}px`,
        //border:"solid"
    },
    customerLogo:{
        //transform:`scale(0.05) translate(-10000px, -5000px)`
        transform:props => props.customerLogo.transform || null
    },
    title:{
        width:props => `${props.width - props.timeframe.width - props.customerLogo.marginRight - 10}px`,
        padding:"0px 5px",
        display:"flex",
        alignItems:"center",
        color:grey10(5)

    },
    timeframe:{
        width:props => `${props.timeframe.width}px`,
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-between",
        alignItems:"flex-end",
    },
    timeframeToggleArea:{
        width:"100%",
        height:props => props.timeframe.toggleArea.height,
        display:"flex",
        justifyContent:"space-between",
    },
    timeframeDescArea:{
        width:"100%",
        height:props => props.timeframe.descArea.height,
        fontSize:props => `${props.timeframe.descArea.height}px`,
        display:"flex",
        justifyContent:props => props.timeframe.descJustifyContent,
        alignItems:"flex-end",
        color:props => props.activeFill,
        /*
         border:"solid",
        borderColor:"white",
        borderWidth:"thin",
        */

    },
    deckIcon:{
        width:props => props.timeframe.icon.width,
        height:props => props.timeframe.icon.height,
        cursor:"pointer",
        //border:"solid",
        //borderColor:"yellow"

    },
    longTermIcon:{
        width:props => props.timeframe.icon.width,
        height:props => props.timeframe.icon.height,
        marginLeft:10,
        cursor:"pointer",
        //border:"solid",
        //borderColor:"yellow"
    },
    form:{
    },

}))

export default function TableHeader({ table, dimns, timeframe, nrTimeframeOptions, toggleTimeframe }) {
    const { width, height, padding } = dimns;
    const contentsWidth = width - padding.left - padding.right;
    const contentsHeight = height - padding.top - padding.bottom;
    const iconWidth = 27.5;
    const iconHeight = 27.5;
    const vertGap = 10;
    const timeframeDescHeight = contentsHeight - iconHeight - vertGap;
    const timeframeWidth = iconWidth * nrTimeframeOptions + 30;

    const activeFill = grey10(1);
    const inactiveFill = grey10(5);
    const deckIconFill = timeframe.key === "singleDeck" ? activeFill : inactiveFill;
    const longTermIconFill = timeframe.key === "longTerm" ? activeFill : inactiveFill;
    const styleProps = {
        width:dimns.width,
        height:dimns.height,
        padding:dimns.padding,
        activeFill,
        customerLogo:{
            marginRight:10,
            transform:table.logoTransform
        },
        timeframe:{
            width:timeframeWidth,
            toggleArea:{ height: iconHeight },
            descArea: { height: timeframeDescHeight },
            descJustifyContent:timeframe.key === "singleDeck" ? "flex-start" : "flex-end",
            icon:{
                width:iconWidth, height:iconHeight, marginLeft:10,
            },

        }
    }
    const classes = useStyles(styleProps);

    console.log("table", table)

    return (
        <div className={classes.tableHeaderRoot}>
            <div className={classes.customerLogoContainer}>
                <img className={classes.customerLogo} src={table.photoURL} alt="customer logo"/>
            </div>
            <div className={classes.title}>{table.title || "Enter Table Title..."}</div>
            {nrTimeframeOptions === 2 && 
                <div className={classes.timeframe}>
                    <div className={classes.timeframeToggleArea}>
                        <div className={classes.deckIcon} onClick={toggleTimeframe}><StepsIcon width={iconWidth} height={iconHeight} fill={deckIconFill}/></div>
                        <div className={classes.longTermIcon} onClick={toggleTimeframe}><TelescopeIcon width={iconWidth} height={iconHeight} fill={longTermIconFill}/></div>       
                    </div>
                    <div className={classes.timeframeDescArea}>{timeframe.label}</div>
                </div>
            }
            {/**<form className={classes.form}>
            </form>*/}
        </div>
    )
}

TableHeader.defaultProps = {
  dimns:{},
  table:{},
  nrTimeframeOptions:[]
}