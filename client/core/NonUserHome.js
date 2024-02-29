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
import Players from "./Players"
import DataSection from './DataSection';
import CompatibilityInfo from './CompatibilityInfo';
import overheadBanner from './overhead-kick.png';
import { scrollIntoViewWithOffset } from './websiteHelpers';

const playerQuotesData = screen => ({
    key:"players", 
    image:screen.isSmall ? {
      url:"website/images/what-players-say.png",
      rawImgWidth:400,//550, //900 - full img
      rawImgHeight:800,//1040,  //900 - full img
      imgTransX:-270,//-100, 
      imgTransY:-90,//-55,
      aspectRatio:0.9
    }
    :
    {
      url:"website/images/what-players-say.png",
      rawImgWidth:600, //900 - full img
      rawImgHeight:1040,  //900 - full img
      imgTransX:-170, 
      imgTransY:-90,
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

const useStyles = makeStyles(theme => ({
  nonUserHomeRoot:{
    width:"100%",
    background:COLOURS.banner.bg
  },
  topDisplay:{
    padding:`${NAVBAR_HEIGHT}px 7.5vw 0`,
    minHeight:`calc(100vh + 100px)`,
    backgroundColor: `${COLOURS.banner.bg}`,
    //border:"solid",
    borderColor:"blue"
  },
  overheadBanner:{
    backgroundImage:`url(${overheadBanner})`,
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
      <div style={{ width:"100%", height:"100px", background:"black" }}></div>
      {/**<Footer />*/}
    </div>
  )
}
  
export default withRouter(NonUserHome)
