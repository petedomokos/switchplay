import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import QuadrantBarChart from './quadrantBarChart/QuadrantBarChart';
//mockData
import { quadrantBarChartsData, musicalMapData } from './mockVisualsData';

const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    //height:"100vh", //window._screen.height,//* 0.7,
    paddingTop:"80px",
    paddingBottom:"200px",
    background:"white"
  },
  items:{
    border:"solid",
    borderWidth:"thin"
  },
  musicalMapContainer:{
    width:"600px",
    height:"500px",
    border:"solid",
    borderWidth:"thin"
  },
  quadBarChartContainer:{
    width:"600px",
    height:"450px",
    border:"solid",
    borderWidth:"thin"
  }
}))
  
const Visuals = ({ screen }) => {
  const [importState, setImportState] = useState("");
  const styleProps = { importState };
  const classes = useStyles(styleProps) 

  useEffect(() => {
  }, [])
      
  return (
    <div className={classes.root}>
      <div className={classes.items}>
        <div className={classes.quadBarChartContainer}>
          <QuadrantBarChart data={quadrantBarChartsData} settings={{ nrRows: 2 }} />
        </div>
      </div>
    </div>
  )
}

export default Visuals;

Visuals.defaultProps = {
}
