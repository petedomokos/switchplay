import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Checkbox } from '@material-ui/core';
import { FormControlLabel } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import { Input } from '@material-ui/core';
import Icon from '@material-ui/core/Icon'
import HomeIcon from '@material-ui/icons/Home'
import { makeStyles } from '@material-ui/core/styles'
import { grey10, COLOURS } from './constants';
import TelescopeIcon from './TelescopeIcon';
import StepsIcon from './StepsIcon';

const useStyles = makeStyles(theme => ({
    tableHeaderRoot: {
        position:"absolute",
        //left:props => props.left,
        //top:0,
        width:props => `${props.width - props.padding.left - props.padding.right}px`,
        height:props => `${props.height - props.padding.top - props.padding.bottom}px`,
        padding:props => `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
        display:"flex",
        justifyContent:"space-between",
        pointerEvents:"all",
        background:grey10(8),//"transparent",
    },
    title:{
        width:props => `${props.width - props.timeframe.width - 10}px`,
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
        alignItems:"flex-end"
    },
    timeframeToggleArea:{
        height:props => props.timeframe.toggleArea.height,
        display:"flex",
        justifyContent:"space-between",
        /*
        border:"solid",
        borderColor:"white",
        borderWidth:"thin"
        */
    },
    timeframeDescArea:{
        width:"100%",
        height:props => props.timeframe.descArea.height,
        fontSize:props => `${props.timeframe.descArea.height}px`,
        display:"flex",
        justifyContent:"center",
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

export default function TableHeader({ table, dimns, timeframe, toggleTimeframe }) {
    const { width, height, padding } = dimns;
    const contentsWidth = width - padding.left - padding.right;
    const contentsHeight = height - padding.top - padding.bottom;
    const iconWidth = 27.5;
    const iconHeight = 27.5;
    const vertGap = 10;
    const timeframeDescHeight = contentsHeight - iconHeight - vertGap;
    const timeframeWidth = iconWidth * 2 + 10;

    const activeFill = grey10(1);
    const inactiveFill = grey10(5);
    const deckIconFill = timeframe.key === "singleDeck" ? activeFill : inactiveFill;
    const longTermIconFill = timeframe.key === "longTerm" ? activeFill : inactiveFill;
    const styleProps = {
        width:dimns.width,
        height:dimns.height,
        padding:dimns.padding,
        activeFill,
        timeframe:{
            width:timeframeWidth,
            toggleArea:{ height: iconHeight },
            descArea: { height: timeframeDescHeight },
            icon:{
                width:iconWidth, height:iconHeight, marginLeft:10,
            },

        }
    }
    const classes = useStyles(styleProps);

    return (
        <div className={classes.tableHeaderRoot}>
            <div className={classes.title}>{table.title || "Enter Table Title..."}</div>
            <div className={classes.timeframe}>
                <div className={classes.timeframeToggleArea}>
                    <div className={classes.deckIcon} onClick={toggleTimeframe}><StepsIcon width={iconWidth} height={iconHeight} fill={deckIconFill}/></div>
                    <div className={classes.longTermIcon} onClick={toggleTimeframe}><TelescopeIcon width={iconWidth} height={iconHeight} fill={longTermIconFill}/></div>       
                </div>
                <div className={classes.timeframeDescArea}>{timeframe.label}</div>
            </div>
            {/**<form className={classes.form}>
            </form>*/}
        </div>
    )
}

TableHeader.defaultProps = {
  dimns:{},
  table:{}
}