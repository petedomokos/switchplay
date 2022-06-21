import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
//charts
//@TODO store charts in dashboard as state so dont have to improt all of them each time here
//or use equivalent of require in code to improt lazily
import timeSeries from "../charts/timeseries/timeSeries";
import beeSwarm from "../charts/beeswarm/beeSwarm";
//children
//helpers

const useStyles = makeStyles((theme) => ({
  root: {
    margin: theme.spacing(2) +"px " +theme.spacing(1) +"px",
    height:"calc(100% - "+theme.spacing(4) +"px)",
    width:"calc(100% - "+theme.spacing(2) +"px)",
    //border:'solid',
    //borderColor:"blue",
    display:"flex",
    flexDirection:"column"
  },
  title:{
    fontSize:"12px",
    flex:"5vh 0 0",
    minHeight:"30px",
  },
  svg:{
    width:"100%",
    flex:"90% 1 1",
    alignSelf:"center",
    //border:'solid',
    //borderColor:"black"
  }
}))

  //@TODO - consider using viewbox instead fro timeSeries as AR should be constant, but not for beeSwarms
  const calculateSizes = container => {
    const width = container.getBoundingClientRect().width;
    const height = container.getBoundingClientRect().height;
    const margin = { left:50, right:25, top:25, bottom:50 };
    return {
        width,
        height,
        margin,
        chartWidth:width - margin.left - margin.right,
        chartHeight:height - margin.top - margin.bottom
    }
  }

const PlayerDashboardChartWrapper= ({chartType, data, settings}) => {
  //console.log("data", data)
  const classes = useStyles()
  const [chart, setChart] = useState(null);
  const [sizes, setSizes] = useState(null);
  const containerRef = useRef(null);
  //render chart
  useEffect(() =>{
      if(!chart){
        //init
        const requiredChart = chartType === "beeSwarm" ? beeSwarm() : timeSeries();
        setChart(() => requiredChart)
        setSizes(calculateSizes(containerRef.current))
      }else{
        //settings
          if(chartType === "beeSwarm"){
            chart
              .sizes(sizes)
          }else{
            chart
              .sizes(sizes)
              .timeDomain(settings.timeDomain)
          }
          //call chart
          const svg =  d3.select(containerRef.current)
          svg
            .datum(data)
            .call(chart)
      }
  })

  return (
    <div className={classes.root}>
      <Typography variant="h6" className={classes.title}>
          {data.name}
      </Typography>
      <svg ref={containerRef} className={classes.svg}></svg>
    </div>
  )
}

PlayerDashboardChartWrapper.defaultProps = {
  settings:{}
}

export default PlayerDashboardChartWrapper;


