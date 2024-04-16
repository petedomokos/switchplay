import React, { Fragment, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles'
import * as d3 from 'd3';

import Customer from '../templates/containers/AgencyModern/Customer';
import { grey10, MAIN_BANNER_MARGIN_VERT, COLOURS } from "./websiteConstants";

const dataSections = [
  {
    key:"spectrum",
    heading:["See the data through your", "coach's eye"],
    desc:"Should you trust your coach's eye more than objective data? Switchplay's intuitive main view helps you to see the bigger picture, and helps analysts to talk about data with coaches and players effectively.",
    //desc:"Should you trust your coach's eye more than objective data? Ofcourse, it's not that simple! The solution comes from great collaboration between staff. Switchplay is designed to build people's confidence and to support best practice in decision-making and communication about data.",
    visual:{ type:"d3" }
  },
  {
    key:"path",
    heading:["Show your players how data", "relates to their path"],
    desc:"Data insights are great, but do you think of yourself as a storyteller? Our innovative visuals help you to bring out the true power of data by weaving it into players' journeys. Your players will start to join up the dots, to see how your messages today relate to their 'tomorrow'.",
    //desc:"Data insights are great, but do you think of yourself as a storyteller? With Switchplay, you can bring out the true power of data by weaving it into players' journeys. Your players will start to join up the dots, to see how your messages today relate to their future goals.",
    visual:{ type:"img", url:"website/images/path.png", imgWidth:1600, imgHeight:900, imgTransX:0, imgTransY:0 }
  }
]

const useStyles = makeStyles(theme => ({
    dataSectionRoot:{
        width:"100%",
        padding:"10vh 0",
        background:COLOURS.OFFBLACK,
        //border:"solid",
        borderColor:"yellow"
    }
}))

const DataSection = ({ screen, className }) =>{
  const styleProps = { screen, className }
  const classes = useStyles(styleProps);

  const breakHeight = 200;
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
