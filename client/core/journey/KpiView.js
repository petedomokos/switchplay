import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import kpisLayout from "./kpisLayout";
import kpisComponent from "./kpisComponent";
import { grey10 } from './constants';


const useStyles = makeStyles((theme) => ({
  root: {
    width:props => props.width,
    height:props => props.height,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    position:"relative",
    overflow:"scroll"
  },
  header:{
    width:"100%",
    height:props => props.headerHeight,
    padding:"0px 10px 0px 10px",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },
  svg:{
    //position:"absolute"
  },
  name:{
    color:grey10(2)
  },
  closeIcon:{
    color:grey10(2)
  }
}))

const sortAscending = (data, accessor =  d => d) => {
    const dataCopy = data.map(d => d);
    return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
};

const dateFormat = d3.timeFormat("%_d %b, %y")

const layout = kpisLayout();
const kpis = kpisComponent();
const KPI_HEIGHT = 80;

const KpiView = ({ name, desc, data, datasets, initSelectedId, width, height, format, onClose }) => {
    const headerHeight = d3.min([height * 0.15, 45]);
    const svgWidth = d3.min([width, 600]);
    const svgHeight = height - headerHeight;
    //this determines if overflow scroll is needed here - 180 is an estimate
    const actualKpisHeight = d3.max([svgHeight, data.length * 180])

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
              .kpiHeight(KPI_HEIGHT)
              .styles({ 
                kpi:{ 
                    name: { 
                      stroke:grey10(3)
                    },
                    bars:{
                      target:{
                        opacity:0.1
                      }
                    }
                }
              })
              .selected(selectedId)
              //todo - use d3 date format
              .getName(d => dateFormat(d.date))
              .onClickKpi((e, d) => { setSelectedId(d.id); }), { log:true })
    })

    return (
        <div className={classes.root}>
            <div className={classes.header}>
              <div className={classes.name}>{name}</div>
              <IconButton aria-label="Close" onClick={onClose}>
                <CloseIcon className={classes.closeIcon}/>
              </IconButton>
            </div>
            <svg className={classes.svg} ref={containerRef} width={svgWidth} height={actualKpisHeight}></svg>
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
