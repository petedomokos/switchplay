import React, { Fragment, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'

import Quote from './Quote';

const useStyles = makeStyles(theme => ({
    peopleWithQuotesRoot: {
        //border:"solid",
        margin:"50px auto",
        width:"85vw",
        maxWidth:"85vw",
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexWrap:"wrap"
    },
    people:{
        width:"40%",
        minWidth:"300px",
        height:"90%",
        margin:"20px",
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        overflow:"hidden",
    },
    quotes:{
        //color:"red",
        [theme.breakpoints.only('sm')]: {
            display:"none"
        },
        //border:"solid",
        width:"40%",
        minWidth:"260px",
        height:"90%",
        margin:"10px",
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

const PeopleWithQuotes = ({ data }) =>{
    const styleProps = { };
    const classes = useStyles(styleProps);

    //for now, static. later can do carousel
    const { key, url, quotes } = data;
    return (
        <div className={classes.peopleWithQuotesRoot} >
           <div className={classes.people}>
               <img src={url} />
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
    )
}

PeopleWithQuotes.defaultProps = {
    style:{},
    data:{ key:"default", url:"", quotes:[] },
}
  
export default PeopleWithQuotes;
