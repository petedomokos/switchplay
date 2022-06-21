import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Mountain from "./Mountain";
import Yeti from "./Yeti";
import { avalancheGenerator } from './avalancheGenerator';
import { makeStyles } from '@material-ui/core/styles';
import { COLOURS } from "../constants";

const useStyles = makeStyles((theme) => ({
  root: {
      margin:"10px"
  },
  contextMenu:{
      margin:"10px"
  },
  contextBtn:{
      margin:"5px",
  },
  svg:{
      background:COLOURS.svg.bg,
      //width:"840px",
      //height:"420px",
      //margin:"20px" 
  }
}));

const Avalanche = ({width, height}) => {
  const classes = useStyles();
  const [avalanche, setAvalanche] = useState(null)
  const containerRef = useRef(null);

  //init
  useEffect(() => {
    if(!containerRef.current){return; }
    setAvalanche(() => avalancheGenerator())
  }, [])

  //update
  useEffect(() => {
      if(!containerRef.current || !avalanche){return; }

      avalanche.width(width).height(height);
      console.log("calling av")
      d3.select(containerRef.current).call(avalanche)

  }, [width, height, avalanche])

  const pathStyle = {stroke:"#000000", strokeWidth:"1px", fill:"none"}

  return (
    <div className={classes.root} >
      <div className={classes.contextMenu} >
        MENU
      </div>
        <svg 
          className={classes.svg} 
          width={width} 
          height={height} 
          id="avalanche" ref={containerRef}>
              <g id="yeti-container">
                <Yeti width={50} height={30} />
              </g>
              <g id="mountain-container">
                <Mountain width={width} height={height * 0.5} />
              </g>
          </svg>
    </div>
  )
}

Avalanche.defaultProps = {
}

export default Avalanche
