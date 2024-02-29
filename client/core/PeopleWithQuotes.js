import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'

import Quote from './Quote';
import SVGImage from './SVGImage';
import { PEOPLE_WITH_QUOTES } from './websiteConstants';

const useStyles = makeStyles(theme => ({
    peopleWithQuotesRoot: {
        width:"100vw",
        //height:"2000px",
        display:"flex",
        flexDirection:props => props.direction,
        [theme.breakpoints.down('sm')]: {
            //passing in direction = colummn affects teh boundingClient calc in image, 
            //so we use flex property to switch to a vertical display instead
            display:"block",
        },
        background:"#FFFEFE",
        //border:'solid',
        borderColor:"red",
    },
    peopleContainer:{
        width:"50vw",
        height:props => `${props.aspectRatio * 50}vw`,
        //display:"flex",
        //justifyContent:"center",
        //border:'solid',
        borderColor:"black",
        background:"pink",
        [theme.breakpoints.down('sm')]: {
            width:"100vw",
            height:props => `${props.aspectRatio * 100}vw`,
            borderColor:"blue",
        },
    },
    quotesContainer:{
        width:"50vw",
        height:props => `${props.aspectRatio * 50}vw`,
        //color:"red",
        //border:"solid",
        borderColor:"red",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        [theme.breakpoints.down('sm')]: {
            width:"100vw",
            height:() => "500px",
            padding:"10px 0 50px",
            borderColor:"blue",
        },
    },
    title:{
        width:"100%",
        height:`${PEOPLE_WITH_QUOTES.titleHeightPC.mdUp}%`,
        display:"flex",
        justifyContent:"center",
        alignItems:"flex-end",
        //border:"solid",
        color:"black",//theme.palette.blue,
        fontFamily: "Brush Script MT, cursive",
        fontSize:"36px",
        [theme.breakpoints.down('sm')]: {
            height:`${PEOPLE_WITH_QUOTES.titleHeightPC.smDown}%`
        }
    },
    quotes:{
        //border:"solid",
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
                    <SVGImage image={image} imgKey={key} />
                </div>
                <div className={classes.quotesContainer}>
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
