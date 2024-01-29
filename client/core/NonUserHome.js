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

import PeopleWithQuotes from './PeopleWithQuotes';
import { makeStyles } from '@material-ui/core/styles'

const playerQuotesData = { 
    key:"players", 
    url:"website/people/players.png",
    quotes:[
      { key:"playersQ1", text:"It's motivating! I get to see all my progress in one place on my phone." },
      { key:"playersQ2", text:"I always know my goals and what my coach wants me to focus on." },
      { key:"playersQ3", text:"It makes you think. I'm not good at speaking up, but I find it easier to ask questions on the app." }
    ]
}

const staffQuotesData = { 
  key:"staff", 
  url:"website/people/players.png",
  quotes:[
    { key:"coachQ", label:"Coach", text:"Now I know everyone is pushing in the same direction" },
    { key:"analystQ", label:"Analyst", text:"Now that I don't have to do all the manual merging, I've got more time to talk and to help people to make data-informed decisions." },
    { key:"managerR", label:"Manager", text:"Previously, our face-to-face communication was good, but things sometimes got siloed. I love the oversight I get." }
  ]
}

const useStyles = makeStyles(theme => ({
  nonUserHomeRoot:{
    background:"#FF825C"
  },
  heroImageContainer:{
    position:"absolute", right:"0px", top:"140px",
    width:"50vw", height:"380px", overflow:"hidden",
    [theme.breakpoints.down('md')]: {
      display:"none"
    },
    //[theme.breakpoints.up('md')]: {
      //borderColor:"red"
    //},

  }
}))

const NonUserHome = ({ screen, initScrollTo }) =>{
  const styleProps = { };
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
      d3.select(`#${window.manualScrollId}`).node().scrollIntoView();
      window.manualScrollId = null;
    }
  },[]);
/*
  NEXT
   - add labels to quotes for staff quotes (in small font just above quote)
   - do the sm/ms sizes to make sure they look good -> figure out what is causing the template code
    to constantly go over the edge of screen as you reduce it - this affects all the main text, and the email address box which 
    is too long at times
   - sort the description text for the 3 UltimateFeatures
   - sort the animation fonts and fontsizes, and get the 5 images for the heroes
   - sort teh text under the subscribe call to action
   - sort the background images for the subscribe call to action
   - sort the footer comntents and links
   - finish teh about us page text
   - implement the about us page phot and text so it looks great
   - implement the contact us page
  - add nice borders to photos
  - add blue color (colors.linkColor) to the shutterstick communication and being accountable images
  - push to heroku
  - point sp.so.uk to it
  - get ssl and attach
  - add a switchplay logo (switch in our blue, play in our orange)
  - wire up the email adress calls to action
  - add the links to linkedin etc
  - add a 'learn more' link page for the 3 ultimate features, or remove the learn more button
  - add the React fade component




  */

  return (
    <div className={classes.nonUserHomeRoot} ref={rootRef} >
      <div className={classes.heroImageContainer}>
        <img src="website/heroImg.png" 
          style={{ transform:"translate(30px, 0px) scale(0.65)", transformOrigin: "top left" }} />
      </div>
      <Banner/> 
      <div className={classes.heroImageContainer}>
        <img src="website/heroImg.png" 
          style={{ transform:"translate(30px, 0px) scale(0.65)", transformOrigin: "top left" }} />
      </div>
      <Services />
      <PeopleWithQuotes data={playerQuotesData} />
      {/**<div style={{ width:"100%", display:"flex", justifyContent:"center", margin:"80px 0px"}}>
        <Heading content="Even if some of them don't make it in football, they can all become great leaders" />
      </div>*/}
      {/**<Features />*/}
      {/**<WorkHard />*/}
      <UltimateFeature animationDimns={animationDimns} />
      <Customer screen={screen} />
      <News />
      <PeopleWithQuotes data={staffQuotesData}  />
      <Subscribe />
      <Footer />
    </div>
  )
}
  
export default NonUserHome
