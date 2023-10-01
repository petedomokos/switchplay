import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import DeckHeader from './DeckHeader';
import deckLayout from './deckLayout';
import decksComponent from "./decksComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
const { GOLD } = COLOURS;



const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    //transition: `all ${TRANSITIONS.MED}ms`,
    //display:"flex",
    //flexDirection:"column",
    width:props => props.width,
    height:props => props.height,
    border:"solid",
    borderWidth:"thin",
    borderColor:"red"
  },
  overlay:{
    display:"none",
    width:props => props.width,
    height:props => props.height,
    position:"absolute",
    display:props => props.overlayDisplay,
    transition: `all ${TRANSITIONS.MED}ms`
  },
  keyPhrase:{
    color:grey10(1)
  },
  svg:{
    display:"none",
    pointerEvents:"all",
    //pointerEvents:props => props.svg.pointerEvents,
    position:"absolute",
  },
  deckHeaders:{
    position:"absolute",
    width:props => props.width,
    height:props => props.height,
    left:props => props.deckHeaders.left,
    top:props => props.deckHeaders.top,
    transform:props => props.deckHeaders.transform,
    transitionTimingFunction: "linear",
    //transitionTimingFunction: "ease",
    //transitionTimingFunction: "cubic-bezier(0.1, 0.7, 1.0, 0.1)",
    transformOrigin:"top left",
    transition: `all ${TRANSITIONS.MED}ms`,
    /*border:"solid",
    borderWidth:"thin",
    borderColor:"blue",*/
    //background:"blue"

  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display,
  }
}))

const Decks = ({ user, data, customSelectedDeckId, initLeft, initTop, datasets, asyncProcesses, width, height, onClick, updateDeck }) => {
  //console.log("Decks", data)
  if(data.length === 0){ return null}
  //processed props
  const stringifiedData = JSON.stringify(data);
  //state
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [form, setForm] = useState(null);
  //processed state
  const selectedDeck = data.find(deck => deck.id === selectedDeckId);
  //refs
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  const deckHeadersRef = useRef(null);
  const zoomStateRef = useRef(d3.zoomIdentity);
  //dimns
  const deckAspectRatio = width / height;
  const deckOuterMargin = {
    left:10, //width * 0.05,
    right:10,//width * 0.05,
    top:15,//height * 0.05,
    bottom:15//height * 0.05
  }
  const deckWrapperWidthWithMargins = d3.min([width/3, 220]);
  const deckWrapperWidth = deckWrapperWidthWithMargins - deckOuterMargin.left - deckOuterMargin.right;
  const deckWrapperHeight = deckWrapperWidth / deckAspectRatio;

  const deckHeaderWidth = deckWrapperWidth;
  const deckHeaderHeight = 30;// d3.min([45, d3.max([11, height * 0.15])]);

  const deckWidth = deckWrapperWidth;
  const deckHeight = deckWrapperHeight - deckHeaderHeight;

  const zoomScale = width / deckWidth;
  const currentScale = selectedDeckId ? zoomScale : 1;

  const deckX = (d,i) => {
    const widthPerDeck = deckOuterMargin.left + deckWrapperWidth + deckOuterMargin.right;
    return deckOuterMargin.left + d.colNr * widthPerDeck;
  }
  const deckY = (d,i) => {
    const heightPerDeck = deckOuterMargin.top + deckWrapperHeight + deckOuterMargin.bottom
    return deckOuterMargin.top + d.rowNr * heightPerDeck;
  }

  //deckHeaders zoom
  const { x, y, k } = zoomStateRef.current;
  let styleProps = {
    width,
    height,
    deckHeaders:{
      left: `${initLeft + x}px`,
      top: `${initTop + y}px`,
      transform: `scale(${k})`
    },
    svg:{
      pointerEvents:selectedDeckId ? "all" : "none",
    },
    form:{ 
      display: form ? null : "none",
    },
    overlayDisplay:selectedDeckId ? "none" : null
  };
  const classes = useStyles(styleProps);

  const setSelectedDeck = useCallback((id) => {
    const deck = data.find(d => d.id === id);
    const newX = deck ? -deckX(deck) : 0;
    const newY = deck ? -deckY(deck): 0;
    const newScale = deck ? zoomScale : 1;
    const newTransformState = d3.zoomIdentity.translate(newX * newScale, newY * newScale).scale(newScale);
    zoomStateRef.current = newTransformState;

    //d3.select(zoomRef.current).call(zoom.transform, newTransformState)
    /*d3.select(deckHeadersRef.current)
      .style("left", `${newX * newScale}px`)
      .style("top", `${newY * newScale}px`)
      .style("transform",`scale(${newScale})`)*/

    //if req, update state in react, may need it with delay so it happens at end of zoom
    setSelectedDeckId(id);
}, [stringifiedData]);

const onClickDeck = useCallback((e, d) => {
  setSelectedDeck(selectedDeck ? "" : d.id)
  //setSelectedDeck(d.id); 
  e.stopPropagation();
}, [stringifiedData, selectedDeckId]);

const updateFrontCardNr = useCallback(cardNr => {
  updateDeck({ ...selectedDeck, frontCardNr:cardNr })
}, [stringifiedData, form, selectedDeckId]);

const updateCard = useCallback((updatedCard) => {
  //console.log("updateCard", updatedCard)
  const updatedCards = selectedDeck.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
  updateDeck({ ...selectedDeck, cards:updatedCards })
}, [stringifiedData, selectedDeckId]);

const updateItemTitle = useCallback(updatedTitle => {
  //console.log("updateTitle", updatedTitle, form)
  const { cardNr, itemNr } = form.value;
  const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === cardNr);
  const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, title: updatedTitle }));
  updateCard({ ...cardToUpdate, items:updatedItems })
}, [stringifiedData, form, selectedDeckId]);

const updateItemStatus = useCallback((cardNr, itemNr, updatedStatus) => {
  //console.log("updateItemStatus", cardNr, itemNr, updatedStatus)
  const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === cardNr);
  const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status: updatedStatus }));
  updateCard({ ...cardToUpdate, items:updatedItems })
}, [stringifiedData, form, selectedDeckId]);

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    const processedDeckData = data.map(deckData => layout(deckData));
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData, selectedDeckId])

  useEffect(() => {
    decks
      .width(width)
      .height(height)
      .selectedDeckId(selectedDeckId)
      .x(deckX)
      .y((d,i) => deckY(d,i) + deckHeaderHeight)
      ._deckWidth((d,i) => deckWidth)
      ._deckHeight((d,i) => deckHeight)
      .onClickDeck(onClickDeck)
      //.zoom(zoom)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      //.setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    //d3.select(containerRef.current).call(decks);
  }, [stringifiedData, width, height, selectedDeckId])

  //zoom
  //@note - atm, all manual events are disabled, but if we actually start using zoom events properly 
  //to zoom to users required level,
  //then for the times when we have a sourceEvent and are not using it, we need to make the transform state 
  //stay as it is, because otherwise it gets out of sync with teh element being zoomed ie the svg
  useEffect(() => {
    zoom
    //.extent(extent)
    //.scaleExtent([0.125, 10])
    .on("start", function(e){
      //console.log("start zoom......")
    })
    .on("zoom", function(e){
      //console.log("zoomed", e.transform)
      d3.select(containerRef.current)
        .transition()
        .ease(d3.easeLinear)
        .duration(TRANSITIONS.MED)
          .attr("transform", e.transform)
    })
    .on("end", function(e){
      //console.log("end zoom")
    })
    //DISABLE ALL MANUAL ZOOMS
    //.on(".zoom", null) not working so use filter instead
    .filter(() => false)

    //console.log("attach zoom to ", zoomRef.current)
    d3.select(zoomRef.current).call(zoom);
    //need to add a zoomlayerG inside the svg which gets zoomed when svg is acted on
  }, [])

  //next - gradualy put header stylingbelow into the div, keep checking its smooth
  //then, put zoom back gradualy, remove margin etc
  return (
    <div className={`cards-root ${classes.root}`} onClick={() => { setSelectedDeck("")}} >
      <svg className={classes.svg} id={`cards-svg`} width={width * 100} height={height * 100} display="none" >
        <g ref={zoomRef}><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} />
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      <div className={classes.deckHeaders} ref={deckHeadersRef}>
        {/**<div style={{ position:"absolute", left:deckX(data[1]), top:deckY(data[1]), background:"white", 
            width:deckWrapperWidth, height:deckHeaderHeight}}>
          Test
        </div>*/}
        {data.map((deckData,i) =>
          <div key={`deck-header-${deckData.id}`} onClick={e => { onClickDeck(e, deckData) }}
              style={{ position:"absolute", left:deckX(deckData), top:deckY(deckData), background:"white", 
              width:deckWrapperWidth, height:deckHeaderHeight, fontSize:"7px" }}>
              <DeckHeader data={deckData} scale={currentScale} width={deckWrapperWidth} height={deckHeaderHeight} onClick={onClickDeck} />
          </div>
        )}
        {/**data.map((deckData,i) =>
          <div  onClick={e => { onClickDeck(e, deckData) }}
              key={`deck-header-${deckData.id}`} 
              style={{ 
                  position:"absolute", left:deckX(deckData), top:deckY(deckData),
                  border:"solid", borderWidth:"thin", borderColor:"grey", 
                  width:deckWrapperWidth, height:deckHeaderHeight,
                  fontSize:"7px" 
              }}>
                Title
           
          </div>
            )*/}
      </div>
      {/**<div className={classes.overlay} onClick={onClick}></div>*/}
    </div>
  )
}

// {/**<DeckHeader data={deckData} scale={currentScale} width={deckWrapperWidth} height={deckHeaderHeight} onClick={onClickDeck} />*/}

Decks.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:600,
  initLeft:0,
  initTop:0,
}

export default Decks;