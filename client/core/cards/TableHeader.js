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

const useStyles = makeStyles(theme => ({
    tableHeaderRoot: {
        position:"absolute",
        left:props => props.left,
        top:0,
        width:props => `${props.width - 15 - props.paddingLeft + 7.5}px`,
        height:props => `${props.height - 15}px`,
        padding:`${7.5}px`,
        paddingLeft:props =>props.paddingLeft,
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
        alignItems:"flex-end"
    },
    timeframeToggleArea:{
        height:props => props.timeframe.icon.height,
        display:"flex",
        justifyContent:"flex-end",
        //border:"solid",
        //borderColor:"white",
        //borderWidth:"thin"
    },
    descArea:{
        width:"100%",
        height:props => props.height - props.timeframe.icon.height,
        //border:"solid",
        //borderColor:"white",
        //borderWidth:"thin",
        fontSize:"12px",
        display:"flex",
        justifyContent:"flex-end",
        alignItems:"flex-end",
        paddingRight:"7.5px",
        color:grey10(2)//props => props.timeframe.icon.deck.color,
    },
    toggle:{
        //width:"30px",
        //height:"40px",
        //background:grey10(7)
    },
    deckIcon:{
        width:props => props.timeframe.icon.width,
        height:props => props.timeframe.icon.height,
        padding:0,
        color:props => props.timeframe.icon.deck.color,
        cursor:"pointer"
        //border:"solid",
        //borderColor:"yellow"

    },
    longTermIcon:{
        width:props => props.timeframe.icon.width,
        height:props => props.timeframe.icon.height,
        padding:0,
        color:props => props.timeframe.icon.longTerm.color,
        cursor:"pointer"
        //border:"solid",
        //borderColor:"yellow"
    },
    form:{
    },

}))

export default function TableHeader({ table, dimns, timeframe, toggleTimeframe }) {
  const styleProps = {
    ...dimns,
    timeframe:{
        width:130,
        icon:{
            width:30, height:30,
            deck:{
                color:timeframe.key === "singleDeck" ? grey10(1) : grey10(5)
            },
            longTerm:{ 
                color:timeframe.key === "longTerm" ? grey10(1) : grey10(5)
            }
        },

    }
  }
  const classes = useStyles(styleProps);

  return (
    <div className={classes.tableHeaderRoot}>
        <div className={classes.title}>{table.title || "Enter Table Title..."}</div>
        <div className={classes.timeframe}>
            <div className={classes.timeframeToggleArea}>
                <div className={classes.deckIcon} onClick={toggleTimeframe}><HomeIcon/></div>
                <div className={classes.longTermIcon} onClick={toggleTimeframe}><HomeIcon/></div>       
            </div>
            <div className={classes.descArea}>{timeframe.label}</div>
        </div>
        {/**<form className={classes.form}>
        </form>*/}
    </div>
  )
}

TableHeader.defaultProps = {
  dimns:{}
}