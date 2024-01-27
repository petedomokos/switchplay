import React, { Fragment, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    quoteRoot: {
        width:"90%",
        height:"60px",
        margin:"10px",
        background:"white",
        fontSize:"14px",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        padding:"5px"
    },
}))

const Quote = ({ data }) =>{
    const styleProps = { };
    const classes = useStyles(styleProps);

    //for now, static. later can do carousel
    const { key, text, direction } = data;
    return (
        <div className={classes.quoteRoot} key={`quote-${key}`} >
            {text}
        </div>
    )
}

Quote.defaultProps = {
    style:{},
    data:{ key:"default", quote:"", direction:"left-to-right" },
}
  
export default Quote;
