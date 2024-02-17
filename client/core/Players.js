import React, { Fragment, useEffect, useRef } from 'react';
import { withRouter } from 'react-router-dom'
import * as d3 from 'd3';
import SVGImage from "./SVGImage";
import { makeStyles } from '@material-ui/core/styles'
import { NAVBAR_HEIGHT } from "./websiteConstants";
import Services from '../templates/containers/AgencyModern/Services';

const mainImageLarge = {
  url:"website/images/player-as-pro.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-20, 
  imgTransY:0,
  aspectRatio:1.6
}

const mainImageSmall = {
  url:"website/images/player-as-pro.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-30, 
  imgTransY:0,
  aspectRatio:1.2
}


const useStyles = makeStyles(theme => ({
  playersRoot:{
    width:"100%",
    padding:"15vh 0",
    background:"#1E1E1E",
    border:"solid",
    borderColor:"white",
  },
  topBanner:{
    //border:"solid",
    borderColor:"red",
    height:`calc(100vh - ${NAVBAR_HEIGHT}px)`,
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    [theme.breakpoints.down('sm')]: {
      width:"100vw",
      height:"auto",
      flexDirection:"column",
      justifyContent:"flex-start",
      padding:"30px 0 50px"
    },
  },
  heading:{
    //border:"solid",
    borderColor:"yellow",
    width:"20vw",
    marginRight:"3vw",
    display:"flex",
    flexDirection:"column",
    alignItems:"flex-end",
    [theme.breakpoints.down('sm')]: {
      width:"auto",
      alignItems:"flex-start",
      marginRight:0,
      margin:"40px 0 120px 0",
    },
  },
  mainImageSmall:{
    width:"100vw",
    //height:`${100 * mainImageSmall.aspectRatio}vw`,
    //border:"solid",
    borderColor:"yellow",
  },
  mainImageLarge:{
    width:"25vw",
    height:`${25 * mainImageLarge.aspectRatio}vw`,
    marginLeft:"3vw",
    //border:"solid",
    borderColor:"yellow",
  },
  headingSmallLine:{
    margin:"0 0 10px 0",
    lineHeight:1,
    fontSize:"14px",
    color:'white',
    [theme.breakpoints.down('sm')]: {
      margin:"0 0 20px 0",
      lineHeight:1,
      fontSize:"14px",
    },
  },
  headingLargeLine:{
    margin:"0 0 15px 0",
    lineHeight:1.2,
    fontSize:"42px",
    color:'white',
    [theme.breakpoints.down('sm')]: {
      margin:"0 0 15px 0",
      lineHeight:1.2,
      fontSize:"42px",
    },
  }
}))

const PlayersBanner = ({ screen }) =>{
  const mainImgRef = useRef(null);

  const styleProps = { 
    screen
  }
  const classes = useStyles(styleProps);

  useEffect(() => {
  },[]);

  return (
    <div className={classes.playersRoot} id="players" >
      <div className={classes.topBanner}>
        <div className={classes.heading}>
          <div className={classes.headingSmallLine}>GET YOUR PLAYERS</div>
          <div className={classes.headingLargeLine}>THINKING</div>
          <div className={classes.headingSmallLine}>AND</div>
          <div className={classes.headingLargeLine}>ACTING</div>
          <div className={classes.headingSmallLine}>LIKE PROS</div>
        </div>
        <div className={`${classes.mainImageLarge} md-up`}>
          <SVGImage image={mainImageLarge} />
        </div>
        <div className={`${classes.mainImageSmall} sm-down`}>
          <SVGImage image={mainImageSmall} />
        </div>
      </div>
      <Services />
    </div>
  )
}
  
export default withRouter(PlayersBanner)
