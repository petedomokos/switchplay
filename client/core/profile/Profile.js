import React, { useState, useEffect, useRef } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import { mockProfileData } from './mockData';
import quadrantBarChartComponent from './quadrantBarChartComponent';
import quadrantBarChartLayout from './quadrantBarChartLayout';

const useStyles = makeStyles((theme) => ({
  root: {
      margin:"50px",
      width:600,
      height:500,
  }
}))

const Profile = () => {
    const classes = useStyles();
    const containerRef = useRef(null);
    const [quadrantBarChart, setQuadrantBarChart] = useState(null);

    //init
    useEffect(() => {
        if(!containerRef.current){return; }
        const quadrantBarChart = quadrantBarChartComponent();
        setQuadrantBarChart(() => quadrantBarChart);
    }, [])

  useEffect(() => {
    if(!containerRef.current || !quadrantBarChart){return; }

    const chartWidth = 600;
    const chartHeight = 500;

    const layout = quadrantBarChartLayout();

    d3.select(containerRef.current)
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .datum(layout(mockProfileData))
      .call(quadrantBarChart
          .width(chartWidth)
          .height(chartHeight))
  })

  return (
    <div className={classes.root}>
        <svg className={classes.svg} ref={containerRef}></svg>
    </div>
  )
}

Profile.defaultProps = {
  screen:{}
}

export default Profile
