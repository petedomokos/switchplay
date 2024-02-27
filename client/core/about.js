import React, { Fragment, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { NAVBAR_HEIGHT, COLOURS } from "./websiteConstants";
import { aboutPageData } from "../data/websiteData";

const { welcomeData, storyData } = aboutPageData;

const useStyles = makeStyles(theme => ({
  aboutRoot:{
    width:"100%",
    background:COLOURS.banner.bg,
    padding:`${NAVBAR_HEIGHT + 20}px 0`,
    [theme.breakpoints.down('sm')]: {
      //paddingTop:0
    }
  },
  welcome:{
    padding:"0 7.5vw",
    border:"solid",
    borderColor:"yellow",
    width:"100%",
    minHeight:"100vh"
  },
  story:{
    padding:"0 7.5vw",
    width:"100%",
    minHeight:"100vh",
    background:"#1E1E1E"
  },
  team:{
    padding:"0 7.5vw",
    border:"solid",
    borderColor:"yellow",
    width:"100%",
    minHeight:"100vh"
  },
  title:{

  },
  welcomeTitle:{

  },
  storyTitle:{

  },
  paragraphs:{

  },
  welcomeParagraphs:{

  },
  storyParagraphs:{

  }
}))

const Welcome = ({ }) => {
  const styleProps = { };
  const classes = useStyles({styleProps});
  return (
    <div className={classes.welcome}>
      <div className={`${classes.paragraphs} ${classes.welcomeParagraphs}`}>
        {welcomeData.paragraphs.map(par => 
          <p>{par.text}</p>
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
      <div className={`${classes.paragraphs} ${classes.storyParagraphs}`}>
        {welcomeData.paragraphs.map(par => 
          <p>{par.text}</p>
        )}
      </div>
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
  const classes = useStyles(styleProps);

  return (
    <div className={`${classes.aboutRoot} ${className}`}>
      <Welcome/>
      <Story/>
      <Team/>
    </div>
  )
}

About.defaultProps = {
  className:""
}
  
export default About
