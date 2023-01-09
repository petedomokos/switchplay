import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
//import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
//import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
//import Button from '@material-ui/core/Button'
import milestonesLayout from "./milestonesLayout";
import milestonesBarComponent from "./milestonesBarComponent";
import { DIMNS, FONTSIZES, grey10 } from './constants';
import { sortAscending } from '../../util/ArrayHelpers';


const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    height:props => props.height,
    display:"flex",
    flexDirection:"column",
    //marginLeft:DIMNS.profiles.margin.left, 
    //marginRight:DIMNS.profiles.margin.right,
    //marginTop:DIMNS.profiles.margin.top, 
    //marginBottom:DIMNS.profiles.margin.bottom
  },
  svg:{
    //position:"absolute"
  },
  ctrls:{
    width:"100%",//DIMNS.milestonesBar.ctrls.width,
    height:props => props.bottomCtrlsBarHeight,
    alignSelf:"center",
    display:props => props.sliderEnabled && props.bottomCtrlsBarHeight !== 0 ? "flex" : "none",
    justifyContent:"center",
    alignItems:"center",
  },
  iconBtn:{
    color:grey10(2),
    marginLeft:"10px",
    marginRight:"10px"
  },
  icon:{
    width:40,
    height:40,
  }
}))

const layout = milestonesLayout();
const milestonesBar = milestonesBarComponent();

const MilestonesBar = ({ data, datasets, kpiFormat, setKpiFormat, onSelectKpiSet, onCreateMilestone, onDeleteMilestone, takeOverScreen, releaseScreen, screen, availWidth, availHeight }) => {
  const { player, profiles, contracts } = data;
  //console.log("MBar profiles", profiles)
  //local state
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);
  const [bgMenuLocation, setBgMenuLocation] = useState("");
  const [sliderEnabled, setSliderEnabled] = useState(true);

  const width = availWidth;
  const bottomCtrlsBarHeight = screen.isLarge ? DIMNS.milestonesBar.ctrls.height : 0;
  const height = d3.min([DIMNS.milestonesBar.maxHeight, availHeight - bottomCtrlsBarHeight])
  let styleProps = { bottomCtrlsBarHeight, height, sliderEnabled };
  const classes = useStyles(styleProps) ;
  const containerRef = useRef(null);

  //init
  useEffect(() => {
    if(!containerRef.current){return; }
  
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(player);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles/*, ...contracts*/], d => d.date);
    //console.log("ordered", orderedData)

    const processedData = layout(orderedData);
    //console.log("processedData", processedData);
    d3.select(containerRef.current)
      .datum(layout(orderedData))
      .call(milestonesBar
          .width(width)
          .height(height)
          .swipable(!screen.isLarge)
          .styles({
            phaseLabel:{

            },
            profile:{
              
            },
            contract:{

            }
          })
          //.height(kpiListHeight)
          //.profileCardDimns(profileCardDimns)
          //.contractDimns(contractDimns)
          .onTakeOverScreen(takeOverScreen)
          .onReleaseScreen(releaseScreen)
          .onSetKpiFormat(setKpiFormat)
          .onSelectKpiSet((e,kpi) => { 
            onSelectKpiSet(kpi); 
          })
          .onToggleSliderEnabled(() => setSliderEnabled(prevState => !prevState))
          .onCreateMilestone(onCreateMilestone)
          .onDeleteMilestone(onDeleteMilestone)
          //.onCreateMilestone(function(e,d){
            //if(!bgMenuLocation){
             // setBgMenuLocation(e.x);
            //}else{
              //get the two dates either side of it, and find middle
              //addProfile
            //}
          //})
          .onMouseover(function(e,d){
            //console.log("mover")
          })
          .onMouseout(function(e,d){
            //console.log("mout")
          }))

  }, [profiles.length/*JSON.stringify(contracts), JSON.stringify(profiles), JSON.stringify(datasets), player, kpiFormat, screen*/])

  return (
    <div className={classes.root}>
        <div>
          <svg className={classes.svg} ref={containerRef} width="100%" height={height}></svg>
        </div>
        <div className={classes.ctrls}>
          <IconButton className={classes.iconBtn} onClick={milestonesBar.slideBack}
              aria-label="Home" >
              <ArrowBackIosIcon className={classes.icon}/>
          </IconButton>
          <IconButton className={classes.iconBtn} onClick={milestonesBar.slideForward}
              aria-label="Home" >
              <ArrowForwardIosIcon className={classes.icon}/>
          </IconButton>
        </div>
    </div>
  )
}

MilestonesBar.defaultProps = {
  contracts:[],
  profiles:[]
}

export default MilestonesBar;
