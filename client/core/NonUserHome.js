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
      { key:"playersQ2", text:"I always know what my goals are and what my coach wants me to focus on." },
      { key:"playersQ3", text:"It makes you think. I'm not good at speaking up, but I find it easier to ask questions this way/on this app." }
    ]
}

const staffQuotesData = { 
  key:"staff", 
  url:"website/people/players.png",
  quotes:[
    { key:"coachQ", text:"This helps to ensure everyone is pushing in the same direction" },
    { key:"analystQ", text:"Now that I don't have to do all the manual merging and stuff like that, I've got more time to do my actual job, talking to the guys and heling them to make data-informed decisions." },
    { key:"managerR", text:"Our face-to-face communication was good, but things sometimes got siloed. I love the oversight I get." }
  ]
}

const useStyles = makeStyles(theme => ({
  nonUserHomeRoot:{
    width:"100%",
    background:"#FF825C"
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

  return (
    <div className={classes.nonUserHomeRoot} ref={rootRef} >
      <div style={{ 
        position:"absolute", right:"0px", top:"140px",
        width:"50vw", height:"380px", overflow:"hidden" }}>
        <img src="website/heroImg.png" 
          style={{ transform:"translate(30px, 0px) scale(0.65)", transformOrigin: "top left" }} />
      </div>
      <Banner/> 
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
