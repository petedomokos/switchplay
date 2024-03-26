import React, { Fragment, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import { grey10 } from './cards/colourThemes';

const useStyles = makeStyles(theme => ({
    quoteRoot: {
        width:"90%",
        margin:"10px 10px",
        background:"transparent",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        padding:"5px",
        border:"solid"
    },
    label:{
        margin:"5px 0",
        fontSize:"14px",
        [theme.breakpoints.only('lg')]: {
            fontSize:"12px"
        },
        [theme.breakpoints.down('md')]: {
            fontSize:"11px",
        },
        [theme.breakpoints.down('sm')]: {
            fontSize:"11px",
        },
        border:"solid",
        borderColor:"red",
        color:theme.palette.blue
    },
    text:{
        fontSize:"20px",
        color:grey10(9),
        [theme.breakpoints.only('lg')]: {
            fontSize:"16px",
            borderColor:"red"
        },
        [theme.breakpoints.down('md')]: {
            fontSize:"14px",
            borderColor:"yellow"
        },
        fontStyle:"italic",
        border:"solid",
    }
}))

const Quote = ({ data }) =>{
    const styleProps = { };
    const classes = useStyles(styleProps);

    //for now, static. later can do carousel
    const { key, label, text, direction } = data;
    return (
        <div className={classes.quoteRoot} key={`quote-${key}`} >
            {label && <div className={classes.label}>{label}</div>}
            <div className={classes.text}>{text}</div>
        </div>
    )
}

Quote.defaultProps = {
    style:{},
    data:{ key:"default", quote:"", direction:"left-to-right" },
}
  
export default Quote;
