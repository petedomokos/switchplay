import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';
import { grey10, MAIN_BANNER_MARGIN_VERT, NAVBAR_HEIGHT } from "./websiteConstants";
import { styles } from "./websiteHelpers";

const { lgUp, mdDown } = styles;


const useStyles = makeStyles(theme => ({
    compatibilityInfoRoot:{
      width:"800px",
      height:`${NAVBAR_HEIGHT}px`,
      margin:"30px auto 0",
      display:"flex",
      justifyContent:"center",
      alignItems:"center",
      [theme.breakpoints.down('md')]: {
        width:"100%",
        maxWidth:"500px",
        height:"auto",
        margin:"100px auto",
        flexDirection:"column",
        borderColor:"red",
      },
      [theme.breakpoints.down('sm')]: {
        flexDirection:"column",
        width:"90%",
        maxWidth:"350px",
        height:`${NAVBAR_HEIGHT + 25}px`,
        margin:"30px auto 50px"

      },
      background:"transparent",
      //border:"solid",
    },
    listLabel:{
      //border:"solid",
      width:"100px",
      height:"20px", 
      margin:"5px 25px 5px 0px", 
      fontSize:"14px", 
      color:grey10(7),
      [theme.breakpoints.down('md')]: {
        margin:"5px 0 15px", 
        textAlign:"center",
        fontSize:"16px",
        borderColor:"red",
      },
      [theme.breakpoints.down('sm')]: {
        borderColor:"yellow",
        margin:"5px 0 20px", 
        alignSelf:"center",
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
      //border:"solid",
      height:"20px", 
      margin:"5px 25px 5px 0", 
      textAlign:"center",
      fontSize:"14px", 
      color:grey10(5),
      [theme.breakpoints.down('md')]: {
        margin:"10px 25px", 
        fontSize:"16px",
      },
      [theme.breakpoints.down('sm')]: {
        fontSize:"14px",
        color:grey10(5),
        margin:"5px"
      },
    },
    col1Item:{
      width:"80px",
      [theme.breakpoints.down('md')]: {
        width:"130px"
      },
      [theme.breakpoints.down('sm')]: {
        width:"110px"
      }
    },
    col2Item:{
      width:"48px",
      [theme.breakpoints.down('md')]: {
        width:"48px"
      },
      [theme.breakpoints.down('sm')]: {
        width:"48px"
      }
    },
    col3Item:{
      //border:"solid",
      width:"40px",
      [theme.breakpoints.down('md')]: {
        width:"50px"
      },
      [theme.breakpoints.down('sm')]: {
        width:"40px"
      }
    },
    col4Item:{
      width:"30px",
      [theme.breakpoints.down('md')]: {
        width:"30px"
      },
      [theme.breakpoints.down('sm')]: {
        width:"30px"
      }
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
            <div style={lgUp(screen)}>
                <div className={classes.itemRow} >
                  {singleRowItems.map((it,i) =>
                    <span className={classes.item}>{it}</span>
                  )}
                </div>
            </div>
            <div style={mdDown(screen)}>
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
