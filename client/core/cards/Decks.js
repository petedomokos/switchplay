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
    transition: `all ${TRANSITIONS.MED}ms`,
    display:"flex",
    flexDirection:"column",
    /*border:"solid",
    borderWidth:"thin",
    borderColor:grey10(7)*/
  },
  overlay:{
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
    pointerEvents:"all",
    //pointerEvents:props => props.svg.pointerEvents,
    position:"absolute",
  },
  deckHeaders:{
    position:"absolute",
    left:0,
    top:0,
    transitionTimingFunction: "linear",
    //transitionTimingFunction: "ease",
    //transitionTimingFunction: "cubic-bezier(0.1, 0.7, 1.0, 0.1)",
    transformOrigin:"top left",
    transition: `all ${TRANSITIONS.MED}ms`
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

const Decks = ({ user, data, customSelectedDeckId, scale, datasets, asyncProcesses, width, height, onClick, update }) => {
  //console.log("Decks", height)
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [form, setForm] = useState(null);

  const deckAspectRatio = width / height;
  const deckWrapperWidth = d3.min([width/3, 200]);
  const deckWrapperHeight = deckWrapperWidth / deckAspectRatio;

  const deckHeaderWidth = deckWrapperWidth;
  const deckHeaderHeight = 30;// d3.min([45, d3.max([11, height * 0.15])]);

  const deckWidth = deckWrapperWidth;
  const deckHeight = deckWrapperHeight - deckHeaderHeight;

  const zoomScale = width / deckWidth;

  const deckMarginBottom = 20;

  const deckX = (d,i) => d.colNr * deckWidth;
  const deckY = (d,i) => d.rowNr * (deckWrapperHeight + deckMarginBottom);

  let styleProps = {
    width,
    height,
    svg:{
      pointerEvents:selectedDeckId ? "all" : "none",
    },
    form:{ 
      display: form ? null : "none",
    },
    overlayDisplay:selectedDeckId ? "none" : null
  };
  const classes = useStyles(styleProps);
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  const deckHeadersRef = useRef(null);
  const stringifiedData = JSON.stringify(data);

  const setSelectedDeck = useCallback((id) => {
    const deck = data.find(d => d.id === id);
    const newX = deck ? -deckX(deck) : 0;
    const newY = deck ? -deckY(deck): 0;
    const newScale = deck ? zoomScale : 1;
    const newTransformState = d3.zoomIdentity.translate(newX * newScale, newY * newScale).scale(newScale);

    console.log("zoom...")
    d3.select(zoomRef.current).call(zoom.transform, newTransformState)
    d3.select(deckHeadersRef.current)
      .style("left", `${newX * newScale}px`)
      .style("top", `${newY * newScale}px`)
      .style("transform",`scale(${newScale})`)

    //if req, update state in react, may need it with delay so it happens at end of zoom
    //setSelectedDeckId(id);
}, [stringifiedData]);

const onClickDeck = useCallback((e, d) => {
  console.log("click deck")
  setSelectedDeck(d.id); 
  e.stopPropagation();
}, [stringifiedData]);

console.log("Rerender")
//next - somethin gi s causing header to jump to the right (zoom in) and left (xoom out)
// a tiny bit for a moment during zooming - see on android more than here, but a similar

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    const processedDeckData = data.map(deckData => layout(deckData));
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData])

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
      //.updateItemStatus(updateItemStatus)
      //.updateFrontCardNr(updateFrontCardNr)
      //.setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    //why when we comment out this line, only the 1st deck opens!?
    d3.select(containerRef.current).call(decks);
    //@todo - try to simplify by putting zoomRef in a separate svg altogether
    //put teh decks svg inside a div, that also contains all the header divs.
    //all are absolutely positioned, but this way, we only need to apply zoom transform to one containing div
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



  //next - the onclick here should be uncommented, but need to stopPropagation for the click on a deck. also
  //the deck click should be put on teh deck div as it was befire, not the g
  return (
    <div className={`cards-root ${classes.root}`} onClick={() => { setSelectedDeck("")}} >
      <svg className={classes.svg} id={`cards-svg`} width={width} height={height} >
        <g ref={zoomRef}><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} />
        {/**<defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>*/}
      </svg>
      <div className={classes.deckHeaders} ref={deckHeadersRef}>
        {data.map((deckData,i) =>
          <div  onClick={e => { onClickDeck(e, deckData) }}
              key={`deck-header-${deckData.id}`} style={{ position:"absolute", left:deckX(deckData), top:deckY(deckData),
              /*border:"solid",*/ borderWidth:"thin", borderColor:"grey", width:deckWrapperWidth, height:deckHeaderHeight }}>
            <DeckHeader data={deckData} width={deckWrapperWidth} height={deckHeaderHeight} onClick={onClickDeck} />
          </div>
        )}
      </div>
      {/**<div className={classes.overlay} onClick={onClick}></div>*/}
    </div>
  )
}

Decks.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:600,
  scale:1
}

export default Decks;