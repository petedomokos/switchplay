import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
//import Button from '@material-ui/core/Button'
import milestonesLayout from "./milestonesLayout";
import milestonesBarComponent from "./milestonesBarComponent";
import { DIMNS, FONTSIZES, grey10 } from './constants';


const useStyles = makeStyles((theme) => ({
  root: {
    width:400,//"100%",
    height:DIMNS.milestonesBar.height,
    border:"solid",
    borderColor:"yellow",
    overflow:"scroll"
    //marginLeft:DIMNS.profiles.margin.left, 
    //marginRight:DIMNS.profiles.margin.right,
    //marginTop:DIMNS.profiles.margin.top, 
    //marginBottom:DIMNS.profiles.margin.bottom
  },
  svg:{
    //position:"absolute"
  },
  btn:{
    width:DIMNS.ctrls.btnWidth,
    height:DIMNS.ctrls.btnHeight,
    marginRight:"5px",
    fontSize:FONTSIZES.ctrls.btn,
  }
}))

const sortAscending = (data, accessor =  d => d) => {
  const dataCopy = data.map(d => d);
  return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
};

const layout = milestonesLayout();
const milestonesBar = milestonesBarComponent();

const MilestonesBar = ({ contracts, profiles, datasets, userInfo, kpiFormat, kpis }) => {
  //console.log("Milestones", profiles)
  let styleProps = {}
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);

  //init
  useEffect(() => {
    if(!containerRef.current){return; }
  
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(userInfo)
      .kpis(kpis);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles, ...contracts ], d => d.date);

    d3.select(containerRef.current)
      .datum(layout(orderedData))
      .call(milestonesBar
          .height(DIMNS.milestonesBar.height));
  })

  return (
    <div className={classes.root}>
        <svg className={classes.svg} ref={containerRef} width="100%" height={DIMNS.milestonesBar.height}></svg>
        {/**<div className={classes.ctrls}></div>*/}
    </div>
  )
}

MilestonesBar.defaultProps = {
  contracts:[],
  profiles:[]
}

export default MilestonesBar;
