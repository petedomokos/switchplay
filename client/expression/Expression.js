import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles';
import expressionBuilder from "./expressionBuilder";
import expressionLayout from "./expressionLayout";
import { COLOURS, DIMNS } from "./constants";
import { mockData } from "./mockData";
import { getInstances, planetsData } from './data';

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

const Expression = ({}) => {
  const styleProps = { };
  const classes = useStyles();
  //should be ref as not changing
  const [expBuilder, setExpBuilder] = useState(undefined)
  const [nodes, setNodes] = useState(mockData().nodes)//useState([])
  const [links, setLinks] = useState(mockData().links)//useState([])
  const [layout, setLayout] = useState([])

  const containerRef = useRef(null);

  //dimns
  const { width, height } = DIMNS.svg;
  //init
  useEffect(() => {
      if(!containerRef.current){return; }
      setExpBuilder(() => expressionBuilder())
      setLayout(() => expressionLayout())
  }, [])

  //update data
  useEffect(() => {
      if(!containerRef.current || !expBuilder){return; }

      //const data = layout({nodes, links})
      //console.log("data", data)
      expBuilder
        .width(width)
        .height(height)
        .planetsData(planetsData.map(p => ({ ...p, instances:getInstances(p.id) })))
        
      d3.select(containerRef.current).datum(layout({nodes, links})).call(expBuilder)

  }, [nodes, links, expBuilder])

  return (
    <div className={classes.root} >
        <svg 
          className={classes.svg} 
          width={width} 
          height={height} 
          id="exp1" ref={containerRef}></svg>
    </div>
  )
}

Expression.defaultProps = {
}

export default Expression
