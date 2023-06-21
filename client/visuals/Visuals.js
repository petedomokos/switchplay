import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
//import Button from '@material-ui/core/Button'
import EdgeChart from '../core/journey/EdgeChart';


const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    height:window._screen.height,//* 0.7,
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    border:"solid"
  },
  dropZone:{
    width:"90%",
    height:"90%",
    background:props => props.importState === "importing" ? "#00008B" : (props.importState === "entered" ? "blue" : "aqua"),
    borderRadius: "10% 10% 10% 10%",
    display:"flex",
    justifyContent:"center",
    alignItems:props => !props.importState ? "center" : "start",
    color:"white"
  },
  btn:{
    width:"80px",
    height:"30px",
    margin:"5px",
    fontSize:"1rem",
  },
}))

//width and height may be full screen, but may not be
const Visuals = ({ screen }) => {
  console.log("Visuals...")
  const [importState, setImportState] = useState("");
  const styleProps = { importState };
  const classes = useStyles(styleProps) 

  useEffect(() => {
  }, [])
      
  return (
    <div className={classes.root}>
      <EdgeChart availWidth={screen.width * 0.9} availHeight={screen.height * 0.9}/>
    </div>
  )
}

export default Visuals;

Visuals.defaultProps = {
}
