import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import RequestDemo from '../templates/containers/AgencyModern/RequestDemo';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  overlayFormContainer:{
    position:"fixed",
    left:0,
    top:"0",
    width:"100vw",
    height:"100vh",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    zIndex:1
  },
  overlayFormBackground:{
    width:"100%",
    height:"100%",
    position:"absolute",
    left:0,top:0,
    background:"black",
    opacity:0.7,
  },
  /*closeFormIcon:{
    position:"absolute",
    left:0,
    top:"50px",
    width:"100%",
    display:"flex",
    justifyContent:"center",
    border:"solid"
  },*/
  overlayForm:{
    width:"800px",
    maxWidth:"90vw",
    height:"95%",
    overflow:"scroll",
    //background:grey10(3),
    zIndex:2
  }
}))

const RequestDemoForm = ({ submit }) =>{
  //console.log("screen", screen)
  const styleProps = { };
  const classes = useStyles({styleProps});
  //const overlayRef = useRef(null);

  useEffect(() => { d3.select("#request-demo-form").style("display","none"); },[]);

  const hideForm = useCallback(() => {
    //d3.select(overlayRef.current)
    d3.select("#request-demo-form")
      .style("opacity", 1)
        .transition()
        .duration(500)
          .style("opacity", 0)
          .on("end", function(){
            d3.select(this).style("display","none")
          })
  
    d3.select("#navbar")
      .style("opacity", 0)
      .style("display", null)
        .transition()
        .duration(500)
          .style("opacity", 1)
  }, []);

  return (
      <div className={classes.overlayFormContainer} id="request-demo-form">
          <div className={classes.overlayFormBackground} onClick={hideForm}></div>
          {/**<div className={classes.closeFormIcon}>Go back</div>*/}
          <div className={classes.overlayForm}>
          <RequestDemo 
              heading="Thanks for your interest."
              text="Please provide some contact info and we will be in touch."
              componentsData = {{
              inputs:[
                  { key:"name", label:"Name", placeholder:"Enter Your Name" },
                  { key:"email", label:"Email", placeholder:"Enter Email Address" },
                  { key:"phone", label:"Phone (optional)", placeholder:"Enter Phone Number" },
                  { key:"club", label:"Club and Age/Phase", placeholder:"Enter Club And Age/Phase" },
              ],
              submitButton:{ label: "Send Request" },
              checkbox:{ label:"No promotional messages." }
              }}
              onSubmit={submit}
              onClose={hideForm}
          />
          </div>
      </div>
  )
}
  
export default RequestDemoForm
