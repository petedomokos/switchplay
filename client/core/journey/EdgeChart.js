import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles';
import edgeChartLayout from '../../visuals/edgeChartLayout';
import edgeChartComponent from '../../visuals/edgeChartComponent';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:"90%",
    height:"90%",
    display:"flex",
    flexDirection:"column",
    //border:"solid",
    //borderColor:"blue"
  },
  svg:{
  }
}))

const EdgeChart = ({ data, screen, availWidth, availHeight }) => {
  console.log("Edge Chart")
    const [layout, setLayout] = useState(() => edgeChartLayout());
    const [edgeChart, setEdgeChart] = useState(() => edgeChartComponent());

    let styleProps = { }
    const classes = useStyles(styleProps) 
    const containerRef = useRef(null);

  //keypresses
  useEffect(() => {
    d3.select("body").on("keypress", (e) => {
      if(e.keyCode === "13" || e.key === "Enter"){
        e.preventDefault();
      }
    })
  }, [])

  useEffect(() => {
    d3.select(containerRef.current).datum(layout(data))
  }, [JSON.stringify(data)])


  //render
  useEffect(() => {
    d3.select(containerRef.current).call(edgeChart
        .width(availWidth)
        .height(availHeight));

    //console.log("svg", containerRef.current)
  })


  return (
    <div className={`visual edge-chart-root ${classes.root}`}>
      <svg className={classes.svg} ref={containerRef} id={`edge-chart`}>
        <defs></defs>
      </svg>
    </div>
  )
}

EdgeChart.defaultProps = {
  data:[]
}

export default EdgeChart;