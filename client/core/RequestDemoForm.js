import React, { Fragment, useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import RequestDemo from '../templates/containers/AgencyModern/RequestDemo';
import { makeStyles } from '@material-ui/core/styles'
import { Transition } from "react-transition-group";

const useStyles = makeStyles(theme => ({
  overlayFormContainer:{
    //position:"fixed",
    position:"absolute",
    left:0,
    top:"0",
    width:"100vw",
    height:"100vh",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    color:"white"
    //zIndex:1
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
    //zIndex:2
  },
  dialog:{
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    zIndex:"3000",
    background:"white",
    borderRadius:"5px",
    width:"380px",
    height:"180px"
  },
  dialogTitle:{
    textAlign:"center",
    color:"black",
    height:"45px"
  },
  dialogText:{
  },
  dialogActions:{
    display:"flex",
    justifyContent:"space-around",
  },
  dialogButton:{
    marginBottom:"5px"
  }
}))

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'

const RequestDemoForm = ({ submit, close, demoForm, dialog, onDialogClick }) =>{
  const [dialogState, setDialogState] = useState(null);
  const styleProps = { };
  const classes = useStyles({styleProps});

  useEffect(() => {
    if(dialog){
      setDialogState(dialog)
    }
  }, [dialog])

  const defaultStyle = {
    transition: "opacity 500ms", 
    opacity:0,
    position:"fixed",
    left:"0",
    top:"0px",
    pointerEvents:"none",
    width:"100%",
    height:"100%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  }
  
  const transitionStyles = {
    entering: { opacity: 0 },
    entered: { opacity: 1, pointerEvents:null },
    exiting: { opacity: 1 },
    exited: { opacity: 0 },
  };

  return (
      <div className={classes.overlayFormContainer} style={{ pointerEvents:"none" }}>
        <div className={classes.overlayFormBackground} onClick={close} style={{ pointerEvents:demoForm || dialog ? "all" : "none" }}></div>
        <Transition in={demoForm && !dialog} timeout={300}>
          {(state) => (
            <div style={{ ...defaultStyle, ...transitionStyles[state], pointerEvents:"none" }} >
                <div className={classes.overlayForm} style={{ pointerEvents:demoForm && !dialog ? "all" : "none" }}>
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
                      onClose={close}
                  />
                </div>
            </div>
          )}
        </Transition>
        <Transition in={dialog} timeout={300}>
          {(state) => (
            <div style={{ ...defaultStyle, ...transitionStyles[state] }} onClick={() => onDialogClick()}>
              <div className={classes.dialog} style={{ pointerEvents: dialog ? "all" : "none"}}  onClick={() => onDialogClick()} >
                <DialogTitle className={classes.dialogTitle} >{dialogState?.title}</DialogTitle>
                <DialogContent>``
                  <DialogContentText className={classes.dialogText}>
                    {dialogState?.text}
                  </DialogContentText>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                  {dialogState?.buttons?.map(btn => 
                    <Button color="primary" autoFocus="autoFocus" variant="contained" className={classes.dialogButton}>
                      {btn.label}
                    </Button>
                  )}
                </DialogActions>
              </div>
            </div>
          )}
        </Transition>
      </div>
  )
}
  
export default RequestDemoForm
