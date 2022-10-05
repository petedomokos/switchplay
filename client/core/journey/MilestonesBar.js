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
    height:DIMNS.milestonesBar.height,
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
    width:DIMNS.milestonesBar.ctrls.width,
    height:DIMNS.milestonesBar.ctrls.height,
    alignSelf:"center",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },
  iconBtn:{
    color:grey10(2),
  },
  icon:{
    width:40,
    height:40,
  }
}))

const sortAscending = (data, accessor =  d => d) => {
  const dataCopy = data.map(d => d);
  return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
};

const layout = milestonesLayout();
const milestonesBar = milestonesBarComponent();

const MilestonesBar = ({ contracts, profiles, datasets, userInfo, kpiFormat, kpis }) => {
  //console.log("Milestones", profiles)
  const milestones = [...contracts]
  let styleProps = {}
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);

  const profileCardDimns = DIMNS.milestonesBar.profile;
  const contractDimns = DIMNS.milestonesBar.contract;
  const barHeight = DIMNS.milestonesBar.height;
  const milestoneWidth = milestone => milestone.dataType === "profile" ? profileCardDimns.width: contractDimns.width;
  const milestoneHeight = milestone => milestone.dataType === "profile" ? profileCardDimns.height: contractDimns.height;

  //need to remove teh journey svg as I think it is sitting on top of this and stopping hover and click events
  //set display to none for journey
  //init
  useEffect(() => {
    if(!containerRef.current){return; }
  
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(userInfo)
      .kpis(kpis);

    //profiles go before contarcts of same date
    const orderedData = sortAscending([ ...profiles, ...contracts ], d => d.date);

    d3.select(containerRef.current)
      .datum(layout(orderedData))
      .call(milestonesBar
          .height(DIMNS.milestonesBar.list.height)
          .milestoneWidth(milestoneWidth))
  })

  return (
    <div className={classes.root}>
        <svg className={classes.svg} ref={containerRef} width="100%" height={DIMNS.milestonesBar.list.height}></svg>
        <div className={classes.ctrls}>
          <IconButton className={classes.iconBtn}
              aria-label="Home" >
              <ArrowBackIosIcon onClick={milestonesBar.slideBack}
                  className={classes.icon}/>
          </IconButton>
          <IconButton className={classes.iconBtn}
              aria-label="Home" >
              <ArrowForwardIosIcon onClick={milestonesBar.slideForward}
                  className={classes.icon}/>
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
