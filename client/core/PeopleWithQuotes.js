import React, { Fragment, useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'

import Quote from './Quote';

const useStyles = makeStyles(theme => ({
    peopleWithQuotesRoot: {
        margin:"50px 0px",
        width:"100%",
        height:"300px",
        display:"flex",
        justifyContent:"center",
        alignItems:"center"
    },
    people:{
        width:"40%",
        height:"90%",
        margin:"20px",
        overflow:"hidden"
    },
    quotes:{
        width:"40%",
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
        </div>
    )
}

PeopleWithQuotes.defaultProps = {
    style:{},
    data:{ key:"default", url:"", quotes:[] },
}
  
export default PeopleWithQuotes;
