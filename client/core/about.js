import React, { Fragment, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { NAVBAR_HEIGHT, COLOURS } from "./websiteConstants";
import { aboutPageData } from "../data/websiteData";
import overheadBanner from './overhead-kick.png';
import stadiumBanner from '../../assets/website/about-page-images/stadium.png';
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
    height:"40vh",
    //minHeight:"400px",
    [theme.breakpoints.down('md')]: {
      //fontSize:"50px"
    }
  },
  story:{
    padding:"0 7.5vw",
    width:"100%",
    minHeight:`calc(100vh - ${NAVBAR_HEIGHT}px)`,
    background:"#613737",
    border:"solid",
  },
  team:{
    padding:"0 7.5vw",
    background:"white",
    border:"solid",
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
    padding:"10px 10vw"
  },
  welcomeParagraphs:{

  },
  storyParagraphs:{

  },
  paragraph:{
    fontSize:"16px"

  },
  welcomeParagraph:{

  },
  storyParagraph:{

  },
  stadiumBanner:{
    backgroundImage:`url(${stadiumBanner})`,
    backgroundSize: "cover",
  },
  overheadBanner:{
    //backgroundImage: "url('website/banners/overhead-kick.png')",
    backgroundImage:`url(${overheadBanner})`,
    backgroundSize: "cover",
  },
}))

const Welcome = ({ }) => {
  const styleProps = { };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.welcome}>
      <div className={`${classes.paragraphs} ${classes.welcomeParagraphs}`}>
        {welcomeData.paragraphs.map(par => 
          <p className={`${classes.paragraph} ${classes.welcomeParagraph}`}>{par.text}</p>
        )}
      </div>
    </div>
  )
}

const Story = ({}) => {
  const styleProps = { };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.story}>
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

const About = ({ screen, className }) =>{
  const styleProps = { screen, className }
  const overheadImageRatio = 3/9;
  const stadiumImageRatio = 2/9;
  const classes = useStyles(styleProps);

  useEffect(() => {
    if(window.manualScrollId){
      const requiredNode = d3.select(`#${window.manualScrollId}`).node();//.scrollIntoView({ behavior: 'smooth' });
      scrollIntoViewWithOffset(requiredNode, NAVBAR_HEIGHT)
      window.manualScrollId = null;
    }
  },[]);

  return (
    <div className={`${classes.aboutRoot} ${className}`}>
      <Welcome/>
      <div className={classes.stadiumBanner} style={{ width:"100vw", height:"300px" /*height:`${100 * stadiumImageRatio}vw` */}}></div>
      <Story/>
      <Team/>
      <div style={{ width:"100%", height:"50px", background:"white" }}></div>
      <div className={classes.overheadBanner} style={{ width:"100vw", height:`${100 * overheadImageRatio}vw`}}></div>
      <div style={{ width:"100%", height:"100px", background:"black" }}></div>
    </div>
  )
}

About.defaultProps = {
  className:""
}
  
export default About
