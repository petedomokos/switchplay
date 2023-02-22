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
    //couldnt the height just be the full journey height always for now?
    //until we allow a bar to be shown above the jorney canvas
    //border:"2px solid #C0C0C0",
    width:"100%",
    height:"100%",//props => props.height,
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

const MilestonesBar = ({ data, datasets, kpiFormat, setKpiFormat, onSelectKpiSet, onCreateMilestone, onDeleteMilestone, takeOverScreen, releaseScreen, screen, availWidth, availHeight, onSaveValue }) => {
  const { player={}, profiles=[], contracts=[] } = data;
  //console.log("MBar", profiles)
  //local state
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);
  const [bgMenuLocation, setBgMenuLocation] = useState("");
  const [sliderEnabled, setSliderEnabled] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState("");

  const [layout, setLayout] = useState(() => milestonesLayout());
  const [milestonesBar, setMilestonesBar] = useState(() => milestonesBarComponent());

  const bottomCtrlsBarHeight = screen.isLarge ? DIMNS.milestonesBar.ctrls.height : 0;
  let styleProps = { bottomCtrlsBarHeight, sliderEnabled };
  const classes = useStyles(styleProps) ;
  const containerRef = useRef(null);

  const stringifiedProfiles = JSON.stringify(profiles);

  //init
  //decide what needs to update on setSelectedMilestone, and only have that inteh depArray 
  //or alternatively only have that processed in milestoneslayout/kpiLayout
  //so we are not doing teh epensive operations each time
  useEffect(() => {
    //console.log("data useEffect")

    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(player);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles, ...contracts], d => d.date);

    d3.select(containerRef.current).datum(layout(orderedData))

  }, [stringifiedProfiles])

  useEffect(() => {

    const totalAvailHeightStr = d3.select("div.milestone-bar-root").style("height");
    const totalAvailHeight = totalAvailHeightStr.slice(0, totalAvailHeightStr.length - 2);
    const height = d3.min([DIMNS.milestonesBar.maxHeight, totalAvailHeight - bottomCtrlsBarHeight])

    milestonesBar
      .width(availWidth)
      .height(height)
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
      .onSetSelectedMilestone(setSelectedMilestone)
      .onSetKpiFormat(setKpiFormat)
      .onSelectKpiSet((e,kpi) => { 
        onSelectKpiSet(kpi); 
      })
      .onToggleSliderEnabled(() => setSliderEnabled(prevState => !prevState))
      .onCreateMilestone(onCreateMilestone)
      .onDeleteMilestone(onDeleteMilestone)
      .onSaveValue(onSaveValue)
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
      })//)

  }, [stringifiedProfiles, screen])

  useEffect(() => {
    //@todo - on ms and ss, we want it to always be swipable so get rid of 1st condition below,
    //and get swipe working well with scroll. Currently this doesnt happen.
    milestonesBar.swipable((selectedMilestone || screen.isLarge ? false : true))
  }, [selectedMilestone, screen.isLarge])

  //render
  //@todo - consider having a shouldRender state, and this could also contain info on transition requirements
  useEffect(() => {
    //console.log("render useEffect")

    d3.select(containerRef.current).call(milestonesBar);
  }, [selectedMilestone, stringifiedProfiles, screen])

// clean up
useEffect(() => {
  /*
  const a = 5 //-1;
  const b = 0//5; we want small b as this is the constant increase component
  const c = 10;

  //const f = t => a * t * t + b * t + c;
  const f = t => t <= 0 ? c : 1/(a * t) + c
  const targs = d3.range(5).map(t => ([t, f(t), f(t-1) - f(t)]))
  console.log("targs", targs)*/
  
  return () => {
      //console.log('Do some cleanup!!!');
  }
}, [])

  return (
    <div className={`milestone-bar-root ${classes.root}`}>
        <svg className={classes.svg} ref={containerRef}></svg>
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
  profiles:[],
  data: { },
  datasets: [], 
  kpiFormat: "actual", 
  setKpiFormat: () => {},
  onSelectKpiSet: () => {},
  onCreateMilestone: () => {},
  onDeleteMilestone: () => {}, 
  takeOverScreen: () => {}, 
  releaseScreen: () => {}, 
  screen: {},
  availWidth: 0, 
  availHeight: 0,
  onSaveValue: () => {}
}

export default MilestonesBar;