import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'

import Quote from './Quote';
import SVGImage from './SVGImage';
import Image from "./Image";
import { PEOPLE_WITH_QUOTES } from './websiteConstants';

const useStyles = makeStyles(theme => ({
    peopleWithQuotesRoot: {
        width:"100vw",
        height:"60vw",
        minHeight:"500px",
        maxHeight:"600px",
        display:"flex",
        flexDirection:props => props.direction,
        [theme.breakpoints.down('sm')]: {
            borderColor:"blue",
            height:"1060px",
            minHeight:"1060px",
            maxHeight:"1060px",
            paddingBottom:"50px",
            //passing in direction = colummn affects teh boundingClient calc in image, 
            //so we use flex property to switch to a vertical display instead
            display:"block",

        },
        [theme.breakpoints.down('xs')]: {
            borderColor:"red",
            height:"870px",
            minHeight:"870px",
            maxHeight:"870px", 
        },
        background:"#FFFEFE",
        border:'solid',
    },
    peopleContainer:{
        width:"50vw",
        height:"100%",
        maxHeight:"100%",
        border:'solid',
        [theme.breakpoints.down('sm')]: {
            width:"100vw",
            height:"440px",
        },
        [theme.breakpoints.down('xs')]: {
            height:"300px",
        }
    },
    titleAndQuotesContainer:{
        width:"50vw",
        height:"100%",
        maxHeight:"100%",
        color:"red",
        border:"solid",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        [theme.breakpoints.down('lg')]: {
            padding:0
        },
        [theme.breakpoints.down('sm')]: {
            width:"100vw",
            height:"500px",
            padding:"0",//"10px 0 50px",
            borderColor:"yellow",
        },
    },
    title:{
        width:"100%",
        height:"20%",
        minHeight:"70px",
        paddingTop:"30px",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        border:"solid",
        color:"black",//theme.palette.blue,
        fontFamily: "Brush Script MT, cursive",
        fontSize:"50px",
        [theme.breakpoints.down('lg')]: {
            height:"15%",
            paddingTop:"0px",
            fontSize:"40px",
        },
        [theme.breakpoints.down('md')]: {
            fontSize:"36px",
        },
        [theme.breakpoints.down('sm')]: {
            height:`${PEOPLE_WITH_QUOTES.titleHeightPC.smDown}%`,
            paddingTop:0,
            fontSize:"30px",
        }
    },
    quotes:{
        border:"solid",
        width:"100%",
        height:"75%",
        padding:"30px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"space-around",
        alignItems:"center",
        [theme.breakpoints.down('sm')]: {
            padding:"10px 10px 10px 20px"
        },
    }
}))

const PeopleWithQuotes = ({ title, data, direction }) =>{
    //for now, static. later can do carousel
    const { key, image, quotes } = data;
    const styleProps = { aspectRatio:image.aspectRatio, direction };
    const classes = useStyles(styleProps);

    return (
        <div className={classes.peopleWithQuotesRoot}>
            <div className={classes.peopleContainer}>
                <SVGImage image={image} imgKey={key} contentFit="cover" centreHoriz={true} />
                {/**<Image image={image} imgKey={key} />*/}

            </div>
            <div className={classes.titleAndQuotesContainer}>
                {title && <div className={classes.title}>{title}</div>}
                <div className={classes.quotes}>
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
    direction:"row"
}
  
export default PeopleWithQuotes;