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

const layout = milestonesLayout();
const milestonesBar = milestonesBarComponent();

const MilestonesBar = ({ data, datasets, kpiFormat, setKpiFormat, onSelectKpiSet, onCreateMilestone, onDeleteMilestone, takeOverScreen, releaseScreen, screen, availWidth, availHeight }) => {
  const { player, profiles, contracts } = data;
  //console.log("MBar............................................")
  //local state
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);
  const [bgMenuLocation, setBgMenuLocation] = useState("");
  const [sliderEnabled, setSliderEnabled] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  console.log("sel", selectedMilestone)

  const bottomCtrlsBarHeight = screen.isLarge ? DIMNS.milestonesBar.ctrls.height : 0;
  let styleProps = { bottomCtrlsBarHeight, sliderEnabled };
  const classes = useStyles(styleProps) ;
  const containerRef = useRef(null);

  //init
  useEffect(() => {
    if(!containerRef.current){return; }

    //remove all this and use margin convention in milestoneBarComponent
    //just pass availwidth
    /*
    const width = availWidth;
    console.log("maxh", DIMNS.milestonesBar.maxHeight)
    console.log("availH", availHeight)
    console.log("bottomCtrlH", bottomCtrlsBarHeight)
    */
    const totalAvailHeightStr = d3.select("div.milestone-bar-root").style("height");
    const totalAvailHeight = totalAvailHeightStr.slice(0, totalAvailHeightStr.length - 2);
    const height = d3.min([DIMNS.milestonesBar.maxHeight, totalAvailHeight - bottomCtrlsBarHeight])
    //console.log("totalAvailHeight", totalAvailHeight)
    //console.log("height", height)
    /*const marginTop = selectedMilestone ? 0 : 0;
    const marginBottom = selectedMilestone ? 0 : 20;
    const _availHeight = totalAvailHeight - marginTop - marginBottom;
    console.log("_av", _availHeight)
    const height = d3.min([DIMNS.milestonesBar.maxHeight, _availHeight - bottomCtrlsBarHeight])
    console.log("height", height)

    const containerHeight = d3.select(containerRef.current).attr("height")
    console.log("MBar containerHeight", containerHeight)
    console.log("overlay h", d3.select("div.overlay").style("height"))*/
  
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(player);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles/*, ...contracts*/], d => d.date);
    //console.log("ordered", orderedData)
    d3.select(containerRef.current)
      .datum(layout(orderedData))
      .call(milestonesBar
          .width(availWidth)
          .height(height)
          .swipable(!screen.isLarge && !selectedMilestone)
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

  }, [profiles.length, JSON.stringify(screen), selectedMilestone/*JSON.stringify(contracts), JSON.stringify(profiles), JSON.stringify(datasets), player, kpiFormat, screen*/])

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
  profiles:[]
}

export default MilestonesBar;
