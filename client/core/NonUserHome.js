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
import Services from '../templates/containers/AgencyModern/Services';
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

const playerQuotesData = { 
    key:"players", 
    url:"website/images/players.png",
    //transform:"translate(0px, 130px) scale(2.3)",
    imgWidth:1200,  //900 - full img
    imgHeight:840, //900 - full img
    //imgTransX:-50, 
    //imgTransY:-48,
    quotes:[
      { key:"playersQ1", text:"It's motivating! I get to see all my progress in one place on my phone." },
      { key:"playersQ2", text:"I always know my goals and what my coach wants me to focus on." },
      { key:"playersQ3", text:"I'm not good at speaking up, but I find it easier to ask questions on the app. It makes you think." }
    ]
}

const staffQuotesData = { 
  key:"staff", 
  url:"website/images/coaches.png",
  //transform:"translate(-20px,50px) scale(1.4)",
  imgWidth:1450,  //900 - full img
  imgHeight:840, //900 - full img
  imgTransX:-80, 
  //imgTransY:-48,
  quotes:[
    { key:"coachQ", label:"Coach", text:"Now I know everyone is pushing in the same direction, and my key messages wont get lost with all the noise." },
    { key:"analystQ", label:"Analyst", text:"Now that I don't have to do all the manual merging, I've got more time to talk and to help people to make data-informed decisions." },
    { key:"managerR", label:"Manager", text:"I love the oversight I get. Previously, our face-to-face communication was good, but things sometimes got siloed." }
  ]
}

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
  heroImageContainer:{
    //border:"solid",
    borderColor:"white",
    position:"absolute", 
    right:"7.5vw", 
    top:props => `calc(70px + (100vh - 70px - ${props.largeImageDimns.height}px) / 2)`,//"140px",
    width:props => `${props.largeImageDimns.width}px`, 
    height:props => `${props.largeImageDimns.height}px`, 
    overflow:"hidden",
    [theme.breakpoints.down('md')]: {
      display:"none"
    },
    //[theme.breakpoints.up('md')]: {
      //borderColor:"red"
    //},

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
  const largeImageDimns = { width: screen.width * 0.45, height: screen.height - 40 - 40 }
  const styleProps = { largeImageDimns }
  const classes = useStyles(styleProps);
  const rootRef = useRef(null);
  const potentialAnimationWidth = d3.min([screen.width * 0.9, d3.max([600, screen.width * 0.7]) ]);// sceneNr >= 8 ? 600 : 800;// d3.min([screen.width * 0.8, d3.max([screen.width * 0.5, 600]) ]);
  //const potentialStoryAnimationHeight = potentialStoryAnimationWidth * 0.6;
  const animationHeight = 350;// d3.min([storyContainerHeight, potentialStoryAnimationHeight]);
  const animationWidth = d3.min([potentialAnimationWidth, animationHeight * 1.33]);
  const animationDimns = { width:animationWidth, height:animationHeight };


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
      <div className={classes.heroImageContainer}>
        <SVGImage image={{ url: "website/heroImg.png", transform:"translate(-20, 5) scale(0.65)" }} dimns={largeImageDimns}
          styles={{ borderColour:"#f0ded5" }} imgKey="main"/>
        {/**<img src="website/heroImg.png" 
        style={{ transform:"translate(0px, 0px) scale(0.65)", transformOrigin: "top left" }} />*/}
      </div>
      <Banner screen={screen} /> 
      {/**<div className={classes.heroImageContainer}>
        <img src="website/heroImg.png" 
          style={{ transform:"translate(30px, 0px) scale(0.65)", transformOrigin: "top left" }} />
      </div>*/}
      <Services />
      <div style={{ height:"30px"}}></div>
      <PeopleWithQuotes title="What Players Say" data={playerQuotesData} dimns={{ width: screen.width * 0.9, minHeight: 260 }}
          styles={{ borderColour:"#FF825C" }} direction={screen.isSmall ? "column" : "row"}  />
      <div style={{ height:"80px"}}></div>
      <UltimateFeature animationDimns={animationDimns} />
      <Customer data={dataSections[0]} screen={screen} imgLocation={screen.isLarge ? "left" : "bottom"}  />
      <Customer data={dataSections[1]} screen={screen} imgLocation={screen.isLarge ? "right" : "bottom"} />
      <PeopleWithQuotes title="What Staff Say" data={staffQuotesData}  
          dimns={{ width: screen.width * 0.9, minHeight: 360 }} direction={screen.isSmall ? "column" : "row"} />
      <Subscribe />
      <Footer />
    </div>
  )
}
  
export default withRouter(NonUserHome)
