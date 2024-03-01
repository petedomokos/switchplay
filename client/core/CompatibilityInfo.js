import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';
import { grey10, MAIN_BANNER_MARGIN_VERT, NAVBAR_HEIGHT } from "./websiteConstants";


const useStyles = makeStyles(theme => ({
    compatibilityInfoRoot:{
        width:"700px",
        [theme.breakpoints.down('sm')]: {
          width:"100%",
          maxWidth:"300px",
        },
        height:`${NAVBAR_HEIGHT}px`,
        background:"transparent",
        //border:"solid",
        padding:"0",
        marginBottom:props => props.className === "sm-down" ? "50px" : 0
    },
    listLabel:{
        height:"20px", 
        margin:"0",
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
      //border:"solid",
    },
    itemRow:{
        //border:"solid",
        borderColor:"blue",
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

const singleRowItems = ["Kitman labs", "Session Planner", "Hudl", "Excel", "Word", "PDF", "GDrive", "SQL"]
const row1Items = ["Kitman labs", "Hudl", "Excel", "PDF"]
const row2Items = ["Session Planner", "Hudl", "Word", "GDrive", "SQL"]
const rows = [row1Items, row2Items]
const getColClassname = i => `col${i + 1}Item`;

const CompatibilityInfo = ({ screen, className }) =>{
  const styleProps = { screen, className }
  const classes = useStyles(styleProps);

  return (
    <div className={`${classes.compatibilityInfoRoot} ${className}`}>
        <div className={classes.listLabel} >Works with</div>
          <div className={classes.itemRows} >
            <div className="md-up">
                <div className={classes.itemRow} >
                  {singleRowItems.map((it,i) =>
                    <span className={classes.item}>{it}</span>
                  )}
                </div>
            </div>
            <div className="sm-down">
              {rows.map(rowItems =>
                <div className={classes.itemRow} >
                  {rowItems.map((it,i) =>
                    <span className={`${classes.item} ${classes[getColClassname(i)]}`}>{it}</span>
                  )}
                </div>
              )}
            </div>
          </div>
    </div>
  )
}

CompatibilityInfo.defaultProps = {
  className:""
}
  
export default CompatibilityInfo
