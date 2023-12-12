import React, { useEffect, useState } from 'react'
import { CSSTransition } from "react-transition-group";
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { grey10 } from "./cards/constants"
import Tick from './Tick';
  
const useStyles = makeStyles(theme => ({
      keypoint:{
        //margin:"0 10px 20px 0",
        //margin:"10px", //for when centred
        width:"100%",
        height:"100%",
        //border:"solid",
        borderColor:"yellow",
        display:"flex",
        alignItems:"center"
      },
      tickContainer:{
        marginTop:"10px",
        height:"100%",
        display:"flex",
        justifyContent:"center",
        alignItems:"flex-start",
        color:grey10(3),
        //border:"solid",
        borderColor:"blue",
      },
      keypointText:{
        margin:"10px 10px 10px 0px",
        display:"flex",
        flexDirection:"column",
        width:props => `calc(100% - ${props.tickWidth}px)`,
        height:"100px"
      },
      keypointTitle:{
        width:"100%",
        height:props => `${props.titleHeight}px`,
        fontSize:"14px",
        color:grey10(3),
      },
      keypointDesc:{
        width:"100%",
        height:"100%",
        padding:"10px 0",
        //height:props => `calc(100% - ${props.titleHeight}px)`,
        fontSize:"12px",
        color:grey10(5),
        overflow:"scroll"
      },
    
}))

export default function Keypoint({keypoint, width, height, style}){
  const tickWidth = 30;
  const tickHeight = 40;
  const titleHeight = 30;
  const descHeight = 60;
  const classes = useStyles({ tickWidth, tickHeight, titleHeight, descHeight });
  
  return (
    <div className={classes.keypoint} key={`keypoint-${keypoint.id}`}>
        <div className={classes.tickContainer}>
            <Tick style={{ root: { padding:"0 20px", width:tickWidth, height:tickHeight } }}/>
        </div>
        <div className={classes.keypointText} >
            <Typography className={classes.keypointTitle} type="body1" component="p">
                {keypoint.title}
            </Typography>
            <div className={classes.keypointDesc}>
                {keypoint.desc}
            </div>
        </div>
    </div>
  )
}

Keypoint.defaultProps = {
  keypoint:{},
  style:{},
}
