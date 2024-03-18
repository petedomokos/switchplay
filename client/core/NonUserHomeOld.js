import React, { useEffect, useState, useRef } from 'react'
import { CSSTransition } from "react-transition-group";
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
//children
import Strapline from "./Strapline";
import Keypoint from './Keypoint';
//import heroImage from '../assets/images/hero-image.png'
//import peterDomokos from '../assets/images/peter-domokos.png'
import { grey10 } from "./cards/constants"
import WelcomeMessage from './WelcomeMessage';
import HomePage from './NonUserHome';

const quotes = {
  player:"I get to see all my progress, messages, videos and what Im working on in one place, all mapped out",
  coach:"We need everyone pushing in the same direction",
  analyst:"I'm so busy because everything has to go through me because there is no centralised app. I have no time to provide insights and to follow up to make sure people have understood what I've said.",
  manager:"Our communication is good, but things can sometimes get siloed. Switchplay can support our face-to-face communication."
}

const urls = {
  player:"website/players.png",
  coach:"website/players.png",
  analyst:"website/players.png",
  manager:"website/players.png"
}

/*const heroStatement = [
  "Brings together all information and data",
  "into a coherent whole",
  "with the player and their journey",
  "at the heart of it all."
]*/
const heroStatementHeading = "The development tool that puts people first"
/*
const heroStatement = nrLines => {
  if(nrLines === 3){
    return [
      "Great football development is about people & relationships, learning & growth, consistent communication",
      "centred around your players",
      "bringing together all the parts into one",
    ]
  }
  if(nrLines === 2){
    return [
      "Great football development is about people, relationships, growth, communication & details.",
      "Switchplay helps you to embed these in your own way to achieve your vision.",
      //"player development data, info & admin meaningful"
    ]
  }
  return ["Great football development is about people, relationships, growth, communication & details. Switchplay helps you to embed these in your way to achieve your vision."]
}
*/

const heroStatement = nrLines => {
  if(nrLines === 3){
    return [
      "Great football development is about people & relationships, learning & growth, consistent communication",
      "centred around your players",
      "bringing together all the parts into one",
    ]
  }
  if(nrLines === 2){
    return [
      "Get your players thinking and acting like pros. ",
      "Manage all your communication & information with ease. Use data effectively.",
      //"player development data, info & admin meaningful"
    ]
  }
  return ["Get your players thinking and acting like pros. Manage your communication & information with ease. Use data effectively."]
}
  


const keypoints = [
  {
    id:"0",
    title:"Player-centred",
    desc:"Football academies are complex environments. key messages and goals can get lost amidst the noise. jnjkd x h khxc xc"
    //desc:"The current tools available were designed for businesses with different priorities to football academies. They focus on productivity and efficiency, but at academies, the goal is player development. It is a human process and a learning process.",
  },
  {
    id:"1",
    title:"Saves you time",
    desc:"jhd djkh jdkh dh dkh dskjhds h dskh dkshds  spiral curriculum,  spiral curriculum, dkh dh dkh dskjhds h dskh dkshds  spiral curriculum,"
  },
  {
    id:"1",
    title:"Supports new insights",
    desc:"jhd djkh jdkh dh dkh dskjhds h dskh dkshds  spiral curriculum h dskh dkshds  spiral curriculum, dkh dh dkh dskjhds h dskh dkshds  spiral curriculum,"
  },
  {
    id:"2",
    title:"Improves Communication",
    desc:"Today’s young players are different. They tend to be more introverted, and are often on their phones. This creates an opportunity that clubs are missing out on"
    //desc:"Today’s young players are different. They tend to be more introverted, and spend a lot of time on their phones. This creates an opportunity that clubs are missing out on. For players, the app can be a mobile phone reinforcement of what has been agreed in meetings and informal reviews, and can engage and inform them regularly about their targets and KPIs.  It can support and enhance the face-to-face communication that is key to the relationships between coaches and players. For some players, it can help them to communicate with staff about their progress, especially when they are new to the club and relationships are still being formed."
  },
]

const secondaryPoints = [
  {
    id:"0",
    title:"Supports inter-disciplinary communication",
    //desc:"Football academies are complex inter-disciplinary environments. Information can easily get siloed, and key messages and goals can get lost amidst the noise."
    desc:"The current tools available were designed for businesses with different priorities to football academies. They focus on productivity and efficiency, but at academies, the goal is player development. It is a human process and a learning process.",
  },
  {
    id:"1",
    title:"Focuses on the details that get missed",
    desc:"jhd djkh jdkh dh dkh dskjhds h dskh dkshds  spiral curriculum, "
  },
  {
    id:"2",
    title:"Engages players by gamification, and encourages accountability",
    desc:"Today’s young players are different. They tend to be more introverted, and spend a lot of time on their phones. This creates an opportunity that clubs are missing out on. For players, the app can be a mobile phone reinforcement of what has been agreed in meetings and informal reviews, and can engage and inform them regularly about their targets and KPIs.  It can support and enhance the face-to-face communication that is key to the relationships between coaches and players. For some players, it can help them to communicate with staff about their progress, especially when they are new to the club and relationships are still being formed."
  },
  {
    id:"3",
    title:"Saves time and enables new insights",
    desc:"Switchplay will save time for the data team and help them to make cutting-edge insights because it merges data from all of the different sources that you use. Typically, data staff are having to choose between doing this manually, or losing out on insights."
  }
]
 
const useStyles = makeStyles(theme => ({
  homeRoot: {
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    overflow:"scroll",
    background:grey10(9.5),//"black",
    //padding:"5px 2.5%",
    width:"100%",
  },
  screen:{
    width:"100%",
    //border:"solid",
    //borderColor:"pink",
    //height:props => props.screen.height,
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    zIndex:1
  },
  storyAnimationCont:{
    width:"100%",
    height:props => `${props.storyContainerHeight}px`,
    //border:"solid",
    //borderColor:"yellow",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },
  heroStatement:{
    //padding:props => props.heroStatement.padding,
    width:props => props.heroStatement.width,
    height:"160px",
    display:"flex",
    flexDirection:"column",
    //justifyContent:"space-around",
    alignItems:"center",
    //border:"solid",
    //borderColor:"red",
    zIndex:1
  },
  heroStatementHeading:{
    fontSize:"64px",
    marginBottom:"10px",
    color:grey10(1),
    fontFamily: "Helvetica, Sans-Serif"
  },
  heroStatementText:{
    //border:"solid",
    //borderColor:"yellow",
    fontSize:props => `${props.heroStatement.fontSize}px`,
    //fontStyle: "italic",
    color:grey10(2),
    fontFamily: "Helvetica, Sans-Serif"
  },
  callToAction:{
    color:"white"

  },
  userExampleSection:{
    width:"80%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    flexWrap:"wrap",
    //border:"solid"
    //border:"solid",
    //borderColor:"red"
  },
  userPhoto:{
    width:"40%",
    minWidth:"270px",
    //border:"solid",
    //borderColor:"yellow"
  },
  userPhotoImg:{
    width:"100%",
    height:"100%",
    objectFit:"contain",
    //border:"solid",
    //borderColor:"blue"
  },
  userQuote:{
    padding:"0px 20px",
    width:"40%",
    minWidth:"270px",
    maxWidth:"40%",
    height:"140px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    color:grey10(3),
    fontSize:"20px",
    fontStyle:"italic",
    //border:"solid",
    //borderColor:"yellow"
  },
  layersDiagram:{
    width:"800px",
  },
  topLayer:{
    width:"100%",
    height:"120px",
    display:"flex",
    justifyContent:"space-around",
    alignItems:"center",
    background:"#90EE90",
  },
  bottomLayer:{
    width:"100%",
    height:"120px",
    display:"flex",
    justifyContent:"space-around",
    alignItems:"center",
    background:"#90EE90",
  },
  missingLayer:{
    width:"100%",
    height:"150px",
    display:"flex",
    justifyContent:"space-around",
    alignItems:"center",
    background:"aqua",
    fontSize:"24px"
  },
  savingsLayer:{
    width:"100%",
    height:"0px",
    marginBottom:"0px",
    display:"flex",
    justifyContent:"space-around",
    alignItems:"center",
    background:"aqua"
  },
  coachSaving:{
    marginTop:"-40px",
    marginLeft:"170px",
    fontSize:"14px"
  },
  playerSaving:{
    marginTop:"-40px",
    //marginLeft:"50px",
    fontSize:"14px"
  },
  analystSaving:{
    marginTop:"-40px",
    marginRight:"170px",
    fontSize:"14px"
  },
  layerItem:{
    fontSize:"18px"
  },
  keypoints:{
    width:"80%",
    maxWidth:"800px",
    display:"flex",
    justifyContent:"space-around",
    flexWrap:"wrap",
    //border:"solid",
    //borderColor:"red"
  },
  keypoint:{
    width:"40%",
    minWidth:"250px",
    maxWidth:"350px",
    height:"200px",
    margin:"10px",
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    //border:"solid",
    //borderColor:"yellow"
  },
  keypointTitle:{
    fontSize:"20px",
    margin:"20px 5px",
    color:grey10(3),
    /*width:"100%",
    height:"50px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",*/
    //border:"solid"
  },
  keypointDesc:{
    fontSize:"16px",
    color:grey10(4),
    /*width:"100%",
    height:"50px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",*/
    //border:"solid"

  },
  keypointImage:{
    width:"100%",
    height:"calc(100% - 50px)",
    background:"grey",
    //border:"solid"
  },
  screenTop:{
    width:"100%", //needs to be responsive so reduces if narrower screen
    height:"210px",
    display:"flex",
    justifyContent:"space-between",
    //border:"solid",
    //borderColor:"red"
  },
  screenTopLeft:{
    width:"500px",
    height:"100%",
    overflow:"visible",
    //border:"solid",
    //borderColor:"white"

  },
  screenTopRight:{
    width:"calc(100% - 500px)",
    height:"100%",
    display:"flex",
    //justifyContent:"center",
    //border:"solid",
    //borderColor:"white"

  },
  screenBottom:{
    marginLeft:"-70px",
    width:"100%",
    height:"250px",
    display:"flex",
    justifyContent:"space-between",
    //border:"solid",
    //borderColor:"red"
  },
  screenBottomLeft:{
    width:"50%",
    height:"100%",
    //border:"solid",
    //borderColor:"white",
  },
  screenBottomRight:{
    width:"50%",
    height:"100%",
    //border:"solid",
    //borderColor:"white",
  },
  keypointContainer:{
    width:"100%",
    height:"50%",
    //border:"solid",
    //borderColor:"blue"
  },
  welcome:{
    marginLeft:"-60px",
    height:"150px",
    display:"flex",
    overflow:"visible"
  },
  welcomePhoto:{
    width:"180px",
    height:"120px",
    //border:"solid",
    //borderColor:"yellow",
    //backgroundImage: `url(${peterDomokos})`,
    backgroundSize: "contain",
  },
  backgroundImage:{
    //position:"absolute",
    //bottom:"80px",
    width:"100%",
    height:"300px",
    //opacity:"0.5",
    //backgroundImage: `url(${heroImage})`,
    backgroundSize: "contain",
    //backgroundSize: "cover",
    //border:"solid",
    //borderColor:"yellow",
    //zIndex:0
  },
  bottomBorder:{
    display:"none",
    position:"absolute",
    bottom:"0px",
    width:"100%",
    height:"80px",
    background:"black"
  },
  callsToAction:{
    alignSelf:"flex-start"
  },
  demoBtn:{
    zIndex:1,
    height:"24px",
  },
  scrollSection1:{
    width:"100%",
    height:"250px"
  }
}))

/*

add a background image - pass in the window dimns so it can takeup full dimns -> probably use the css way to do it so we can iuse the 'cover' property?
-find the image or another image
 //@todo - if burger, then screen heihgt is less
- impl React tick animation https://www.sabhya.dev/animating-a-check-icon-in-react-with-framer-motion
- choose fonts
- change burger to coming in from top

- add other description stuff to home page for user to scroll to
- direct switchplay.co.uk and switchplay.org to the domain

*/

export default function NonUserHome({ screen, requestDemo, subscribe }){
  //todo  -do this screen size properly -> may need a container to get it from store
  //const screen = { width: window.innerWidth, height:window.innerHeight }
  //console.log("screen", screen)
  const storyContainerHeight = screen.isSmall ? 300 : 300;
  const styleProps = {
    screen,
    storyContainerHeight,
    heroStatement:{
      fontSize:screen.isSmall ? 14 : 18,
      width:"90%" 
    }
  };
  const classes = useStyles(styleProps)

  const heroStatementNrLines = 2;// screen.isSmall ? 3 : 2;
  return (
      <div className={classes.homeRoot}>
        <div className={classes.screen} >
          <HomePage screen={screen} requestDemo={requestDemo} subscribe={subscribe} />
        </div>
      </div>
  )
}
