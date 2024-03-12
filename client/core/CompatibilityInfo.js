import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';
import { grey10, MAIN_BANNER_MARGIN_VERT, NAVBAR_HEIGHT } from "./websiteConstants";


const useStyles = makeStyles(theme => ({
    compatibilityInfoRoot:{
      display:"flex",
      width:"700px",
      height:`${NAVBAR_HEIGHT}px`,
      [theme.breakpoints.down('sm')]: {
        width:"90%",
        maxWidth:"350px",
        height:`${NAVBAR_HEIGHT + 25}px`,
        margin:"30px auto 50px"

      },
      background:"transparent",
      //border:"solid",
    },
    listLabel:{
      height:"20px", 
      margin:"5px 25px 5px 0", 
      fontSize:"14px", 
      color:grey10(7),
      [theme.breakpoints.down('sm')]: {
        marginBottom:"20px",
        textAlign:"center",
        fontSize:"14px",
        color:grey10(7),
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
      fontSize:"14px", 
      color:grey10(5),
      [theme.breakpoints.down('sm')]: {
        fontSize:"14px",
        color:grey10(5),
        margin:"5px"
      },
    },
    col1Item:{
      width:"80px",
      [theme.breakpoints.down('sm')]: {
        width:"110px"
      }
    },
    col2Item:{
      width:"30px",
    },
    col3Item:{
      width:"40px"
    },
    col4Item:{
      width:"24px"
    }
}))

const singleRowItems = ["Kitman Labs", "Session Planner", "Hudl", "Excel", "Word", "PDF", "GDrive", "SQL"]
const row1Items = ["Kitman Labs", "Hudl", "Excel", "PDF"]
const row2Items = ["Session Planner", "GDrive", "Word", "SQL"]
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
