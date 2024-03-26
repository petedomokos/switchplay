import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import { withRouter } from 'react-router-dom'
import * as d3 from 'd3';
import Banner from '../templates/containers/AgencyModern/Banner';
import UltimateFeature from '../templates/containers/AgencyModern/UltimateFeature';
import News from '../templates/containers/AgencyModern/News';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import RequestDemo from '../templates/containers/AgencyModern/RequestDemo';
//import Footer from '../templates/containers/AgencyModern/Footer';
import Footer from './Footer';
import Heading from '../templates/common/components/Heading';
import data from '../templates/common/data/AgencyModern';
import { grey10, NAVBAR_HEIGHT } from "./websiteConstants";

import PeopleWithQuotes from './PeopleWithQuotes';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { MAIN_BANNER_MARGIN_VERT, COLOURS } from "./websiteConstants";
import { scrollIntoViewWithOffset, showDemoForm } from "./websiteHelpers";
import Players from "./Players"
import DataSection from './DataSection';
import CompatibilityInfo from './CompatibilityInfo';

const playersImageDimns = screen => {
  console.log("screen", screen)
  if(screen.isSmall){
    return {
      rawImgWidth:935,
      rawImgHeight:598,
      //scale:1.7,
      //imgTransX:-screen.width / 2.6,
      //aspectRatio:0.7
    }
  }
  if(screen.isMedium){
    return {
      rawImgWidth:935,
      rawImgHeight:598,
      //scale:1.7,
      //imgTransX:-screen.width / 5,
      //aspectRatio:0.9
    }
  }
  //lg-up
  return {
    rawImgWidth:935,
    rawImgHeight:598,
    //scale:1.7,
    //imgTransX:-screen.width / 5,
    //aspectRatio:0.9
  }
}


const staffImageDimns = screen => {
  if(screen.isSmall){
    return {
      rawImgWidth:1024,
      rawImgHeight:1024, 
      //imgTransX:-screen.width / 4.3, 
      //imgTransY:0,
      //aspectRatio:0.73
    }
  }
  if(screen.isMedium){
    return {
      rawImgWidth:1024,
      rawImgHeight:1024, 
      //imgTransX:-screen.width / 8,
      //imgTransY:0,
      //aspectRatio:1.1
    }
  }
  //lg-up
  return {
    rawImgWidth:1024,
    rawImgHeight:1024, 
    //imgTransX:-80, 
    //imgTransY:0,
    //aspectRatio:0.9
  }
}

const playerQuotesData = screen => ({
    key:"players", 
    image:{
      url:"website/images/what-players-say.png",
      ...playersImageDimns(screen)
    },
    quotes:[
      { key:"playersQ1", label:"Andrew", text:"It's motivating! I get to see all my progress in one place on my phone." },
      { key:"playersQ2", label:"Jerome", text:"I always know my goals and what my coach wants me to focus on." },
      { key:"playersQ3", label:"Michael", text:"I'm not good at speaking up, but I find it easier to ask questions on the app. It makes you think." }
    ]
})

const staffQuotesData = screen => ({ 
  key:"staff",
  image:{
    url:"website/images/what-staff-say.jpg",
    ...staffImageDimns(screen)
  },
  quotes:[
    { key:"coachQ", label:"Coach", text:"Now I know everyone is pushing in the same direction, and my key messages wont get lost with all the noise." },
    { key:"analystQ", label:"Analyst", text:"Now that I don't have to do all the manual merging, I've got more time to talk and to help people to make data-informed decisions." },
    { key:"managerR", label:"Manager", text:"I love the oversight I get. Previously, our face-to-face communication was good, but things sometimes got siloed." }
  ]
})

const useStyles = makeStyles(theme => ({
  nonUserHomeRoot:{
    width:"100%",
    background:COLOURS.banner.bg,
    position:"relative"
  },
  topDisplay:{
    padding:`${NAVBAR_HEIGHT}px 7.5vw 0`,
    minHeight:`calc(100vh + 100px)`,
    [theme.breakpoints.down('lg')]: {
      padding:`${NAVBAR_HEIGHT}px 5vw 0`,
      //fontSize:"40px"
    },
    [theme.breakpoints.down('md')]: {
      padding:`${NAVBAR_HEIGHT}px 0 0`,
      //fontSize:"40px"
    },
    backgroundColor: `${COLOURS.banner.bg}`,
    //border:"solid",
    borderColor:"blue"
  },
  overlayFormContainer:{
    position:"fixed",
    left:0,
    top:"0",
    width:"100vw",
    height:"100vh",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    zIndex:1
  },
  overlayFormBackground:{
    width:"100%",
    height:"100%",
    position:"absolute",
    left:0,top:0,
    background:"black",
    opacity:0.7,
  },
  /*closeFormIcon:{
    position:"absolute",
    left:0,
    top:"50px",
    width:"100%",
    display:"flex",
    justifyContent:"center",
    border:"solid"
  },*/
  overlayForm:{
    width:"800px",
    maxWidth:"90vw",
    height:"95%",
    overflow:"scroll",
    //background:grey10(3),
    zIndex:2
  }
}))

const NonUserHome = ({ screen, initScrollTo, subscribe }) =>{
  //console.log("screen", screen)
  const styleProps = { };
  const classes = useStyles({styleProps});
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
      <div className={classes.topDisplay}>
        <Banner screen={screen} />
        <CompatibilityInfo screen={screen} className=""/>
      </div>
      <Players screen={screen}/>
      <PeopleWithQuotes title="What Players Say" data={playerQuotesData(screen)} direction="row" />
      <UltimateFeature screen={screen} />
      <PeopleWithQuotes title="What Staff Say" data={staffQuotesData(screen)} direction="row-reverse" />
      <DataSection screen={screen} />
      <Subscribe 
        heading="Interested? Subscribe to us."
        text="We have more than thousand of creative entrepreneurs and stat joining our business"
        componentsData = {{
          inputs:[{ key:"email", placeholder:"Enter Email Address" }],
          submitButton:{ label: "Subscribe" },
          checkbox:{ label:"No promotional messages." }
        }}
        onSubmit={subscribe}
      />
      <Footer />
      {/**<div className={classes.overlayFormContainer} ref={overlayRef}>
        <div className={classes.overlayFormBackground} onClick={hideForm}></div>
        <div className={classes.overlayForm}>
          <RequestDemo 
            heading="Thanks for your interest."
            text="Please provide some contact info and we will be in touch."
            componentsData = {{
              inputs:[
                { key:"name", label:"Name", placeholder:"Enter Your Name" },
                { key:"email", label:"Email", placeholder:"Enter Email Address" },
                { key:"phone", label:"Phone (optional)", placeholder:"Enter Phone Number" },
                { key:"club", label:"Club and Age/Phase", placeholder:"Enter Club And Age/Phase" },
              ],
              submitButton:{ label: "Send Request" },
              checkbox:{ label:"No promotional messages." }
            }}
            onSubmit={subscribe}
            onClose={hideForm}
          />

        </div>
      </div>*/}
    </div>
  )
}
  
export default withRouter(NonUserHome)
