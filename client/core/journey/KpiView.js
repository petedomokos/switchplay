import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import kpisLayout from "./kpisLayout";
import kpisComponent from "./kpisComponent";
import { DIMNS, FONTSIZES, grey10 } from './constants';


const useStyles = makeStyles((theme) => ({
  root: {
    width:props => props.width,
    height:props => props.height,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center"
  },
  header:{
    width:"100%",
    height:props => props.headerHeight
  },
  svg:{
    //position:"absolute"
  }
}))

const sortAscending = (data, accessor =  d => d) => {
    const dataCopy = data.map(d => d);
    return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
};

const dateFormat = d3.timeFormat("%_d %b, %y")

const layout = kpisLayout();
const kpis = kpisComponent();

const KpiView = ({ name, desc, data, datasets, initSelectedId, width, height, format }) => {
    console.log("kpiView initSelected", initSelectedId)
    console.log("data", data)
    const headerHeight = d3.min([height * 0.15, 45]);
    const svgWidth = d3.min([width, 600]);
    const svgHeight = height - headerHeight;
    let styleProps = { width, svgHeight, headerHeight }
    const classes = useStyles(styleProps) 
    const containerRef = useRef(null);
    const [selectedId, setSelectedId] = useState(initSelectedId);

    //init
    useEffect(() => {
        if(!containerRef.current){return; }
    
        layout
          .format(format)
          .datasets(datasets)

        const orderedData = sortAscending(data, d => d.date);

        d3.select(containerRef.current)
          .datum(layout(orderedData))
          .call(kpis
              .width(svgWidth)
              .height(svgHeight)
              .kpiHeight(80)
              .selected(selectedId)
              //todo - use d3 date format
              .getName(d => dateFormat(d.date))
              .onClickKpi((e, d) => { setSelectedId(d.id); }), { log:true })
    })

    return (
        <div className={classes.root}>
            <div className={classes.header}></div>
            <svg className={classes.svg} ref={containerRef} width={svgWidth} height={svgHeight}></svg>
        </div>
    )
}

KpiView.defaultProps = {
  name:"",
  desc:"",
  data:[],
  initSelectedMilestoneId:""
}

export default KpiView;
