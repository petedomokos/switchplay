import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
//import Button from '@material-ui/core/Button'
import { DIMNS, FONTSIZES, grey10 } from './constants';

const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    height:DIMNS.profile.height,
    background:"aqua"
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

const MilestonesBar = ({ contracts, profiles }) => {
  //console.log("Milestones", profiles)
  let styleProps = {}
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);

  //init
  useEffect(() => {
    if(!containerRef.current){return; }

  }, [])

  useEffect(() => {
    if(!containerRef.current){return; }

    //const prod3.select(containerRef.current)
      //.datum({ ...data, channels, userInfo, userKpis, datasets })
      //.datum({ canvas, aims, planets, links, channels, measures })
      //.call(journey)

  })

  return (
    <div className={classes.root}>
        <svg className={classes.svg} ref={containerRef}></svg>
        <div className={classes.ctrls}>
        </div>
    </div>
  )
}

MilestonesBar.defaultProps = {
  contracts:[],
  profiles:[]
}

export default MilestonesBar;
