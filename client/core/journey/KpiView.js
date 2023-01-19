import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import kpisLayout from "./kpis/kpisLayout";
import kpisComponent from "./kpis/kpisComponent";
import { grey10, STYLES, KPI_CTRLS } from './constants';


const useStyles = makeStyles((theme) => ({
  root: {
    display:"flex",
    flexDirection:"column",
    //justifyContent:"center",
    alignItems:"center",
    position:"relative",
    overflow:"scroll",
  },
  header:{
    width:"100%",
    height:props => props.headerHeight,
    padding:"0px 10px 0px 40px",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },
  svg:{
  },
  footer:{
    width:"100%",
    height:props => props.footerHeight,
    padding:"0px 10px 0px 10px",
    display:"flex",
    justifyContent:"space-between",
  },
  name:{
    color:grey10(2)
  },
  closeIcon:{
    color:grey10(2)
  }
}))

const dateFormat = d3.timeFormat("%_d %b, %y")

//const layout = kpisLayout();
//const kpis = kpisComponent();
const KPI_HEIGHT = 80;

const KpiView = ({ name, desc, data, datasets, initSelectedKey, width, height, format, onClose }) => {
  //console.log("KpiView data", data)
  /*
  todo - sort height/overflow out so svgCont is a div with fixed height, and teh 
  svg scrolls within that, but footer is fixed to bottom 
  part of screen with kpi ctrls
  alternatively, just use d3 zoom to make kpisCompinent scrollable
  //note - we can set the d3 zoom to do specific actions on mousewheel, so it just pans
  as long as zoom is set on something lower than teh drag stuff in kpis. so if we set zoom
  on kpis listG tehn that should be the right one, perhaps with a bg rect
    */
    const headerHeight = d3.min([height * 0.15, 45]);
    const footerHeight = d3.min([height * 0.15, 45]);

    let styleProps = { headerHeight, footerHeight }
    const classes = useStyles(styleProps) 
    const containerRef = useRef(null);
    //note - keys are kpiSets here
    const [selectedKey, setSelectedKey] = useState(initSelectedKey);

    //init
    useEffect(() => {
        if(!containerRef.current){return; }

        const svgWidth = d3.min([width, 600]);
        const svgHeight = height - headerHeight - footerHeight;
    
        layout
          .format(format)
          .datasets(datasets);

        d3.select(containerRef.current)
          .attr("width", svgWidth)
          .attr("height", svgHeight)
          .datum(layout(data))
          .call(kpis
              .width(svgWidth)
              .height(svgHeight)
              .kpiHeight(KPI_HEIGHT)
              .styles(STYLES.kpiView.kpis)
              .editable(true)
              .selected(selectedKey)
              //todo - use d3 date format
              //need to pass getName into layout and the set name instead as a property in kpiLayout
              .getName(d => dateFormat(d.date))
              //also, turn updateDimns etc into a funciton that is dynamic, turn
              //all settings like width into functions od d, and make kpiComponent
              //able to tae mulitple kpis
              .onClickKpi((e, kpi) => {
                kpis.selected(kpi.key, true);
              }), { log:true })
    })

    return (
        <div className={classes.root}>
            <div className={classes.header}>
              <div className={classes.name}>{name}</div>
              <IconButton aria-label="Close" onClick={onClose}>
                <CloseIcon className={classes.closeIcon}/>
              </IconButton>
            </div>
            <svg className={classes.svg} ref={containerRef}></svg>
            <div className={classes.footer}></div>
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
