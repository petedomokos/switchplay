import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';

import Customer from '../templates/containers/AgencyModern/Customer';
import { grey10, MAIN_BANNER_MARGIN_VERT } from "./websiteConstants";

const dataSections = [
  {
    key:"spectrum",
    heading:["See the data with your", "coaches eye"],
    desc:"Should you trust your 'coaches eye' more than data? Switchplay helps you find the balance through great collaboration between analysts and coaches.",
    visual:{ type:"d3" }
  },
  {
    key:"path",
    heading:["Show your players how data", "relates to their path"],
    desc:"Do you think of yourself as a storyteller? Switchplay brings out the true power of data by enabling you to weave it into players' journeys.",
    visual:{ type:"img", url:"website/images/path.png", imgWidth:1600, imgHeight:900, imgTransX:0, imgTransY:0 }
  }
]

const useStyles = makeStyles(theme => ({
    dataSectionRoot:{
        width:"100%",
        padding:"10vh 0",
        background:"#1E1E1E",
        //border:"solid",
        borderColor:"yellow"
    }
}))

const DataSection = ({ screen, className }) =>{
  const styleProps = { screen, className }
  const classes = useStyles(styleProps);

  const breakHeight = 50;
  return (
    <div className={`${classes.dataSectionRoot} ${className}`} id="customer">
      <Customer data={dataSections[0]} screen={screen} direction={screen.isLarge ? "column" : "column"}  />
      <svg height={`${breakHeight}px`} style={{ width:"100%" }}>
        <line x1={screen.width * 0.3} y1={breakHeight/2} x2={screen.width * 0.7} y2={breakHeight/2} stroke="white" strokeWidth="0.4"/>
      </svg>
      <Customer data={dataSections[1]} screen={screen} imgLocation={screen.isLarge ? "column" : "column"} />
    </div>
  )
}

DataSection.defaultProps = {
  className:""
}
  
export default DataSection
