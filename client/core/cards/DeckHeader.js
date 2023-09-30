import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import deckLayout from './deckLayout';
import deckComponent from "./deckComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
const { GOLD } = COLOURS;



const useStyles = makeStyles((theme) => ({
  root:{
    width:props => props.contentsWidth,
    height:props => props.contentsHeight,
    padding:props => props.padding,
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    fontSize:props => props.fontSize,
    transition: `all ${TRANSITIONS.MED}ms`,
    /*border:"solid",
    borderColor:"white",
    borderWidth:"thin"*/
  },
  title:{
    color:grey10(6),
    //@todo - sort positions of header contents properly, thi sis just a workaround
    //marginBottom:20, 
  },
  progressIcon:{
    width:props => props.progressIcon.width,
    height:props => props.progressIcon.height,
    //transform:"translate(20px, -35px)",
    //transform:props => `scale(${props.progressIcon.scale})`,
    transformOrigin:"center left",
    transition: `all ${TRANSITIONS.MED}ms`,
    /*border:"solid",
    borderWidth:"thin",
    borderColor:"aqua"*/
  },
}))

const DeckHeader = ({ user, data, selectedDeckId, scale, datasets, asyncProcesses, width, height, onClick, update }) => {
  const [form, setForm] = useState(null);

  const margin = {
    hoz:width * 0.15,
    vert:height * 0.1//selectedDeckId ? headerHeight * 0.05 : headerHeight * 0.1
  }
  const contentsWidth = width - 2 * margin.hoz;
  const contentsHeight = height - 2 * margin.vert;
  
  const titleFontSize = contentsHeight * 0.35;
  const minTitleFontSize = 10;
  const scaledMinTitleFontSize = minTitleFontSize / scale;

  const progressIconHeight = contentsHeight * 0.6;// d3.min([width * 0.2, headerHeight]);
  const progressIconWidth = progressIconHeight;
  let styleProps = {
    left:0,
    top:0,
    width,
    height,
    contentsWidth,
    contentsHeight,
    fontSize:d3.max([scaledMinTitleFontSize, titleFontSize]),
    padding:`${margin.vert}px ${margin.hoz}px`,
    progressIcon:{
      width:progressIconWidth,
      height:progressIconHeight,
      //scale:selectedDeckId ? 1 : 1.7,
    },
    form:{ 
      display: form ? null : "none",
    }
  };
  const classes = useStyles(styleProps) 
  const progressIconRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  const onClickProgress = (e) => {
    //console.log("click progress");
    e.stopPropagation();

  }
  const onClickTitle = (e) => {
    //console.log("click title");
    e.stopPropagation();
  }

  useEffect(() => {
    //dimns
    const extraVertSpace = height - progressIconHeight;
    const progressIconMargin = { 
      left:progressIconWidth * 0.1, 
      right:progressIconWidth * 0.1,
      top:progressIconHeight * 0.1 + extraVertSpace/2, 
      bottom:progressIconHeight * 0.1 + extraVertSpace/2
    }
    const progressIconContentsWidth = progressIconWidth - progressIconMargin.left - progressIconMargin.right;
    const progressIconContentsHeight = progressIconHeight - progressIconMargin.top - progressIconMargin.bottom;
    
    const actualIconWidth = 80; //???
    const iconScale = progressIconContentsWidth/actualIconWidth;
    const hozIconShift = 0;// -progressIconContentsWidth * 0.2;
    const vertIconShift = 0;// hozIconShift;

    //enter-update
    const iconSvg = d3.select(progressIconRef.current).selectAll("svg.deck-progress").data([1]);
    iconSvg.enter()
      .append("svg")
        .attr("class", "deck-progress")
        .attr("pointer-events", "none")
        .each(function(){
          d3.select(this).append("path")
            .attr("transform", `translate(${hozIconShift},${vertIconShift}) scale(${iconScale})`)
        })
        .merge(iconSvg)
        .attr("transform", `translate(${progressIconMargin.left - 3},${progressIconMargin.top - 11})`)
        .each(function(){
          d3.select(this).select("path")
            .attr("d", trophy.pathD)
            .attr("fill", data.status === 2 ? GOLD : (data.status === 1 ? grey10(2) : grey10(6)))
            .transition()
              .duration(TRANSITIONS.MED)
              .attr("transform", `translate(${hozIconShift},${vertIconShift}) scale(${iconScale})`)
            
        });
  }, [stringifiedData, width, height])

  return (
    <div className={classes.root} onClick={e => { onClick(e, data) }} >
      <div className={classes.title}>Enter Title...</div>
      <div className={classes.progressIcon} ref={progressIconRef}
        onClick={onClickProgress}>
      </div>
    </div>
  )
}

DeckHeader.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:100,
  scale:1,
}

export default DeckHeader;