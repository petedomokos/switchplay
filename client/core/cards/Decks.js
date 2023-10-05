import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import DeckHeader from './DeckHeader';
import deckLayout from './deckLayout';
import decksComponent from "./decksComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending, moveElementPosition } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import IconComponent from './IconComponent';
import { Table } from '@material-ui/core';
const { GOLD } = COLOURS;

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
  addDeckIconContainer:{
    position:"absolute",
    left:props => props.addDeckIconContainer.left,
    top:props => props.addDeckIconContainer.top,
    width:props => `${props.addDeckIconContainer.width}px`,
    height:props => `${props.addDeckIconContainer.height}px`,
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    /*border:"solid",
    borderColor:"white",*/
  },
  addDeckText:{
    color:"white",
    height:"40px",
    display:"flex",
    alignItems:"center"
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

const Decks = ({ table, data, customSelectedDeckId, setSel, nrCols, datasets, asyncProcesses, width, height, onClick, onCreateDeck, updateTable, updateDeck, updateDecks }) => {
  //processed props
  const stringifiedData = JSON.stringify({ data, table });
  //state
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [longpressedDeckId, setLongpressedDeckId] = useState("");
  //console.log("Decks longpressedDeckId", longpressedDeckId)
  const [form, setForm] = useState(null);
  //processed state
  const selectedDeck = data.find(deck => deck.id === selectedDeckId);
  //refs
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  //const deckHeadersRef = useRef(null);
  const zoomStateRef = useRef(d3.zoomIdentity);
  //dimns

  const deckAspectRatio = width / height;
  const deckOuterMargin = {
    left:10, //width * 0.05,
    right:10,//width * 0.05,
    top:15,//height * 0.05,
    bottom:15//height * 0.05
  }
  const deckWidthWithMargins = width/nrCols;// d3.min([width/3, 220]);
  const deckWidth = deckWidthWithMargins - deckOuterMargin.left - deckOuterMargin.right;
  //the inner height is calcuated first as the aspect ration must be maintained
  const deckHeight = deckWidth / deckAspectRatio;
  const deckHeightWithMargins = deckHeight + deckOuterMargin.top + deckOuterMargin.bottom;

  const zoomScale = width / deckWidth;

  const cellX = d => d.colNr * deckWidthWithMargins;
  const cellY = d => d.rowNr * deckHeightWithMargins;
  const deckX = d => cellX(d) + deckOuterMargin.left;
  const deckY = d => cellY(d) + deckOuterMargin.top;

  const getColNr = x => Math.round(x / deckWidthWithMargins);
  const getRowNr = y => Math.round(y / deckHeightWithMargins)
  const getCell = pos => {
    const colNr = getColNr(pos[0]);
    const rowNr = getRowNr(pos[1]);
    const deck = data.find(deck => deck.colNr === colNr && deck.rowNr === rowNr);
    return {
      key:`cell-${colNr}-${rowNr}`,
      pos:[colNr, rowNr],
      x:cellX({ colNr }),
      y:cellY({ rowNr }),
      listPos:deck.listPos,
      deckX:deckX({ colNr }),
      deckY:deckY({ rowNr }),
      deckId:deck?.id
    }
  };

  //new icon goes in next avail slot
  const nextAvailableCol = data.length % nrCols;
  const nextAvailableRow = Math.floor(data.length / nrCols)
  const addDeckIconLeft = deckX({ colNr: nextAvailableCol });
  const addDeckIconTop = deckY({ rowNr:nextAvailableRow });

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
    addDeckIconContainer:{
      left:addDeckIconLeft,
      top:addDeckIconTop,
      width:deckWidth,
      //height:45
      height:deckHeight,
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
    const reorderedIds = moveElementPosition(data.map(d => d.id), origListPos, newListPos);
    updateTable({ ...table, decks:reorderedIds })
  }, [stringifiedData]);

  const deleteDeck = useCallback(() => {
  }, [stringifiedData]);

  const archiveDeck = useCallback(() => {
  }, [stringifiedData]); 

  const setSelectedDeck = useCallback((id) => {
    const deck = data.find(d => d.id === id);
    const newX = deck ? -deckX(deck) : 0;
    const newY = deck ? -deckY(deck) : 0;
    const newScale = deck ? zoomScale : 1;
    const newTransformState = d3.zoomIdentity.translate(newX * newScale, newY * newScale).scale(newScale);
    zoomStateRef.current = newTransformState;

    d3.select(zoomRef.current).call(zoom.transform, newTransformState)
    //if req, update state in react, may need it with delay so it happens at end of zoom
    setSelectedDeckId(id);
    setSel(id)
  }, [stringifiedData]);

  const onClickBg = useCallback((e, d) => {
    if(longpressedDeckId){
      setLongpressedDeckId("");
      return;
    }
    setSelectedDeck("")
    e.stopPropagation();
  }, [stringifiedData, selectedDeckId, longpressedDeckId]);

  const onClickDeck = useCallback((e, d) => {
    setSelectedDeck(selectedDeck ? "" : d.id)
    //setSelectedDeck(d.id); 
    e.stopPropagation();
  }, [stringifiedData, selectedDeckId]);

  const updateFrontCardNr = useCallback(cardNr => {
    updateDeck({ ...selectedDeck, frontCardNr:cardNr })
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
    const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status: updatedStatus }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form, selectedDeckId]);

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    decks.longpressedDeckId(longpressedDeckId)
  }, [longpressedDeckId])

  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    const processedDeckData = data.map(deckData => layout(deckData));
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData, selectedDeckId])

  useEffect(() => {
    console.log("update decks")
    decks
      .width(width)
      .height(height)
      .selectedDeckId(selectedDeckId)
      .x(deckX)
      .y(deckY)
      ._deckWidth((d,i) => deckWidth)
      ._deckHeight((d,i) => deckHeight)
      .getCell(getCell)
      .onClickDeck(onClickDeck)
      .onSetLongpressedDeckId(setLongpressedDeckId)
      .onMoveDeck(moveDeck)
      .onDeleteDeck(deleteDeck)
      .onArchiveDeck(archiveDeck)
      //.zoom(zoom)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    d3.select(containerRef.current).call(decks);
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

  return (
    <div className={`cards-root ${classes.root}`} onClick={onClickBg} >
      {data.map(deckData => 
        <div key={`cell-${deckData.id}`} className={classes.cell} style={{ left: cellX(deckData), top: cellY(deckData) }}></div>
      )}
      <svg className={classes.svg} id={`cards-svg`} overflow="visible">
        <g ref={zoomRef} display="none"><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} />
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {!selectedDeckId &&
          <div className={classes.addDeckIconContainer}>
            {data.length === 0 && 
              <div className={classes.addDeckText} onClick={createNewDeck} >
                Add a deck
              </div>
            }
            <IconComponent text="New" onClick={createNewDeck} />
          </div>
      }
      <div className={classes.formContainer}>
        {form?.formType === "item" && 
          <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
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
  nrCols:3
}

export default Decks;