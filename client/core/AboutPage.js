import React, { Fragment, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'

import SimpleSlider from './SimpleSlider';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import Footer from './Footer';
import { NAVBAR_HEIGHT, COLOURS, grey10 } from "./websiteConstants";
import { aboutPageData } from "../data/websiteData";
import teamworkIcon from '../../assets/website/about-page-images/teamwork-100.png';
import overheadBanner from '../../assets/website/banners/header-goal.png';
//import stadiumBanner from '../../assets/website/about-page-images/stadium.png';
import { scrollIntoViewWithOffset } from './websiteHelpers';

const { welcomeData, storyData } = aboutPageData;

const useStyles = makeStyles(theme => ({
  aboutRoot:{
    width:"100%",
    background:COLOURS.banner.bg,
    padding:`${NAVBAR_HEIGHT + 20}px 0 0`,
    [theme.breakpoints.down('sm')]: {
      //paddingTop:0
    }
  },
  welcome:{
    padding:"0 7.5vw",
    //border:"solid",
    borderColor:"yellow",
    width:"100%",
    minHeight:`calc(100vh - ${NAVBAR_HEIGHT}px)`,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    background:"#584543", //"#613737",
    //minHeight:"400px",
    [theme.breakpoints.down('md')]: {
      //fontSize:"50px"
    }
  },
  story:{
    width:"90%",
    margin:"auto",
    padding:"30px 7.5vw",
    display:"flex",
    justifyContent:"center",
    minHeight:`calc(100vh - ${NAVBAR_HEIGHT}px)`,
    background:"#DBEFF0",//#613737",
    //border:"solid",
  },
  sliderContainer:{
    width:"100%", 
    height:`calc(90vh - ${NAVBAR_HEIGHT}px)`,
    //background:"#ffffff"//"#605C5C",
    //border:"solid"
  },
  slideContainer:{
    //paddingTop:"50px",
    width:"100%",
    height:`calc(90vh - ${NAVBAR_HEIGHT}px - 40px)`,
    //minHeight: height:`calc(90vh - ${NAVBAR_HEIGHT}px - 40px)`,
    //border:"solid",
    borderColor:"red"
  },
  slide:{
    width:"100%",
    height:"100%",//`calc(90vh - ${NAVBAR_HEIGHT}px - 40px)`,
    maxHeight:"100%",
    minHeight:"100%",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-around",
    alignItems:"center",
    //background:"#605C5C", //"#ffffff"
    //border:"solid",
    borderColor:"yellow"
  },
  slideImgOuterContainer:{
    width:"80%", //"90%",
    //height:"50%",
    display:"flex",
    alignItems:"center",
    //border:"solid",
    borderColor:"blue"
  },
  slideImgInnerContainer:{
    width:"100%",
    height:"80%",
    //border:"solid",
    borderColor:"pink"
  },
  slideParagraphs:{
    //height:"50%",
    padding:"0 10%",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    //border:"solid",
    borderColor:"blue"
  },
  slideParagraph:{
    color:grey10(9),
    fontSize:"20px",
    [theme.breakpoints.down('lg')]: {
      fontSize:"18px",
    },
    [theme.breakpoints.down('md')]: {
      fontSize:"16px",
    },
    [theme.breakpoints.down('sm')]: {
      fontSize:"16px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize:"14px",
    },
    //border:"solid"
  },
  team:{
    padding:"0 7.5vw",
    background:"white",
    //border:"solid",
    //borderColor:"yellow",
    width:"100%",
    minHeight:`calc(100vh - ${NAVBAR_HEIGHT}px)`,
  },
  title:{

  },
  welcomeTitle:{

  },
  storyTitle:{

  },
  paragraphs:{
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center",
    padding:"10px 10vw"
  },
  welcomeMiddleIcon:{
    width:"80px",
    height:"80px",
    margin:"20px 0",
    backgroundImage:`url(${teamworkIcon})`,
    backgroundSize: "cover",
  },
  welcomeParagraphs:{

  },
  storyParagraphs:{

  },
  paragraph:{
    textAlign:"center",
    fontSize:"28px",
    color:grey10(2),
    [theme.breakpoints.down('lg')]: {
      fontSize:"24px",
    },
    [theme.breakpoints.down('md')]: {
      fontSize:"20px",
    },
    [theme.breakpoints.down('sm')]: {
      fontSize:"18px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize:"14px",
    },
  },
  welcomeParagraph:{

  },
  storyParagraph:{

  },
  stadiumBanner:{
    //backgroundImage:`url(${stadiumBanner})`,
    backgroundSize: "cover",
  },
}))

const Welcome = ({ }) => {
  const styleProps = { };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.welcome}>
      <div className={`${classes.paragraphs} ${classes.welcomeParagraphs}`}>
        <p className={`${classes.paragraph} ${classes.welcomeParagraph}`}>{welcomeData.paragraphs[0].text}</p>
        <div className={classes.welcomeMiddleIcon}></div>
        <p className={`${classes.paragraph} ${classes.welcomeParagraph}`}>{welcomeData.paragraphs[1].text}</p>
      </div>
    </div>
  )
}

const Story = ({ height }) => {
  const styleProps = { 
  };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.story}>
      <SimpleSlider data={storyData.slides} classes={classes} />
    </div>
  )
}


const Team = () => {
  const styleProps = { };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.team}>
      team
    </div>
  )
}

const AboutPage = ({ subscribe }) =>{
  const styleProps = { }
  const classes = useStyles(styleProps);

  useEffect(() => {
    window.scrollTo(0, -NAVBAR_HEIGHT);
  },[]);

  return (
    <div className={classes.aboutRoot}>
      <Welcome/>
      <Story/>
      {/**<Team/>*/}
      {/**<div style={{ width:"100%", height:"50px", background:"white" }}></div>*/}
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
      <Footer page="about" />
    </div>
  )
}

AboutPage.defaultProps = {
  className:""
}
  
export default AboutPage
