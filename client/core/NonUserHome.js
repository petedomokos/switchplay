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
import News from '../templates/containers/AgencyModern/News';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import Footer from '../templates/containers/AgencyModern/Footer';
import Heading from '../templates/common/components/Heading';
import data from '../templates/common/data/AgencyModern';
import { NAVBAR_HEIGHT } from "./websiteConstants";

import PeopleWithQuotes from './PeopleWithQuotes';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { MAIN_BANNER_MARGIN_VERT, COLOURS } from "./websiteConstants";
import { scrollIntoViewWithOffset } from "./websiteHelpers";
import Players from "./Players"
import DataSection from './DataSection';
import CompatibilityInfo from './CompatibilityInfo';
import overheadBanner from '../../assets/website/banners/overhead-kick.png';

const playersImageDimns = screen => {
  if(screen.isSmall){
    return {
      rawImgWidth:935,
      rawImgHeight:598,
      scale:1.7,
      imgTransX:-screen.width / 2.6,
      aspectRatio:0.7
    }
  }
  if(screen.isMedium){
    return {
      rawImgWidth:935,
      rawImgHeight:598,
      scale:1.7,
      imgTransX:-screen.width / 5,
      aspectRatio:0.9
    }
  }
  //lg-up
  return {
    rawImgWidth:935,
    rawImgHeight:598,
    scale:1.7,
    imgTransX:-screen.width / 5,
    aspectRatio:0.9
  }
}


const staffImageDimns = screen => {
  if(screen.isSmall){
    return {
      rawImgWidth:800,
      rawImgHeight:900, 
      imgTransX:-screen.width / 4.3, 
      imgTransY:0,
      aspectRatio:0.73
    }
  }
  if(screen.isMedium){
    return {
      rawImgWidth:800,
      rawImgHeight:900, 
      imgTransX:-screen.width / 8,
      imgTransY:0,
      aspectRatio:1.1
    }
  }
  //lg-up
  return {
    rawImgWidth:900,
    rawImgHeight:900, 
    imgTransX:-80, 
    imgTransY:0,
    aspectRatio:0.9
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
    url:"website/images/what-staff-say.png",
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
    background:COLOURS.banner.bg
  },
  topDisplay:{
    padding:`${NAVBAR_HEIGHT}px 7.5vw 0`,
    minHeight:`calc(100vh + 100px)`,
    [theme.breakpoints.down('md')]: {
      padding:`${NAVBAR_HEIGHT}px 0 0`,
      //fontSize:"40px"
    },
    backgroundColor: `${COLOURS.banner.bg}`,
    //border:"solid",
    borderColor:"blue"
  },
  overheadBanner:{
    backgroundImage:`url(${overheadBanner})`,
    backgroundColor:"#ffffff",
    backgroundSize: "cover",
  }
}))

const NonUserHome = ({ screen, initScrollTo }) =>{
  const overheadImageRatio = 3/9;
  const overheadBannerHeight = screen.width * overheadImageRatio;
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
      <Players />
      <PeopleWithQuotes title="What Players Say" data={playerQuotesData(screen)} direction="row" />
      <UltimateFeature screen={screen} />
      <PeopleWithQuotes title="What Staff Say" data={staffQuotesData(screen)} direction="row-reverse" />
      <DataSection screen={screen} />
      <Subscribe />
      <div className={classes.overheadBanner} style={{ width:"100%", height:`${overheadBannerHeight}px`}}></div>
      <div style={{ marginTop:"-2.5px", width:"100%", height:"100px", background:COLOURS.OFFBLACK }}></div>
      {/**<Footer />*/}
    </div>
  )
}
  
export default withRouter(NonUserHome)
