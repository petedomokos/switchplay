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
    height:DIMNS.milestonesBar.ctrls.height,
    alignSelf:"center",
    display:props => props.sliderEnabled ? "flex" : "none",
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

//helpers
const sortAscending = (data, accessor =  d => d) => {
  const dataCopy = data.map(d => d);
  return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
};
const scaleDimn = (dimn, k) => dimn * k;
const scaleDimns = (dimns, k) => ({
    width:dimns.width * k,
    height:dimns.height * k,
    margin:{
        left:dimns.margin.left * k,
        right:dimns.margin.left * k,
        top:dimns.margin.left * k,
        bottom:dimns.margin.left * k
    }
})

const layout = milestonesLayout();
const milestonesBar = milestonesBarComponent();

const MilestonesBar = ({ contracts, profiles, datasets, userInfo, kpiFormat, setKpiFormat, onSelectKpiSet, screen }) => {
  console.log("MBar", contracts, profiles)
  //local state
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);
  const [bgMenuLocation, setBgMenuLocation] = useState("");
  const [sliderEnabled, setSliderEnabled] = useState(true);

  const bottomCtrlsBarHeight = 100;
  const height = d3.min([DIMNS.milestonesBar.height, screen.height - bottomCtrlsBarHeight])
  let styleProps = { height, sliderEnabled };
  const classes = useStyles(styleProps) ;
  const containerRef = useRef(null);

  const k = height / DIMNS.milestonesBar.height;
  const scale = dimns => scaleDimns(dimns, k);
  const contractDimns = scale(DIMNS.milestonesBar.contract);
  const profileCardDimns = scale(DIMNS.milestonesBar.profile);
  const kpiListHeight = scaleDimn(DIMNS.milestonesBar.list.height, k);
  //init
  useEffect(() => {
    if(!containerRef.current){return; }
  
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(userInfo);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles/*, ...contracts*/], d => d.date);

    d3.select(containerRef.current)
      .datum(layout(orderedData))
      .call(milestonesBar
          .width(screen.width)
          .height(kpiListHeight)
          .profileCardDimns(profileCardDimns)
          .contractDimns(contractDimns)
          .fontSizes({
            //@todo - replace with styles, and fix so we dont have to increase k by 2.5
            profile: FONTSIZES.profile(k * 2.5),
            contract: FONTSIZES.contract(k * 2.5)
          })
          .onSetKpiFormat(setKpiFormat)
          .onSelectKpiSet((e,kpi) => { onSelectKpiSet(kpi); })
          .onToggleSliderEnabled(() => setSliderEnabled(prevState => !prevState))
          .onCreateMilestone(function(e,d){
            /*console.log("placeholder", e, d)
            if(!bgMenuLocation){
              setBgMenuLocation(e.x);
            }else{
              //get the two dates either side of it, and find middle
              //addProfile
            }*/
          })
          .onMouseover(function(e,d){
            //console.log("mover")
          })
          .onMouseout(function(e,d){
            //console.log("mout")
          }))

  })

  console.log("kpiListH", kpiListHeight)
  return (
    <div className={classes.root}>
        <div style={{background:"black" }}>
          <svg className={classes.svg} ref={containerRef} width="100%" height={kpiListHeight}></svg>
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
