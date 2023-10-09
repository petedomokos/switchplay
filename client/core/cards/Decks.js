import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import DeckHeader from './DeckHeader';
import deckLayout from './deckLayout';
import decksComponent from "./decksComponent";
import ItemForm from "./forms/ItemForm";
import DeckTitleForm from './forms/DeckTitleForm';
import { sortAscending, moveElementPosition } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS, DIMNS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import IconComponent from './IconComponent';
import { Table } from '@material-ui/core';
import { isNumber } from 'lodash';
const { GOLD } = COLOURS;
import dragEnhancements from '../journey/enhancedDragHandler';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    transition: `all ${TRANSITIONS.MED}ms`,
    transitionTimingFunction: "ease-in-out",
    //display:"flex",
    //flexDirection:"column",
    width:props => props.width,
    height:props => props.height,
    /*border:"solid",
    borderWidth:"thin",
    borderColor:"red"*/
  },
  keyPhrase:{
    color:grey10(1)
  },
  cell:{
    position:"absolute",
    display:props => props.cell.display,
    border:"solid",
    borderWidth:"thin",
    borderColor:"white",
    width:props => props.cell.width,
    height:props => props.cell.height
  },
  svg:{
    pointerEvents:"all",
    //pointerEvents:props => props.svg.pointerEvents,
    position:"absolute",
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

const enhancedZoom = dragEnhancements();

//note: heightK is a special value to accomodate fact that height changes when deck is selected
//without it, each deckHeight is slighlty wrong
const Decks = ({ table, data, customSelectedDeckId, customSelectedCardNr, setSel, tableMarginTop, heightK, nrCols, datasets, asyncProcesses, width, height, onClick, onCreateDeck, updateTable, updateDeck, deleteDeck }) => {
  //console.log("Decks", data.map(d => d.title || d.id ))
  //processed props
  const stringifiedData = JSON.stringify({ data, table });
  //state
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [selectedCardNr, setSelectedCardNr] = useState(customSelectedCardNr);
  const [longpressedDeckId, setLongpressedDeckId] = useState("");
  //console.log("Decks longpressedDeckId", longpressedDeckId)
  const [form, setForm] = useState(null);
  //processed state
  const selectedDeck = data.find(deck => deck.id === selectedDeckId);
  //refs
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  //we will store zoom state when selecting a deck so we can return to it when deselecting the deck
  const zoomStateRef = useRef(d3.zoomIdentity);
  const newDeckRef = useRef(null);
 
  //dimns
  const deckAspectRatio = width / height;
  const deckOuterMargin = {
    left:10, //width * 0.05,
    right:10,//width * 0.05,
    top:15, //height * 0.05,
    bottom:15//height * 0.05
  }
  const deckWidthWithMargins = width/nrCols;// d3.min([width/3, 220]);
  const deckWidth = deckWidthWithMargins - deckOuterMargin.left - deckOuterMargin.right;
  //the inner height is calcuated first as the aspect ration must be maintained
  const deckHeight = deckWidth / deckAspectRatio;
  //note: heightK is a special value to accomodate fact that height changes when deck is selected
  //without it, each deckHeight is slightly wrong when deck is selected
  const deckHeightWithMargins = (deckHeight * heightK) + deckOuterMargin.top + deckOuterMargin.bottom;

  const zoomScale = width / deckWidth;


  const cellX = d => d.colNr * deckWidthWithMargins;
  const cellY = d => d.rowNr * deckHeightWithMargins;
  const deckX = d => cellX(d) + deckOuterMargin.left;
  const deckY = d => cellY(d) + deckOuterMargin.top;

  const getColNr = x => Math.floor(x / deckWidthWithMargins);
  const getRowNr = y => Math.floor(y / deckHeightWithMargins)
  const getCell = (pos, posIsAbsolute=false) => {
    const zoomTransform = d3.zoomTransform(zoomRef.current)
    let x = posIsAbsolute ? pos[0] : pos[0];
    let y = posIsAbsolute ? pos[1] - tableMarginTop : pos[1];
    const colNr = getColNr(x - zoomTransform.x);
    const rowNr = getRowNr(y - zoomTransform.y);
    const deck = data.find(deck => deck.colNr === colNr && deck.rowNr === rowNr);
    //handle case of dragging deck into the next available slot or any cell that is empty ie in a list that means 
    //a cell after teh last filled one
    return {
      key:`cell-${colNr}-${rowNr}`,
      pos:[colNr, rowNr],
      x:cellX({ colNr }),
      y:cellY({ rowNr }),
      listPos:deck ? deck.listPos : data.length - 1, //default to the end of the list
      deckX:deckX({ colNr }),
      deckY:deckY({ rowNr }),
      deckId:deck?.id
    }
  };


  const nrRows = d3.max(data, d => d.rowNr) + 1
  const tableWidth = width;
  const tableHeight = (nrRows + 1) * deckHeightWithMargins;

  const deckFormMarginLeft = DIMNS.burgerBarWidth + 8; //not sure why this 8 is needed
  const deckFormMarginTop = 2; //not sure why this is needed
  const deckFormDimns = {
    width:width - (DIMNS.DECK.PROGRESS_ICON_WIDTH * zoomScale) - deckFormMarginLeft,
    height:DIMNS.DECK.HEADER_HEIGHT * zoomScale - deckFormMarginTop,
    marginLeft:deckFormMarginLeft,
    marginTop:deckFormMarginTop
  }

  let styleProps = {
    width,
    height,
    cell:{
      display:selectedDeckId ? "none" : null,
      width:deckWidthWithMargins,
      height:deckHeightWithMargins,
    },
    svg:{
      pointerEvents:selectedDeckId ? "all" : "none",
    },
    form:{ 
      display: form ? null : "none",
    }
  };
  const classes = useStyles(styleProps);

  //@todo - add a settings form with a useState toggle to show it when user clicks to create
  const createNewDeck = e => {
    //@todo - do animation to show its being created
    onCreateDeck({})
    e.stopPropagation();
  };

  const moveDeck = useCallback((origListPos, newListPos) => {
    if(!isNumber(origListPos) || !isNumber(newListPos)){ return; }
    const reorderedIds = moveElementPosition(data.map(d => d.id), origListPos, newListPos);
    updateTable({ ...table, decks:reorderedIds })
  }, [stringifiedData]);

  const onDeleteDeck = useCallback(id => {
    const updatedTable = { 
      ...table, 
      decks:table.decks.filter(deckId => deckId !== id),
      archivedDecks:table.archivedDecks.filter(deckId => deckId !== id) 
    };
    deleteDeck(id, updatedTable);
  }, [stringifiedData]);

  const archiveDeck = useCallback(id => {
    updateTable({ 
      ...table, 
      decks:table.decks.filter(deckId => deckId !== id),
      archivedDecks:[ ...table.archivedDecks, id]
    })
  }, [stringifiedData]); 

  const setSelectedDeck = useCallback((id) => {
    const deck = data.find(d => d.id === id);
    if(deck){
      //store the non selected zoom state so we can return to it when deselecting the deck
      //console.log("zoom into deck so store zoom state", d3.zoomTransform(zoomRef.current))
      zoomStateRef.current = d3.zoomTransform(zoomRef.current);
      const newX = -deckX(deck);
      const newY = -deckY(deck);
      const newK = zoomScale;
      const newTransformState = d3.zoomIdentity.translate(newX * newK, newY * newK).scale(newK);
      d3.select(zoomRef.current).call(zoom.transform, newTransformState)
    }else{
      //console.log("returning to prev state", zoomStateRef.current)
      d3.select(zoomRef.current).call(zoom.transform, zoomStateRef.current)
    }

    //if req, update state in react, may need it with delay so it happens at end of zoom
    setSelectedDeckId(id);
    setSel(id)
  }, [stringifiedData, width, height]);

  //note- this bg isn't clicked if a card is selected, as the deck-bg turns on for that instead
  const onClickBg = useCallback((e, d) => {
    e.stopPropagation();
    if(isNumber(selectedCardNr)){
      setSelectedCardNr("");
      return;
    }
    if(longpressedDeckId){
      setLongpressedDeckId("");
      return;
    }
    //bg click shouldnt change anything else if its just clicking to comeo out a form
    if(form){  
      setForm(null);
      return; 
    }
    setSelectedDeck("");
  }, [stringifiedData, selectedDeckId, longpressedDeckId, selectedCardNr, form]);

  const onClickDeck = useCallback((e, d) => {
    setSelectedDeck(selectedDeck ? "" : d.id)
    e.stopPropagation();
    setForm(null);
  }, [stringifiedData, selectedDeckId]);

  const updateFrontCardNr = useCallback(cardNr => {
    updateDeck({ ...selectedDeck, frontCardNr:cardNr });
    setForm(null);
  }, [stringifiedData, form, selectedDeckId]);

  const updateDeckTitle = useCallback(title => {
    updateDeck({ ...selectedDeck, title })
  }, [stringifiedData, form, selectedDeckId]);

  const updateCard = useCallback((updatedCard) => {
    const updatedCards = selectedDeck.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    updateDeck({ ...selectedDeck, cards:updatedCards })
  }, [stringifiedData, selectedDeckId]);

  const updateItemTitle = useCallback(updatedTitle => {
    const { cardNr, itemNr } = form.value;
    const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, title: updatedTitle }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form, selectedDeckId]);

  const updateItemStatus = useCallback((cardNr, itemNr, updatedStatus) => {
    setForm(null);
    const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status: updatedStatus }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form, selectedDeckId]);

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    if(!longpressedDeckId){
      d3.select(containerRef.current).attr("pointer-events", "none");
    }
    decks.longpressedDeckId(longpressedDeckId);
    setForm(null);
  }, [longpressedDeckId])

  useEffect(() => {
    decks.selectedCardNr(selectedCardNr);
  }, [selectedCardNr])

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    const processedDeckData = data.map(deckData => layout(deckData));
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData, selectedDeckId])

  useEffect(() => {
    decks
      .width(width)
      .height(tableHeight + deckHeightWithMargins)
      .selectedDeckId(selectedDeckId)
      .x(deckX)
      .y(deckY)
      ._deckWidth((d,i) => deckWidth)
      ._deckHeight((d,i) => deckHeight)
      .getCell(getCell)
      .onCreateDeck(createNewDeck)
      .onClickDeck(onClickDeck)
      .onSetLongpressedDeckId(setLongpressedDeckId)
      .onSetSelectedCardNr(setSelectedCardNr)
      .onMoveDeck(moveDeck)
      .onDeleteDeck(onDeleteDeck)
      .onArchiveDeck(archiveDeck)
      .zoom(zoom)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    d3.select(containerRef.current).attr("pointer-events", "none").call(decks);
  }, [stringifiedData, width, height, selectedDeckId, selectedCardNr])

  //zoom
  useEffect(() => {
    //DONT USE EXTENT BECAUSE WE NEED TRANSFORM TO WORK FULLY FOR DRAGGING DECKS TOO
    //INSTEAD, SET MAX VALUES AND MANAGE IT MANUALLY
    const horizGap = tableWidth - width;
    const vertGap = tableHeight - height;
    
    const scrollMin = -vertGap;
    const scrollMax = 0;

    let zoomTransformStart;
    let zoomTransformPrev;
    let deckPointerEventsEnabled = false;
    let wasDragged = false;

    let location;
    let deckId;

    enhancedZoom
      .dragThreshold(100)
      .onLongpressStart(function(e){
        location = [
          e.sourceEvent.clientX || e.sourceEvent.touches[0].clientX,
          e.sourceEvent.clientY || e.sourceEvent.touches[0].clientY,
        ]
        const cell = getCell(location, false);
        deckId = cell?.deckId;
        zoomTransformStart = e.transform;
        zoomTransformPrev = e.transform;
        //if user ends longpress, we want them to be able to drag 
        //deckPointerEventsEnabled = true;
        d3.select(containerRef.current).attr("pointer-events", "all");
        setLongpressedDeckId(deckId)
      })
      //next thing is on dragEnd or longressEnd (when wasDragged=true) => need to call the tarsition in endLongpress
      //or pass through wasDragged?? or newCell??
      .onLongpressDragged(function(e){
        //user has dragged as part of the longpress itself, so we dont want them to be able to drag after it anymore
        wasDragged = true;
        deckPointerEventsEnabled = false;
        const pseudoE = { dx: e.transform.x - zoomTransformPrev.x, dy:e.transform.y - zoomTransformPrev.y }
        decks.handleDrag(pseudoE, deckId);
        zoomTransformPrev = e.transform;
      })
      .onLongpressEnd(function(e){
        if(wasDragged){ 
          wasDragged = false;
          setLongpressedDeckId(""); 
        }
       
        //reset zoom transform to what it was at start so next actual zoom is not affected
        //this shouldnt have any visual affect, because we havent been calling the zoom handlers
        //for the transform changes that occured as a result of a lpdrag
        //@todo - check how can I just reset the transform object without triggering a call to the zoom handlers
        d3.select(zoomRef.current).call(zoom.transform, zoomTransformStart)

      });
    
    function zoomStart(e){
      if(zoomTransformStart){
        //do nothing as this is just a call to reset transform 
        return;
      }
    }
    function zoomed(e){
      if(zoomTransformStart){
        //do nothing as this is just a call to reset transform 
        return;
      }

      if(e.sourceEvent){
        const y = d3.min([d3.max([scrollMin, e.transform.y]), scrollMax])
        d3.select(containerRef.current).attr("transform", `translate(${0},${y})`)
        return;
      }
      d3.select(containerRef.current)
        .transition()
        .duration(TRANSITIONS.MED)
          .attr("transform", e.transform)

    }
    function zoomEnd(e){
      if(zoomTransformStart){
        //do nothing as this is just a call to reset transform just reset
        zoomTransformStart = null;
        return;
      }
      if(e.sourceEvent){
        //manual scroll so reset to min/max if its gone past min/max
        e.transform.x = 0;
        if(e.transform.y < scrollMin){
          e.transform.y = scrollMin;
        }else if(e.transform.y > scrollMax){ //replace with max
          e.transform.y = scrollMax; //replace with max
        }
      }
    }
  
    zoom 
      .on("start", enhancedZoom(zoomStart))
      .on("zoom", enhancedZoom(zoomed))
      .on("end", enhancedZoom(zoomEnd))

    //d3.select(zoomRef.current).call(zoom).on("click", handleClick);
    //need to add a zoomlayerG inside the svg which gets zoomed when svg is acted on
  }, [data])

  return (
    <div className={`cards-root ${classes.root}`} onClick={onClickBg} >
      {data.map(deckData => 
        <div key={`cell-${deckData.id}`} className={classes.cell} style={{ left: cellX(deckData), top: cellY(deckData) }}></div>
      )}
      <svg className={classes.svg} id={`cards-svg`} overflow="visible">
        <g ref={zoomRef} className="zoom"><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} className="decks-container" pointerEvents="none" />
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      <div className={classes.formContainer}>
        {form?.formType === "item" && 
          <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
        }
        {form?.formType === "deck-title" && 
          <DeckTitleForm deck={selectedDeck} save={updateDeckTitle} close={() => setForm(null)}
            dimns={deckFormDimns} 
          />
        }
      </div>
    </div>
  )
}

Decks.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:600,
  nrCols:3,
  tableMarginTop:0
}

export default Decks;