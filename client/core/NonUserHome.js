import React, { Fragment, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom'
import * as d3 from 'd3';


import ResetCSS from '../templates/common/assets/css/style';
import {
  GlobalStyle,
  ContentWrapper,
} from '../templates/containers/AgencyModern/agencyModern.style';
import { DrawerProvider } from '../templates/common/contexts/DrawerContext';
import Navbar from '../templates/containers/AgencyModern/Navbar';
import Banner from '../templates/containers/AgencyModern/Banner';
import Features from '../templates/containers/AgencyModern/Features';
import WorkHard from '../templates/containers/AgencyModern/WorkHard';
import UltimateFeature from '../templates/containers/AgencyModern/UltimateFeature';
import Customer from '../templates/containers/AgencyModern/Customer';
import News from '../templates/containers/AgencyModern/News';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import Footer from '../templates/containers/AgencyModern/Footer';
import Heading from '../templates/common/components/Heading';
import data from '../templates/common/data/AgencyModern';
import { NAVBAR_HEIGHT } from "./websiteConstants";

import PeopleWithQuotes from './PeopleWithQuotes';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { MAIN_BANNER_MARGIN_VERT } from "./websiteConstants";
import Players from "./Players"

const playerQuotesData = screen => ({
    key:"players", 
    image:screen.isSmall ? {
      url:"website/images/what-players-say.png",
      rawImgWidth:400,//550, //900 - full img
      rawImgHeight:800,//1040,  //900 - full img
      imgTransX:-270,//-100, 
      imgTransY:-85,//-55,
      aspectRatio:0.9
    }
    :
    {
      url:"website/images/what-players-say.png",
      rawImgWidth:600, //900 - full img
      rawImgHeight:1040,  //900 - full img
      imgTransX:-170, 
      imgTransY:-85,
      aspectRatio:0.9
    },
    quotes:[
      { key:"playersQ1", label:"Andrew", text:"It's motivating! I get to see all my progress in one place on my phone." },
      { key:"playersQ2", label:"Jerome", text:"I always know my goals and what my coach wants me to focus on." },
      { key:"playersQ3", label:"Michael", text:"I'm not good at speaking up, but I find it easier to ask questions on the app. It makes you think." }
    ]
})

const staffQuotesData = screen => ({ 
  key:"staff",
  image: screen.isSmall ? {
      url:"website/images/what-staff-say.png",
      rawImgWidth:800, //900 - full img
      rawImgHeight:900,  //900 - full img
      imgTransX:-90, 
      imgTransY:0,
      aspectRatio:0.9
    }
    :
    {
      url:"website/images/what-staff-say.png",
      rawImgWidth:900, //900 - full img
      rawImgHeight:900,  //900 - full img
      imgTransX:-80, 
      imgTransY:0,
      aspectRatio:0.9
  }, 
  quotes:[
    { key:"coachQ", label:"Coach", text:"Now I know everyone is pushing in the same direction, and my key messages wont get lost with all the noise." },
    { key:"analystQ", label:"Analyst", text:"Now that I don't have to do all the manual merging, I've got more time to talk and to help people to make data-informed decisions." },
    { key:"managerR", label:"Manager", text:"I love the oversight I get. Previously, our face-to-face communication was good, but things sometimes got siloed." }
  ]
})

const dataSections = [
  {
    key:"spectrum",
    heading:["Use data with confidence", "and purpose"],
    desc:"Should you trust your 'coaches eye' more than data? Switchplay helps you find the balance through great collaboration between analysts and coaches.",
    visual:{ type:"d3" }
  },
  {
    key:"path",
    heading:"Show your players how data relates to their path",
    desc:"Do you think of yourself as a storyteller? Switchplay brings out the true power of data by enabling you to weave it into players' journeys.",
    visual:{ type:"img", url:"website/images/path.png", imgWidth:1600, imgHeight:900, imgTransX:0, imgTransY:0 }
  }
]

const useStyles = makeStyles(theme => ({
  nonUserHomeRoot:{
    width:"100%",
    background:"#FF825C"
  },
  screen:{
    display:"flex",
    justifyContent:"center"
  }
}))


//helper
const scrollIntoViewWithOffset = (node, offset) => {
  window.scrollTo({
    behavior: 'smooth',
    top:
      node.getBoundingClientRect().top -
      document.body.getBoundingClientRect().top -
      offset,
  })
}

const NonUserHome = ({ screen, initScrollTo }) =>{
  const largeImageDimns = { 
    width: screen.width * 0.45, 
    height: screen.height - 2 * MAIN_BANNER_MARGIN_VERT[screen.size],
    marginTop:MAIN_BANNER_MARGIN_VERT[screen.size],
    marginBottom:MAIN_BANNER_MARGIN_VERT[screen.size]
  }
  const styleProps = { 
    image:largeImageDimns,
  }
  const classes = useStyles(styleProps);
  const rootRef = useRef(null);

  //@todo - stop using window and use store instead
  useEffect(() => {
    if(window.manualScrollId){
      const requiredNode = d3.select(`#${window.manualScrollId}`).node();//.scrollIntoView({ behavior: 'smooth' });
      scrollIntoViewWithOffset(requiredNode, NAVBAR_HEIGHT)
      window.manualScrollId = null;
    }
  },[]);

  return (
    <div className={classes.nonUserHomeRoot} ref={rootRef} id="home" >
      <Banner screen={screen} /> 
      <Players />
      <PeopleWithQuotes title="What Players Say" data={playerQuotesData(screen)} direction="row" />
      {/**
      <UltimateFeature animationDimns={animationDimns} />
      <Customer data={dataSections[0]} screen={screen} imgLocation={screen.isLarge ? "left" : "bottom"}  />
      <Customer data={dataSections[1]} screen={screen} imgLocation={screen.isLarge ? "right" : "bottom"} />*/}
      <PeopleWithQuotes title="What Staff Say" data={staffQuotesData(screen)} direction="row-reverse" />
      {/**<Subscribe />
      <Footer />
      */}
    </div>
  )
}
  
export default withRouter(NonUserHome)
