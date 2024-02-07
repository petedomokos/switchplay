import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'

import Quote from './Quote';
import SVGImage from './SVGImage';

const useStyles = makeStyles(theme => ({
    peopleWithQuotesRoot: {
        //border:"solid",
        margin:"50px auto",
        width:props => `${props.width}px`,
        maxWidth:props => `${props.width}px`,
    },
    title:{
        width:"100%",
        height:props => `${props.titleHeight}px`,
        margin:"auto",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        //border:"solid",
        color:theme.palette.blue,
        fontFamily: "Brush Script MT, cursive",
        fontSize:"36px"
    },
    contents:{
        width:props => `${props.contentsWidth}px`,
        //height:props => `${props.contentsHeight}px`,
        display:"flex",
        flexDirection:props => props.direction,
        justifyContent:"center",
        alignItems:"center",
        flexWrap:"wrap",
        //border:'solid'
    },
    people:{
        width:props => `${props.peopleWidth}px`,
        minWidth:props => `${props.peopleWidth}px`,
        height:props => `${props.peopleHeight}px`,
        //margin:"20px",
        //display:"flex",
        //flexDirection:"column",
        //justifyContent:"center",
        overflow:"hidden",
        //border:"solid",
        //borderColor:"blue",
    },
    quotes:{
        //color:"red",
        [theme.breakpoints.only('sm')]: {
            display:"none"
        },
        //border:"solid",
        //borderColor:"blue",
        width:props => `${props.quotesWidth}px`,
        minWidth:props => `${props.quotesWidth}px`,
        height:props => `${props.contentsHeight}px`,
        paddingLeft:"40px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
    },
    widerQuotes:{
        //color:"blue",
        [theme.breakpoints.down('xs')]: {
            display:"none"
        },
        [theme.breakpoints.up('md')]: {
            display:"none"
        },
        //border:"solid",
        width:"80%",
        minWidth:"300px",
        height:"90%",
        margin:"20px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
    }
}))

const PeopleWithQuotes = ({ title, data, dimns, direction }) =>{
    //for now, static. later can do carousel
    const { key, url, imgWidth, imgHeight, imgTransX=0, imgTransY=0, quotes } = data;

    const { width, minHeight } = dimns;
    const contentsWidth = width;
    const titleHeight = 90;
    const peopleWidth = direction === "column" ? d3.min([500, width * 0.9]) : (width * (width < 500 ? 0.45 : 0.4));
    const imgScale = imgWidth ? peopleWidth / imgWidth : 1;
    const transform = `translate(${imgTransX},${imgTransY}) scale(${imgScale})`;
    const requiredAspectRatio = imgWidth && imgHeight ? imgHeight / imgWidth : 0.666;
    const peopleHeight = peopleWidth * requiredAspectRatio;
    const contentsHeight = d3.max([peopleHeight, minHeight]);

    const quotesWidth = direction === "column" ? width * 0.9 : (width * (width < 500 ? 0.45 : 0.4));

    const imgDimns = { width: peopleWidth, height: peopleHeight }

    const styleProps = { 
        direction,
        width,
        contentsWidth,
        titleHeight,
        contentsHeight,
        peopleWidth,
        peopleHeight,
        quotesWidth
        //contentsHeight: title ? "calc(100% - 40px)" : "100%"
    };
    const classes = useStyles(styleProps);

    return (
        <div className={classes.peopleWithQuotesRoot} >
            {title && <div className={classes.title}>{title}</div>}
            <div className={classes.contents}>
                <div className={classes.people}>
                    <SVGImage image={{ url, transform }} dimns={imgDimns} settings={{ withBorderGradient: true, borderWidth:40 }}
                        styles={{ borderColour:"#FF825C"}} imgKey={key} />
                </div>
                <div className={classes.quotes}>
                        {quotes.map((q,i) => 
                            <Quote data={q} key={`${key}-${i}`} />
                        )}
                </div>
                <div className={classes.widerQuotes}>
                        {quotes.map((q,i) => 
                            <Quote data={q} key={`${key}-${i}`} />
                        )}
                </div>
            </div>
        </div>
    )
}

PeopleWithQuotes.defaultProps = {
    style:{},
    data:{ key:"default", url:"", quotes:[] },
    dimns:{ width: 700, height: 300 },
    direction:"row"
}
  
export default PeopleWithQuotes;
