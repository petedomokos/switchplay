import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';
import { grey10, MAIN_BANNER_MARGIN_VERT } from "./websiteConstants";


const useStyles = makeStyles(theme => ({
    compatibilityInfoRoot:{
        width:"100%",
        maxWidth:"300px",
        background:"transparent",
        //border:"solid",
        padding:"10px 10px 10px 0",
        marginBottom:props => props.className === "sm-down" ? "50px" : 0
    },
    listLabel:{
        height:"20px", 
        margin:"10px 0 0",
        fontSize:"11px", 
        color:grey10(5),
        [theme.breakpoints.down('sm')]: {
          marginBottom:"20px",
          textAlign:"center",
          fontSize:"14px",
          color:grey10(6),
        },
    },
    itemRows:{

    },
    itemRow:{
        display:"flex", 
        justifyContent:"flex-start", 
        flexWrap:"wrap",
        [theme.breakpoints.down('sm')]: {
            justifyContent:"space-around", 
        },

    },
    item:{
        margin:"5px 25px 5px 0", 
        fontSize:"11px", 
        color:grey10(4),
        [theme.breakpoints.down('sm')]: {
          fontSize:"12px",
          color:grey10(5),
          margin:"5px"
        },
    },
    col1Item:{
        width:"80px",
        [theme.breakpoints.down('sm')]: {
          width:"95px"
        }
    },
    col2Item:{
        width:"30px"
    },
    col3Item:{
        width:"40px"
    },
    col4Item:{
        width:"24px"
    }
}))

const CompatibilityInfo = ({ screen, className }) =>{
  const styleProps = { screen, className }
  const classes = useStyles(styleProps);

  return (
    <div className={`${classes.compatibilityInfoRoot} ${className}`}>
        <div className={classes.listLabel} >Works with</div>
          <div className={classes.itemRows} >
            <div className={classes.itemRow} >
              <span className={`${classes.item} ${classes.col1Item}`}>Kitman Labs</span>
              <span className={`${classes.item} ${classes.col2Item}`}>Hudl</span>
              <span className={`${classes.item} ${classes.col3Item}`}>Excel</span>
              <span className={`${classes.item} ${classes.col4Item}`}>PDF</span>
            </div>
            <div className={classes.itemRow} >
              <span className={`${classes.item} ${classes.col1Item}`}>Session Planner</span>
              <span className={`${classes.item} ${classes.col2Item}`}>Word</span>
              <span className={`${classes.item} ${classes.col3Item}`}>GDrive</span>
              <span className={`${classes.item} ${classes.col4Item}`}>SQL</span>
            </div>
          </div>
    </div>
  )
}

CompatibilityInfo.defaultProps = {
  className:""
}
  
export default CompatibilityInfo
