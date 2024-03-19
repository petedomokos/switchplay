import React, { Fragment, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'

import SimpleSlider from './SimpleSlider';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import { NAVBAR_HEIGHT, COLOURS, grey10 } from "./websiteConstants";
import { aboutPageData } from "../data/websiteData";
import teamworkIcon from '../../assets/website/about-page-images/teamwork-100.png';
import overheadBanner from '../../assets/website/banners/header-goal.png';
//import stadiumBanner from '../../assets/website/about-page-images/stadium.png';
import { scrollIntoViewWithOffset } from './websiteHelpers';

const { welcomeData, storyData } = aboutPageData;

const useStyles = makeStyles(theme => ({
  contactRoot:{
    width:"100%",
    height:"100vh",
    paddingTop:"100px",
    backgroundColor:"#ffffff",
    padding:`${NAVBAR_HEIGHT + 20}px 0 0`,
    [theme.breakpoints.down('sm')]: {
      //paddingTop:0
    }
  },
  contactInfoArea:{
    //border:"solid",
    borderColor:"blue",
    width:"100%",
    height:"calc(100vh - 450px)",
    padding:"20px 0 0",
    [theme.breakpoints.down('lg')]: {
      height:"calc(100vh - 350px)",
    },
    [theme.breakpoints.down('md')]: {
      height:"calc(100vh - 350px)",
    },
    [theme.breakpoints.down('sm')]: {
      height:"auto",
      minHeight:"60vh",
      padding:"30px 0"
    },
    [theme.breakpoints.down('xs')]: {
      height:"auto",
      minHeight:"60vh",
      padding:"30px 0"
    },
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  contactInfo:{
    width:"fit-content",
    maxWidth:"80%",
    margin:"0 auto",
    display:"flex",
    flexDirection:"column",
    //border:"solid",
    borderColor:"orange"
  },
  contactInfoSection:{
    width:"fit-content",
    //width:"480px",
    //maxWidth:"90vw",
    margin:"2.5vh 0",
    //padding:"10%",
    display:"flex",
    //border:"solid",
  },
  sectionLabel:{
    //border:"solid",
    width:"200px",
    padding:"0 10px 0 0",
    fontSize:"18px",
    fontWeight:"600",
    [theme.breakpoints.down('lg')]: {
      borderColor:"orange"
    },
    [theme.breakpoints.down('md')]: {
      width:"160px",
      fontSize:"18px",
      borderColor:"red"
    },
    [theme.breakpoints.down('sm')]: {
      width:"120px",
      fontSize:"16px",
      borderColor:"yellow"
    },
    [theme.breakpoints.down('xs')]: {
      width:"80px",
      fontSize:"12px",
      borderColor:"blue"
    }
    //border:"solid"
  },
  callSectionContent:{
    display:"flex",
  },
  email:{
    marginBottom:"20px",
  },
  contentMainText:{
    fontSize:"18px",
    [theme.breakpoints.down('lg')]: {
    },
    [theme.breakpoints.down('md')]: {
      fontSize:"18px",
    },
    [theme.breakpoints.down('sm')]: {
      fontSize:"14px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize:"12px",
    }
  },
  slash:{
    margin:"-4px 10px 0",
    fontSize:"22px",
    [theme.breakpoints.down('lg')]: {
      fontSize:"20px",
    },
    [theme.breakpoints.down('md')]: {
      fontSize:"20px",
    },
    [theme.breakpoints.down('sm')]: {
      fontSize:"16px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize:"14px",
    }
  },
  emailDesc:{
    fontSize:"16px",
    fontWeight:"bold",
    [theme.breakpoints.down('lg')]: {
      fontSize:"15px",
    },
    [theme.breakpoints.down('md')]: {
      fontSize:"16px",
    },
    [theme.breakpoints.down('sm')]: {
      fontSize:"13px",
    },
    [theme.breakpoints.down('xs')]: {
      fontSize:"12px",
    }
  },
  writeSectionContent:{

  },
  stadiumBanner:{
    //backgroundImage:`url(${stadiumBanner})`,
    backgroundSize: "cover",
  },
  overheadBanner:{
    backgroundImage:`url(${overheadBanner})`,
    backgroundColor:"#ffffff",
    backgroundSize: "cover",
  }
}))

const Contact = ({ className }) =>{
  const styleProps = { className }
  const overheadImageRatio = 3/9;
  const stadiumImageRatio = 2/9;
  const classes = useStyles(styleProps);

  useEffect(() => {
    window.scrollTo(0, -NAVBAR_HEIGHT);
  },[]);

  return (
    <div className={`${classes.contactRoot} ${className}`}>
      <div className={classes.contactInfoArea}>
        <div className={classes.contactInfo}>
          <div className={classes.contactInfoSection}>
            <div className={classes.sectionLabel}>Call us</div>
            <div className={`${classes.sectionContent} ${classes.callSectionContent}`}>
              <div className={classes.contentMainText}>0208 087 3567</div>
              <div className={classes.slash}>/</div>
              <div className={classes.contentMainText}>07547 196642</div>
            </div>
          </div>
          <div className={classes.contactInfoSection}>
            <div className={classes.sectionLabel}>Email us</div>
            <div className={`${classes.sectionContent} ${classes.emailSectionContent}`}>
              <div className={classes.email}>
                <div className={classes.emailDesc}>General Enquiries</div>
                <div className={classes.contentMainText}>info@switchplay.co.uk</div>
              </div>
              <div className={classes.email}>
                <div className={classes.emailDesc}>CEO</div>
                <div className={classes.contentMainText}>peterdomokos@switchplay.co.uk</div>
              </div>
            </div>
          </div>
          <div className={classes.contactInfoSection}>
          <div className={classes.sectionLabel}>Write to us</div>
          <div className={`${classes.sectionContent} ${classes.writeSectionContent}`}>
            <div className={classes.contentMainText}>Switchplay Technology Ltd</div>
            <div className={classes.contentMainText}>107 Howson Road</div>
            <div className={classes.contentMainText}>London</div>
            <div className={classes.contentMainText}>SE4 2BB</div>
          </div>
        </div>
      </div>
      </div>
      <div className={classes.overheadBanner} style={{ width:"100vw", height:`${100 * overheadImageRatio}vw`}}></div>
      <div style={{ width:"100%", height:"100px", background:COLOURS.OFFBLACK }}></div>
    </div>
  )
}

Contact.defaultProps = {
  className:""
}
  
export default Contact
