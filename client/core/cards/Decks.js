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
import CardTitleForm from './forms/CardTitleForm';
import PurposeParagraphForm from './forms/PurposeParagraphForm';
import { sortAscending, moveElementPosition } from '../../util/ArrayHelpers';
import { isNumber } from '../../data/dataHelpers';
import { getPosition } from "../journey/domHelpers";
import { getTransformationFromTrans } from '../journey/helpers';
import { maxDimns } from '../../util/geometryHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS, DIMNS } from "./constants"
import { grey10, COLOURS } from './constants';
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
    /*border:"solid",
    borderWidth:"thin",
    borderColor:"white",*/
    width:props => props.cell.width,
    height:props => props.cell.height
  },
  svg:{
    position:"absolute",
  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    //we give dimns to formContainer so it covers screen and 
    //on next click, a bg click will trigger rather than a d3 click
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display,
  }
}))

const enhancedZoom = dragEnhancements();

//note (old now): heightK is a special value to accomodate fact that height changes when deck is selected
//without it, each deckHeight is slighlty wrong
const Decks = ({ table, data, customSelectedDeckId, customSelectedCardNr, customSelectedItemNr, customSelectedSectionNr, setSel, tableMarginTop, /*heightK,*/ nrCols, datasets, asyncProcesses, deckWidthWithMargins, height, onClick, onCreateDeck, updateTable, updateDeck, deleteDeck }) => {
  //processed props
  //console.log("Decks", data)
  const stringifiedData = JSON.stringify({ data, table });
  //state
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [selectedSectionNr, setSelectedSectionNr] = useState(customSelectedSectionNr);
  const [selectedCardNr, setSelectedCardNr] = useState(customSelectedCardNr);
  const [selectedItemNr, setSelectedItemNr] = useState(customSelectedItemNr);
  const [longpressedDeckId, setLongpressedDeckId] = useState("");
  const [form, setForm] = useState(null);
  //processed state
  const selectedDeck = data.find(deck => deck.id === selectedDeckId);
  const selectedCard = selectedDeck?.cards.find(c => c.cardNr === selectedCardNr);
  //refs
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  //we will store zoom state when selecting a deck so we can return to it when deselecting the deck
  //todo - simplify this - its storing the same thing!!!

  //this one stores the prev zoom state before a zoom to select a deck, so we know where excactly to return to
  const zoomStateRef = useRef(d3.zoomIdentity);
  //this one defaults to null and is used to check lpdrag - to cancel out the transform if the lpis used to drag a deck instead
  //using a pseudo call to deck.handleDrag
  const zoomTransformLpStartRef = useRef(null);
 
  //dimns
  const width = nrCols * deckWidthWithMargins;
  const deckAspectRatio = 9/16;
  const deckOuterMargin = {
    left:10, //width * 0.05,
    right:10,//width * 0.05,
    top:15, //height * 0.05,
    bottom:15//height * 0.05
  }

  const deckWidth = deckWidthWithMargins - deckOuterMargin.left - deckOuterMargin.right;
  //the inner height is calcuated first as the aspect ration must be maintained
  const deckHeight = deckWidth / deckAspectRatio;
  const deckHeightWithMargins = deckHeight + deckOuterMargin.top + deckOuterMargin.bottom;

  const selectedDeckDimns = maxDimns(width, height, deckAspectRatio);
  const zoomScale = selectedDeckDimns.width / deckWidth;

  const extraHozShiftToCentreWhenSelected = (width - selectedDeckDimns.width)/2;

  const cellX = d => d.colNr * deckWidthWithMargins;
  const cellY = d => d.rowNr * deckHeightWithMargins;
  const deckX = d => cellX(d) + deckOuterMargin.left;
  const deckY = d => cellY(d) + deckOuterMargin.top;

  const getColNr = x => Math.floor(x / deckWidthWithMargins);
  const getRowNr = y => Math.floor(y / deckHeightWithMargins)
  const getCell = (pos, posIsAbsolute=false) => {
    //if we are in the middle of a longpress pseudo drag, then we must not use the current transform
    //as it will have been adjusted due to the drag, so use zoomTransformLpStartRef instead
    const zoomTransform = zoomTransformLpStartRef.current || d3.zoomTransform(zoomRef.current)
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


  const nrRows = d3.max(data, d => d.rowNr) + 1 || 0;
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
      //pointerEvents:selectedDeckId ? "all" : "none",
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

  const onCopyDeck = useCallback(id => {
    const deckToCopy = data.find(d => d.id === id);
    const newDeck = { 
      ...deckToCopy,
      title:deckToCopy.title ? `${deckToCopy.title} (Copy)` : `${deckToCopy.id} (Copy)`,
      created: new Date() 
    };
    delete newDeck.id;
    delete newDeck._id;
    //delete id and _id
    onCreateDeck({ copy:newDeck });
  }, [stringifiedData]);

  const setSelectedDeck = useCallback((id) => {
    const deck = data.find(d => d.id === id);
    if(deck){
      //go to single selected deck view

      //store the non selected zoom state so we can return to it when deselecting the deck
      zoomStateRef.current = d3.zoomTransform(zoomRef.current);
      const newX = -deckX(deck);
      const newY = -deckY(deck);
      const newK = zoomScale;
      //the extrahozShift is an abs amount to get it to center of screen so shouldnt be scaled up
      const newTransformState = d3.zoomIdentity.translate(newX * newK + extraHozShiftToCentreWhenSelected, newY * newK).scale(newK);
      d3.select(zoomRef.current).call(zoom.transform, newTransformState)
      //fade the decks that will remian non-selected out
      d3.select(containerRef.current).selectAll("g.deck").filter(d => d.id !== id)
        .attr("opacity", 1)
        .transition("deck-opacity")
        .duration(TRANSITIONS.MED)
          .attr("opacity", 0.3)
    }else{
      //return to multideck view
      
      //fade the non-selected decks back in
      d3.select(containerRef.current).selectAll("g.deck").filter(d => d.id !== selectedDeckId)
        .transition("deck-opacity")
        .duration(TRANSITIONS.MED)
          .attr("opacity", 1)
      d3.select(zoomRef.current).call(zoom.transform, zoomStateRef.current)
    }

    //if req, update state in react, may need it with delay so it happens at end of zoom
    setSelectedDeckId(id);
    setSel(id)
  }, [stringifiedData, width, height, selectedDeckId]);

  const onSelectItem = useCallback((item) => {
    if(item){
      //fade out d3
      d3.select(containerRef.current)
        .style("opacity", 1)
          .transition()
          .duration(400)
            .style("opacity", 0)
            .on("end", function(){ 
              d3.select(this).style("display", "none");
              //set the state
              setSelectedItemNr(item.itemNr);
              setForm({ formType: "item", value:item });
              //manage the fade in of the form
              d3.select(formRef.current)
                .style("display", null)
                .style("opacity", 0)
                  .transition()
                  .duration(400)
                    .style("opacity", 1);
            })
    }else{
      //fade out the form
      d3.select(formRef.current)
        .style("opacity", 1)
          .transition()
          .duration(400)
            .style("opacity", 0)
            .on("end", function(){ 
              d3.select(this).style("display", "none");
              //set state
              setForm(null)
              setSelectedItemNr("") 
              //magae the fade in of d3
              d3.select(containerRef.current)
                .style("display", null)
                  .transition()
                  .duration(400)
                    .style("opacity", 1);
            
            
            
            
          })
    }
  }, []);


  const onSelectSection = useCallback((sectionNr) => {
    setSelectedSectionNr(sectionNr);
    /*if(sectionNr){
      
    }else{
    }*/
  }, []);

  const getFormDimns = useCallback(() => {
    const { formType, value, formDimns } = form;

    if(formType === "deck-title"){
      return {
        width:selectedDeckDimns.width - (DIMNS.DECK.PROGRESS_ICON_WIDTH * zoomScale) - deckFormMarginLeft,
        height:(DIMNS.DECK.HEADER_HEIGHT - deckFormMarginTop) * zoomScale,
        //next - put deckX and deckY into this just to see it works even though we dont really need it
        //then apply same to card form dimns
        left: DIMNS.burgerBarWidth + 8 + extraHozShiftToCentreWhenSelected, //messes it all up!!!!
        top:0
      }
    }
    if(formType === "card-title"){
  
      //select the correct deck and card
      const cardG = d3.select(containerRef.current)
        .selectAll("g.deck").filter(deckD => deckD.id === selectedDeckId)
        .selectAll("g.card").filter(cardD => cardD.cardNr === form.value.cardNr);

      //we need all transforms form the deck onwards (because deck is in top-left of screen)
      //we also need to break it up at the card, because a scale is applied to the card if it is selected
      const deckToCardPos = getPosition(cardG, "deck")
      const cardScale = getTransformationFromTrans(cardG.attr("transform")).scaleX;
      const cardTitleG = cardG.select("g.card-header").select("g.title-contents");
      const width = +cardTitleG.select("rect").attr("width") 
      const height = +cardTitleG.select("rect").attr("height")
      const cardToTitlePos = getPosition(cardTitleG, "card");
      alert(`cardScale ${cardScale}`)

      return {
        width:width * zoomScale * cardScale,
        height:height * zoomScale * cardScale,
        //alternative optin is to used the dimsn that have been passed through
        //left:formDimns.left * zoomScale,
        //top:formDimns.top * zoomScale * 0.95,
        left:(deckToCardPos.x * zoomScale) + (cardToTitlePos.x * zoomScale * cardScale),
        top:(deckToCardPos.y * zoomScale * 0.95) + (cardToTitlePos.y * zoomScale * cardScale),
        fontSize:12 * cardScale
      }
    }

    if(formType === "purpose"){
      return {
        width: formDimns.width * zoomScale,
        height: formDimns.height * zoomScale,
        left: formDimns.left * zoomScale + 7,
        top: formDimns.top * zoomScale,
        fontSize:formDimns.fontSize * zoomScale
      }
    }
  }, [form, selectedDeckId, stringifiedData]);

  const getCardTitle = useCallback((cardNr) => {
    return selectedDeck?.cards.find(c => c.cardNr === cardNr)?.title
  }, [selectedDeckId]);

  //note- this bg isn't clicked if a card is selected, as the deck-bg turns on for that instead
  const onClickBg = useCallback((e, d) => {
    e.stopPropagation();
    //bg click shouldnt change anything else if its just clicking to comeo out a form
    if(form){  
      setForm(null);
      return; 
    }
    if(isNumber(selectedCardNr)){
      setSelectedCardNr("");
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

  const updatePurposeParagraph = useCallback((newPara, i) => {
    const updatedPurpose = selectedDeck.purpose.map((para,j) => i === j ? newPara : para)
    updateDeck({ ...selectedDeck, purpose:updatedPurpose })
  }, [stringifiedData, form, selectedDeckId, selectedCardNr]);

  const updateCard = useCallback((updatedCard) => {
    const updatedCards = selectedDeck.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    updateDeck({ ...selectedDeck, cards:updatedCards })
  }, [stringifiedData, selectedDeckId]);


  const updateCardTitle = useCallback(title => {
    //we need the card from state, not the d3 datum
    const cardToUpdate = selectedDeck.cards.find(c => c.cardNr === form.value.cardNr);
    updateCard({ ...cardToUpdate, title })
  }, [stringifiedData, form, selectedDeckId, selectedCardNr]);

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


  useEffect(() => {
    decks.selectedSectionNr(selectedSectionNr);
  }, [selectedSectionNr])
  //overlay and pointer events none was stopiing zoom working!!
  useEffect(() => {
    //if(!longpressedDeckId){
      //d3.select(containerRef.current).attr("pointer-events", "none");
    //}
    decks.longpressedDeckId(longpressedDeckId);
    setForm(null);
  }, [longpressedDeckId])

  useEffect(() => {
    decks.selectedCardNr(selectedCardNr);
  }, [selectedCardNr])

  useEffect(() => {
    decks.selectedItemNr(selectedItemNr);
  }, [selectedItemNr])

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
      .nrCols(nrCols)
      .selectedDeckId(selectedDeckId)
      .form(form)
      .x(deckX)
      .y(deckY)
      ._deckWidth((d,i) => deckWidth)
      ._deckHeight((d,i) => deckHeight)
      .getCell(getCell)
      .onCreateDeck(createNewDeck)
      .onClickDeck(onClickDeck)
      .onSetLongpressedDeckId(setLongpressedDeckId)
      .onSetSelectedCardNr(cardNr => {
        setForm(null)
        setSelectedCardNr(cardNr)
      })
      .onSelectItem(onSelectItem)
      .onSelectSection(onSelectSection)
      .onMoveDeck(moveDeck)
      .onDeleteDeck(onDeleteDeck)
      .onArchiveDeck(archiveDeck)
      .onCopyDeck(onCopyDeck)
      .zoom(zoom)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId, form?.formType])

  useEffect(() => {
    d3.select(containerRef.current).call(decks);
  }, [stringifiedData, width, height, selectedDeckId, selectedCardNr, selectedItemNr,  selectedSectionNr])

  //zoom
  useEffect(() => {
    //DONT USE EXTENT BECAUSE WE NEED TRANSFORM TO WORK FULLY FOR DRAGGING DECKS TOO
    //INSTEAD, SET MAX VALUES AND MANAGE IT MANUALLY
    const horizGap = tableWidth - width;
    const vertGap = tableHeight - height;
    
    const scrollMin = -vertGap;
    const scrollMax = 0;

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
        zoomTransformLpStartRef.current = e.transform;
        zoomTransformPrev = e.transform;
        //if user ends longpress, we want them to be able to drag 
        //deckPointerEventsEnabled = true;
        setLongpressedDeckId(deckId)
        e.sourceEvent.stopPropagation();
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
        e.sourceEvent.stopPropagation();
      })
      .onLongpressEnd(function(e){
        //console.log("lpend", wasDragged)
        if(wasDragged){ 
          wasDragged = false;
          //console.log("setting lpId to nullxxxxxxxx")
          setLongpressedDeckId(""); 
        }
       
        //reset zoom transform to what it was at start so next actual zoom is not affected
        //this shouldnt have any visual affect, because we havent been calling the zoom handlers
        //for the transform changes that occured as a result of a lpdrag
        //@todo - check how can I just reset the transform object without triggering a call to the zoom handlers
        d3.select(zoomRef.current).call(zoom.transform, zoomTransformLpStartRef.current)
        e.sourceEvent.stopPropagation();

      });
    
    let wasZoomed = false;
    function zoomStart(e){
      //if(zoomTransformLpStartRef.current){
        //do nothing as this is just a call to reset transform 
        //return;
      //}
      e.sourceEvent?.stopPropagation();
    }
    function zoomed(e){
      //console.log("zoomed", e.transform)
      if(zoomTransformLpStartRef.current){
        //do nothing as this is just a call to reset transform 
        return;
      }

      if(e.sourceEvent){
        wasZoomed = true;
        const y = d3.min([d3.max([scrollMin, e.transform.y]), scrollMax])
        d3.select(containerRef.current).attr("transform", `translate(${0},${y})`)
        e.sourceEvent.stopPropagation();
        return;
      }
      d3.select(containerRef.current)
        .transition()
        .duration(TRANSITIONS.MED)
          .attr("transform", e.transform)
    }
    function zoomEnd(e){
      //console.log("zoomEnd-------", zoomTransformLpStartRef.current)
      e.sourceEvent?.stopPropagation();
      if(zoomTransformLpStartRef.current){
        //console.log("do nothing")
        //do nothing as this is a just reset
        zoomTransformLpStartRef.current = null;
        return;
      }
      if(e.sourceEvent && wasZoomed){
        wasZoomed = false;
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
      <svg className={classes.svg} id={`decks-svg`} overflow="visible">
        <g ref={zoomRef} className="zoom"><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} className="decks" pointerEvents={selectedDeckId && !form ? "all" : "none"} />
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
          {data.map(deck => 
            <clipPath id={`deck-trophy-${deck.id}`} key={`deck-trophy-${deck.id}`}><rect></rect></clipPath> 
          )}
        </defs>
      </svg>
      <div className={classes.formContainer} ref={formRef}>
        {form?.formType === "item" && 
          <ItemForm item={form.value} cardTitle={getCardTitle(form.value.cardNr)} fontSize={form.height * 0.5} save={updateItemTitle} close={() => onSelectItem()} />
        }
        {form?.formType === "deck-title" && 
          <DeckTitleForm deck={selectedDeck} save={updateDeckTitle} close={() => setForm(null)}
            dimns={getFormDimns()} 
          />
        }
        {form?.formType === "card-title" && 
          <CardTitleForm deck={selectedDeck} cardD={form.value} save={updateCardTitle} close={() => setForm(null)}
            dimns={getFormDimns()} 
          />
        }
        {form?.formType === "purpose" && 
          <PurposeParagraphForm deck={selectedDeck} paraD={form.value} save={updatePurposeParagraph} close={() => setForm(null)}
            dimns={getFormDimns()} 
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