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
import { grey10 } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:props => props.width,
    height:props => props.height,
    //transform:"scale(2)",
    //transformOrigin:"top left",
    transition: `all ${TRANSITIONS.MED}ms`,
    display:"flex",
    flexDirection:"column",
    border:"solid",
    borderWidth:"thin",
    borderColor:grey10(7)
  },
  overlay:{
    width:props => props.width,
    height:props => props.height,
    position:"absolute",
    display:props => props.overlayDisplay,
    transition: `all ${TRANSITIONS.MED}ms`
  },
  instructionsSection:{
    position:"absolute",
    margin:"50px",
  },
  instructionsTitle:{
    margin:"5px 5px 20px 5px",
    color:grey10(10),
    fontSize:"16px",
  },
  instructions:{
    display:"flex",
    flexDirection:"column",
    margin:"5px 0px 0px 0px",
  },
  instruction:{
    margin:"15px 5px",
    color:grey10(5),
    fontSize:"14px"
  },
  keyPhrase:{
    color:grey10(1)
  },
  header:{
    height:props => props.header.height,
    padding:props => `2.5% 10% 2.5% ${10 + props.header.extraPadLeft}%`,
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center",
    fontSize:props => props.header.fontSize,
    transition: `all ${TRANSITIONS.MED}ms`
  },
  title:{
    color:grey10(6)

  },
  progressIcon:{
    width:props => props.progressIcon.width,
    height:props => props.progressIcon.height,
    transform:props => `scale(${props.progressIcon.scale})`,
    transformOrigin:"center left",
    transition: `all ${TRANSITIONS.MED}ms`,
  },
  svg:{
    pointerEvents:props => props.svg.pointerEvents,
    position:"absolute",
    top:props => `${props.header.height}px`,
  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display
  }
}))

const Deck = ({ user, data, selectedDeckId, scale, datasets, asyncProcesses, width, height, onClick, update }) => {
  //we dont user defaultProps as we want to pass through userId too
  const deckData = data || initDeck(user?._id);
  //console.log("Deck", selectedDeckId)
  const isSelected = selectedDeckId === deckData.id;

  const [layout, setLayout] = useState(() => deckLayout());
  const [deck, setDeck] = useState(() => deckComponent());
  const [form, setForm] = useState(null);

  const headerHeight = 45;// d3.min([45, d3.max([11, height * 0.15])]);
  const titleFontSize = headerHeight * 0.5;
  const minTitleFontSize = 12;
  const scaledMinTitleFontSize = minTitleFontSize / scale;
  const svgWidth = width;
  const svgHeight = height - headerHeight;
  const progressIconWidth = headerHeight * 0.8;// d3.min([width * 0.2, headerHeight]);
  const progressIconHeight = headerHeight;
  let styleProps = {
    width,
    height,
    header:{
      height:headerHeight,
      //fontSize:d3.min([24, d3.max([headerHeight * 0.4, 10])]),
      //fontSize:d3.min([24, d3.max([width * 0.1, 10])]),
      fontSize:d3.max([scaledMinTitleFontSize, titleFontSize]),
      extraPadLeft:selectedDeckId ? 5 : 0, // make sure burger bar doesnt go over name
    },
    progressIcon:{
      width:progressIconWidth,
      height:progressIconHeight,
      scale:selectedDeckId ? 1 : 1.7
    },
    svg:{
      pointerEvents:isSelected ? "all" : "none",
    },
    form:{ 
      display: form ? null : "none",
    },
    overlayDisplay:selectedDeckId ? "none" : null
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
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
    const extraVertSpace = headerHeight - progressIconHeight;
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
    const hozIconShift = -progressIconContentsWidth * 0.2;
    const vertIconShift = hozIconShift;

    //enter-update
    const iconSvg = d3.select(progressIconRef.current).selectAll("svg.deck-progress").data([1]);
    iconSvg.enter()
      .append("svg")
        .attr("class", "deck-progress")
        .attr("pointer-events", "none")
        .each(function(){
          d3.select(this).append("path")
            .attr("transform", `translate(${0},${0}) scale(${iconScale})`)
        })
        .merge(iconSvg)
        .attr("transform", `translate(${progressIconMargin.left},${progressIconMargin.top})`)
        .each(function(){
          d3.select(this).select("path")
            .attr("d", trophy.pathD)
            .attr("fill", deckData.status === 2 ? GOLD : (deckData.status === 1 ? grey10(2) : grey10(6)))
            .transition()
              .duration(TRANSITIONS.MED)
              .attr("transform", `translate(${hozIconShift},${vertIconShift}) scale(${iconScale})`)
            
        });
  }, [stringifiedData, width, height])

  useEffect(() => {
    const processedDeckData = layout(deckData);
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData])

  useEffect(() => {
    deck
      .width(svgWidth)
      .height(svgHeight)
      .selectedDeckId(selectedDeckId)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    //why when we comment out this line, only the 1st deck opens!?
    d3.select(containerRef.current).call(deck);
  }, [stringifiedData, width, height, selectedDeckId])

  const updateFrontCardNr = useCallback(cardNr => {
    update({ ...deckData, frontCardNr:cardNr })
  }, [stringifiedData, form]);

  const updateCard = useCallback((updatedCard) => {
    //console.log("updateCard", updatedCard)
    const updatedCards = deckData.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    update({ ...deckData, cards:updatedCards })
  }, [stringifiedData]);

  const updateItemTitle = useCallback(updatedTitle => {
    //console.log("updateTitle", updatedTitle, form)
    const { cardNr, itemNr } = form.value;
    const cardToUpdate = deckData.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, title: updatedTitle }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form]);

  const updateItemStatus = useCallback((cardNr, itemNr, updatedStatus) => {
    //console.log("updateItemStatus", cardNr, itemNr, updatedStatus)
    const cardToUpdate = deckData.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status: updatedStatus }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form]);

  //keypresses
  useEffect(() => {
    d3.select("body").on("keypress", (e) => {
      if(e.keyCode === "13" || e.key === "Enter"){
        e.preventDefault();
        if(form){
          setForm(null)
        }
      }
    })
  }, [form, stringifiedData])

  return (
    <div className={`cards-root ${classes.root}`} >
      <div className={classes.header} onClick={onClickTitle}>
        <div className={classes.title}>Enter Title...</div>
        <div className={classes.progressIcon} ref={progressIconRef}
          onClick={onClickProgress}>
        </div>
      </div>
      <svg className={classes.svg} ref={containerRef} id={`cards-svg`} >
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {/**form && <div className={classes.formOverlay} onClick={handleSaveForm}></div>*/}
      {/**<div className={classes.formContainer}>
          {form?.formType === "item" && 
            <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
          }
        </div>*/}
      <div className={classes.overlay} onClick={onClick}></div>
    </div>
  )
}

Deck.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:600,
  scale:1
}

export default Deck;