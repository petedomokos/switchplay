import React, { Fragment, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    quoteRoot: {
        width:"90%",
        margin:"10px 10px",
        background:"transparent",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        padding:"5px",
        //border:"solid"
    },
    label:{
        margin:"5px 0",
        fontSize:"12px",
        //border:"solid",
        borderColor:"red",
        color:theme.palette.blue
    },
    text:{
        fontSize:"16px",
        fontStyle:"italic",
        //border:"solid",
        borderColor:"yellow"
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
