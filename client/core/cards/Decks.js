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
import SectionTitleForm from './forms/SectionTitleForm';
import CardTitleForm from './forms/CardTitleForm';
import CardDateForm from "./CardDateForm";
import PurposeParagraphForm from './forms/PurposeParagraphForm';
import ItemApp from "./item_app/ItemApp"

import { sortAscending, moveElementPosition } from '../../util/ArrayHelpers';
import { isNumber } from '../../data/dataHelpers';
import { getPosition } from "../journey/domHelpers";
import { getTransformationFromTrans } from '../journey/helpers';
import { maxDimns } from '../../util/geometryHelpers';
//import { createId } from './helpers';
import { grey10, COLOURS, TRANSITIONS, DIMNS } from './constants';
const { GOLD } = COLOURS;
import dragEnhancements from '../journey/enhancedDragHandler';
import { toCamelCase } from '../../data/measures';
import { createInitCard } from '../../data/initDeck';
import { addWeeks } from '../../util/TimeHelpers';
import { addKpiValuesToCards } from './kpiValuesForCards';
import uuid from 'react-uuid';
//import { mockItem } from './item_app/data/mockData';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    transition: `all ${TRANSITIONS.MED}ms`,
    transitionTimingFunction: "ease-in-out",
    //display:"flex",
    //flexDirection:"column",
    width:props => props.width,
    height:props => props.height,
   //border:"solid",
    //borderWidth:"thin",
    borderColor:"red",
    touchAction:"none"
  },
  keyPhrase:{
    color:grey10(1),
    touchAction:"none"
  },
  cell:{
    position:"absolute",
    display:props => props.cell.display,
    /*border:"solid",
    borderWidth:"thin",
    borderColor:"white",*/
    width:props => props.cell.width,
    height:props => props.cell.height,
    touchAction:"none"
  },
  svg:{
    position:"absolute",
  },
  formUnderlay:{
    width:props => props.formUnderlay.width,
    height:props => props.formUnderlay.height,
    display:props => props.formUnderlay.display,
    touchAction:"none"
  },
  formContainer:{
    pointerEvents:"none",//props => props.form.pointerEvents,
    position:"absolute",
    left:"0px",
    top:"0px",
    //we give dimns to formContainer so it covers screen and 
    //on next click, a bg click will trigger rather than a d3 click
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display,
    touchAction:"none"
  }
}))

const enhancedZoom = dragEnhancements();

/*const getFrontCardNr = (cards, frontCardId) => {
  if(!frontCardId){ return 0; }
  if(frontCardId === "current"){ 
      const now = new Date();
      return d3.least(cards.filter(c => c.date > now)).cardNr;
  }
  //all cards placed
  if(frontCardId === "none"){ return cards.length; }
  //custom card
  return cards.find(c => c.id === frontCardId).cardNr;
}*/

//note (old now): heightK is a special value to accomodate fact that height changes when deck is selected
//without it, each deckHeight is slighlty wrong
const Decks = ({ form, setForm, screen, table, data, groupingTag, timeframeKey, customSelectedDeckId, customSelectedCardNr, customSelectedItemNr, customSelectedSection, setSel, tableMarginTop, /*heightK,*/ nrCols, datasets, asyncProcesses, deckWidthWithMargins, availWidth, height, heightInSelectedDeckMode, logo, onClick, onCreateDeck, updateTable, updateDeck, updateDecks, deleteDeck, applyChangesToAllDecks }) => {
  //console.log("Decks table", table)
  //console.log("data", data)
  //state
  const [_deckLayout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [zoom, setZoom] = useState(() => d3.zoom());
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [selectedSection, setSelectedSection] = useState(customSelectedSection);
  const [selectedCardNr, setSelectedCardNr] = useState(customSelectedCardNr);
  const [selectedItemNr, setSelectedItemNr] = useState(customSelectedItemNr);
  const [longpressedDeckId, setLongpressedDeckId] = useState("");

  //update flags
  //processed props
  const frontCardIds = JSON.stringify(data.map(d => d.frontCardId))
  const stringifiedData = JSON.stringify({ data, table, datasets });
  const stringifiedTable = JSON.stringify(table);
  const stringifiedDatasets = JSON.stringify(datasets);
  const stringifiedCards = JSON.stringify(data.map(d => d.cards));
  const stringifiedDeckInfo = JSON.stringify(data.map(d => ({ 
    id:d.id, title: d.title, frontcardNr:d.frontCardNr, sections:d.sections, purpose:d.purpose
  })))

  const shouldPersistChanges = !table?.isMock && !data?.find(d => d.isMock);
  //profiles state
  const [kpiFormat, setKpiFormat] = useState("actual");

  //processed state
  const selectedDeck = data.find(deck => deck.id === selectedDeckId);
  //refs
  const cardsWithKpisRef = useRef([]);
  const zoomRef = useRef(null);
  const containerRef = useRef(null);
  const formRef = useRef(null);
  //we will store zoom state when selecting a deck so we can return to it when deselecting the deck
  //todo - simplify this - its storing the same thing!!!

  //this one stores the prev zoom state before a zoom to select a deck, so we know where excactly to return to
  const zoomStateRef = useRef(d3.zoomIdentity);
  const zoomCallbackRef = useRef(null);
  //this one defaults to null and is used to check lpdrag - to cancel out the transform if the lpis used to drag a deck instead
  //using a pseudo call to deck.handleDrag
  const zoomTransformLpStartRef = useRef(null);
 
  //dimns
  const width = nrCols * deckWidthWithMargins;
  const deckAspectRatio = DIMNS.DECK.ASPECT_RATIO;
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

  //const selectedDeckDimns = maxDimns(width, height, deckAspectRatio);
  const selectedDeckDimns = maxDimns(width, heightInSelectedDeckMode, deckAspectRatio);
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
    formUnderlay:{
      width:"100%",
      height:"100%",
      display:form ? null : "none"
    },
    form:{ 
      display: form ? null : "none",
    }
  };
  const classes = useStyles(styleProps);

  //@todo - add a settings form with a useState toggle to show it when user clicks to create
  const createNewDeck = e => {
    //@todo - do animation to show its being created

    onCreateDeck({ })
    e.stopPropagation();
  };

  const moveDeck = useCallback((origListPos, newListPos) => {
    if(!isNumber(origListPos) || !isNumber(newListPos)){ return; }
    const reorderedIds = moveElementPosition(data.map(d => d.id), origListPos, newListPos);
    updateTable({ ...table, decks:reorderedIds }, shouldPersistChanges)
  }, [stringifiedData]);

  const onDeleteDeck = useCallback(id => {
    const updatedTable = { 
      ...table, 
      decks:table.decks.filter(deckId => deckId !== id),
      archivedDecks:table.archivedDecks.filter(deckId => deckId !== id) 
    };
    deleteDeck(id, updatedTable, shouldPersistChanges);
  }, [stringifiedData]);

  const archiveDeck = useCallback(id => {
    updateTable({ 
      ...table, 
      decks:table.decks.filter(deckId => deckId !== id),
      archivedDecks:[ ...table.archivedDecks, id]
    }, shouldPersistChanges)
  }, [stringifiedData]); 

  const onCopyDeck = useCallback(id => {
    const deckToCopy = data.find(d => d.id === id);
    const newDeck = { 
      ...deckToCopy,
      title:deckToCopy.title ? `${deckToCopy.title} (Copy)` : `${deckToCopy.id} (Copy)`,
      created: new Date(),
      baseId:id,
      shouldInheritBaseUpdates:true,
      cards:deckToCopy.cards.map(c => ({
        ...c,
        id:uuid(),
        baseId:c.id,
        shouldInheritBaseUpdates:true,
        items:c.items.map(it => ({
          ...it,
          id:uuid(),
          baseId:it.id,
          shouldInheritBaseUpdates:true
        }))
      }))
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
      //if req, update state in react, may need it with delay so it happens at end of zoom
      setSelectedDeckId(id);
      setSel(id)
    }else{
      //need to trigger an update of the currently selected deck with deckIsSelected immeditately,
      //so fill etc changes as th ezoom occurs...then, trigger a 2nd update with all the other decks back in
      //to data. The question is, ho best ot trigger this 1st updte of the selected deck???
      d3.select(containerRef.current).call(decks.selectedDeckId(""))

      //return to multideck view
      //first tell CardsTable so it can remove top margin
      setSel("")
      //zoom out

      zoomCallbackRef.current = () => {
        setSelectedDeckId("");
      }
      d3.select(zoomRef.current).call(zoom.transform, zoomStateRef.current)
      
    }
  }, [stringifiedData, width, height, selectedDeckId]);

  const onSelectItem = useCallback(function(item){
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
              //fade form back in ready for next time, as state will update anyway to set form display correctly
              d3.select(this).style("opacity", 1)//.style("display", "none");
              //set state
              handleCancelForm();
              setSelectedItemNr("") 
              //manage the fade in of d3
              d3.select(containerRef.current)
                .style("display", null)
                  .transition()
                  .duration(400)
                    .style("opacity", 1);
          })
    }
  }, []);

  const onSelectSection = useCallback(key => {
    setSelectedSection(selectedDeck?.sections.find(s => s.key === key) || null);
  }, [selectedDeck, stringifiedData]);

  const getFormDimnsAndPos = useCallback(() => {
    const { formType, value, formDimns } = form;
    if(formType === "item"){
      return {
        left:0,
        right:0,
        width:selectedDeckDimns.width,
        height:selectedDeckDimns.height
      }
    }
    if(formType === "section"){
      const subtitleHeight = DIMNS.DECK.HEADER_HEIGHT * DIMNS.DECK.HEADER_SUBTITLE_HEIGHT_PROP
      return {
        left:20 + extraHozShiftToCentreWhenSelected,
        //subtitle has dominant-baseline hanging
        top:(DIMNS.DECK.HEADER_HEIGHT - subtitleHeight * 1.4) * zoomScale,
        width:(selectedDeckDimns.width - (DIMNS.DECK.PROGRESS_ICON_WIDTH * zoomScale) - deckFormMarginLeft) * 0.8,
      }

    }
    if(formType === "deck-title"){
      return {
        width:selectedDeckDimns.width - (DIMNS.DECK.PROGRESS_ICON_WIDTH * zoomScale) - deckFormMarginLeft,
        height:(DIMNS.DECK.HEADER_HEIGHT - deckFormMarginTop) * zoomScale,
        //next - put deckX and deckY into this just to see it works even though we dont really need it
        //then apply same to card form dimns
        left: 28 + extraHozShiftToCentreWhenSelected,
        top:4
      }
    }
    if(formType === "card-title"){

      const { id } = form.value;
  
      //select the correct deck and card
      const cardG = d3.select(containerRef.current)
        .selectAll("g.deck").filter(deckD => deckD.id === selectedDeckId)
        .selectAll("g.card").filter(cardD => cardD.id === id);

      //we need all transforms form the deck onwards (because deck is in top-left of screen)
      //we also need to break it up at the card, because a scale is applied to the card if it is selected
      const deckToCardPos = getPosition(cardG, "deck")
      const cardScale = getTransformationFromTrans(cardG.attr("transform")).scaleX;
      const cardTitleG = cardG.select("g.card-header").select("g.title-contents");
      const width = +cardTitleG.select("rect").attr("width") 
      const height = +cardTitleG.select("rect").attr("height")
      const cardToTitlePos = getPosition(cardTitleG, "card");

      return {
        width:width * zoomScale * cardScale,
        height:height * zoomScale * cardScale,
        //alternative optin is to used the dimsn that have been passed through
        //left:formDimns.left * zoomScale,
        //top:formDimns.top * zoomScale * 0.95,
        left:(deckToCardPos.x * zoomScale) + (cardToTitlePos.x * zoomScale * cardScale),
        //must get lower prop to cardId
        top:(deckToCardPos.y * zoomScale) + (cardToTitlePos.y * zoomScale * cardScale),
        fontSize:12 * cardScale
      }
    }

    if(formType === "card-date"){
      //select the correct deck and card
      const cardG = d3.select(containerRef.current)
        .selectAll("g.deck").filter(deckD => deckD.id === selectedDeckId)
        .selectAll("g.card").filter(cardD => cardD.id === form.value.id);

      const deckToCardContentsPos = getPosition(cardG.select("g.front-contents"), "deck")
      const cardScale = getTransformationFromTrans(cardG.attr("transform")).scaleX;
      return {
        width:100,
        height:100,
        left: cardScale === 1 ? deckToCardContentsPos.x * zoomScale : 25,
        top:deckToCardContentsPos.y * zoomScale + (cardScale === 1 ? 0 : 10)
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

  const getCardTitle = useCallback((cardId) => {
    return selectedDeck?.cards.find(c => c.id === cardId)?.title
  }, [selectedDeckId]);

  const getSectionTitle = useCallback((cardId) => {
    return selectedDeck?.cards.find(c => c.id === cardId)?.section?.title
  }, [selectedDeckId]);

  //note- this bg isn't clicked if a card is selected, as the deck-bg turns on for that instead
  const onClickBg = useCallback((e, d) => {
    //console.log("bgClick")
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

  const onSelectDeck = useCallback(id => {
    setSelectedDeck(id || "");
    setForm(null);
  }, [stringifiedData, selectedDeckId]);

  //console.log("Decks", selectedDeckId)

  const updateFrontCardNr = useCallback(frontCardId => {
    updateDeck({ ...selectedDeck, frontCardId });
    setForm(null);
  }, [stringifiedData, form, selectedDeckId]);

  const updateDeckTitle = useCallback(title => {
    updateDeck({ ...selectedDeck, title })
  }, [stringifiedData, form, selectedDeckId]);

  const updateSectionTitle = useCallback((title, applyToAllDecks) => {
    //console.log("updateSectTitle--------------------------------------------",title, applyToAllDecks)
    //note - we dont store anything on an item, theitem is assigned the section in layout, based on sections itemNr
    //@todo - give option to update it on all decks that share this section, inc those inot in this table
    const newKey = toCamelCase(title);

    const updatedSections = selectedDeck.sections
      .map(s => s.key === selectedSection.key ? ({ ...s, title, key:newKey }) : s)

    setSelectedSection(prevState => ({ ...prevState, key:newKey, title }))

    if(applyToAllDecks){
      //@todo - update code so it uses cardId, and also applies it to any cards that have 
      //baseId the same as this id..so when creating a copy of a deck, the new deck should have baseid = deckid of the
      //original, and each card should also have a baseId which is teh baseId of the correpsonidng card in teh original
      //maybe just call it originalDeckId and originalCardId
      //the new key has been applied to cerate updatedSections, so we use it to grab the section
      //const updatedSection = updatedSections.find(s => s.key === newKey);
      //then update all decks with that section -> the action will updte the store via the reducer
      //updateDecks({ desc:"section", origSectionKey:form.sectionKey, section: updatedSection }, shouldPersistChanges)
    }else{
      updateDeck({ ...selectedDeck, sections:updatedSections })
    }
  }, [stringifiedData, form, selectedDeckId, selectedSection]);

  const updateSectionInitials = useCallback((initials, applyToAllDecks) => {
    //console.log("updateSectInit",initials, applyToAllDecks)
    const updatedSections = selectedDeck.sections.map(s => s.key === selectedSection.key ? ({ ...s, initials }) : s)
    setSelectedSection(prevState => ({ ...prevState, initials }))

    if(applyToAllDecks){
      //@todo - update code so it uses cardId, and also applies it to any cards that have 
      //baseId the same as this id..so when creating a copy of a deck, the new deck should have baseid = deckid of the
      //original, and each card should also have a baseId which is teh baseId of the correpsonidng card in teh original
      //maybe just call it originalDeckId and originalCardId
      //const updatedSection = updatedSections.find(s => s.key === selectedSection.key);
      //updateDecks({ desc:"section", origSectionKey:form.sectionKey, section: updatedSection }, shouldPersistChanges)
    }else{
      updateDeck({ ...selectedDeck, sections:updatedSections })
    }
  }, [stringifiedData, form, selectedDeckId, selectedSection]);

  const updatePurposeParagraph = useCallback((newPara, i) => {
    const updatedPurpose = selectedDeck.purpose.map((para,j) => i === j ? newPara : para)
    updateDeck({ ...selectedDeck, purpose:updatedPurpose })
  }, [stringifiedData, form, selectedDeckId, selectedCardNr]);

  const updateCard = useCallback((updatedCard) => {
    const updatedCards = selectedDeck.cards.map(c => c.id !== updatedCard.id ? c : updatedCard);
    updateDeck({ ...selectedDeck, cards:updatedCards })
  }, [stringifiedData, selectedDeckId]);


  const updateCardTitle = useCallback((title, applyToAllDecks) => {
    //console.log("updateCardTitle",title, applyToAllDecks)
    const { id } = form.value;
    //we need the card from state, not the d3 datum
    const cardToUpdate = selectedDeck.cards.find(c => c.id === id);

    if(applyToAllDecks){
      //@todo - update code 
      //updateDecks({ desc:"card-title", cardNr, title, prevTitle:cardToUpdate.title }, shouldPersistChanges)
    }else{
      updateCard({ ...cardToUpdate, title })
    }
  }, [stringifiedData, form, selectedDeckId, selectedCardNr]);

  const updateItem = useCallback((updatedItem, applyToAllDecks, propertiesUpdated) => {
    console.log("updateItem", updatedItem)
    const { cardId, itemNr } = form.value;
    const cardToUpdate = selectedDeck.cards.find(c => c.id === cardId);
    if(applyToAllDecks){
      //@todo - update code 
      //const prevTitle = cardToUpdate.items.find(it => it.itemNr === itemNr).title
      //updateDecks({ desc:"item-title", cardNr, itemNr, title, prevTitle }, shouldPersistChanges)
    }else{
      const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : updatedItem);
      console.log("updatedItems", updatedItems)
      updateCard({ ...cardToUpdate, items:updatedItems })
    }
  }, [stringifiedData, form, selectedDeckId]);

  const updateItemStatus = useCallback((cardId, itemNr, status) => {
    setForm(null);
    const cardToUpdate = selectedDeck.cards.find(c => c.id === cardId);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form, selectedDeckId]);

  const addCard = useCallback((deckId, cardNr) => {
    //bug - when frontCardId is none, it stays as none, when it should be the id of the new card
    //also finally need to do section view when more than 5 held cards
    //console.log("add card", deckId, cardNr, selectedDeck)
    setForm(null);
    const currentCards = selectedDeck.cards;
    const prevDate = currentCards[currentCards.length-1].date;
    const date = addWeeks(1, prevDate);
    //@todo - impl adding card in between, but for now, we can only add at end so cardNr not needed
    //for this, we cant rely on cards order, instead we must calc the date here or in decksComponent
    //because react state and db dont care about cards order
    //cardNr is simply used to produce an init title and to determin pos in the deck
    //we can assume its the last one for now
    const newCard = createInitCard({ date, cardNr });
    const cards = [...currentCards, newCard]
    updateDeck({ ...selectedDeck, cards, frontCardId:newCard.id })
  }, [stringifiedData, form, selectedDeckId]);

  const deleteCard = useCallback((deckId, cardId, newFrontCardId) => {
    const cards = selectedDeck.cards.filter(c => c.id !== cardId);
    updateDeck({ 
      ...selectedDeck, 
      cards, 
      frontCardId:newFrontCardId || selectedDeck.frontCardId
    })
    
    setForm(null);
  }, [stringifiedData, form, selectedDeckId]);

  useEffect(() => {
    setSelectedSection(null);
    setForm(null);
  }, [timeframeKey, groupingTag])

  useEffect(() => {
    decks.selectedSection(selectedSection);
  }, [selectedSection])
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

  /*
  merge current change was...
  //journeyData
    profilesLayout
      .format(kpiFormat)
      .datasets(datasets)
      .info(journeyData.player)
      //.getURL(getURLForUser(user._id));

    //profiles go before contracts of same date
    const orderedProfiles = sortAscending(journeyData.profiles, d => d.date)
      .filter(d => !d.isCurrent);
    const profilesData = profilesLayout(orderedProfiles)
    //console.log("profilesData", profilesData)

    //decksdata
    decksLayout
      .groupingTagKey(groupingTagKey)
      */

  //kpi values
  useEffect(() => {
    const cardsWithKpiValues = data
      .map((deck, i) => ({ deckId:deck.id, cards:addKpiValuesToCards(deck, datasets, i) }));

    cardsWithKpisRef.current = cardsWithKpiValues;
  }, [stringifiedCards, stringifiedDatasets])

  //layout and bind
  useEffect(() => {
    const decksToRender = selectedDeckId ? [data.find(d => d.id === selectedDeckId)] : data;
    const decksWithCardKpis = decksToRender.map(d => ({ 
      ...d, 
      cards:cardsWithKpisRef.current.find(obj => obj.deckId === d.id).cards
    }))
    
    _deckLayout
      .groupingTag(groupingTag)
      .timeframeKey(timeframeKey)
      .withSections(true);

    const decksData = decksWithCardKpis.map(deck => _deckLayout(deck)) 
    //console.log("decksData", decksData)
    d3.select(containerRef.current).datum(decksData)

  }, [stringifiedData, selectedDeckId])

  useEffect(() => { decks.selectedDeckId(selectedDeckId) }, [selectedDeckId])

  useEffect(() => {
    decks
      .width(width)
      .height(tableHeight + deckHeightWithMargins)
      .nrCols(nrCols)
      .groupingTag(groupingTag)
      .timeframeKey(timeframeKey)
      .selectedSection(selectedSection)
      .form(form)
      .x(deckX)
      .y(deckY)
      ._deckWidth((d,i) => deckWidth)
      ._deckHeight((d,i) => deckHeight)
      .getCell(getCell)
      .onCreateDeck(createNewDeck)
      .onSelectDeck(onSelectDeck)
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
      .onAddCard(addCard)
      .onDeleteCard(deleteCard)
      .zoom(zoom)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, /*width, height,*/ selectedSection, form?.formType, selectedDeckId])

  useEffect(() => {
    d3.select(containerRef.current).call(decks); 
  }, [stringifiedData, /*width, height,*/ selectedDeckId, selectedCardNr, selectedItemNr,  selectedSection, form?.formType])

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

        const { sourceEvent } = e;
        const clientY = isNumber(sourceEvent.clientY) ? sourceEvent.clientY : sourceEvent.touches[0].clientY;
        if(clientY < deckHeight/4){
          //scroll up if poss
        }else if(height - clientY < deckHeight/4){
          //scroll down if poss
        }
        const pseudoE = { dx: e.transform.x - zoomTransformPrev.x, dy:e.transform.y - zoomTransformPrev.y }
        decks.handleDrag(pseudoE, deckId);
        zoomTransformPrev = e.transform;
        e.sourceEvent.stopPropagation();
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
            .on("end", () => {
              if(zoomCallbackRef.current){
                zoomCallbackRef.current();
                zoomCallbackRef.current = null;
              }
            })
    }
    function zoomEnd(e){
      e.sourceEvent?.stopPropagation();
      if(zoomTransformLpStartRef.current){
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


  //DATE
  const handleDateChange = useCallback(dateKey => e => {
    //do date change here, then do saving, plus put last couple of props into DateForm that are commented out
    if(!e.target?.value){ return; }
    const dateValue = e.target.value; //must declare it before the setform call as the cb messes the timing of updates up
    if(dateKey === "startDate"){
      //save it as a startdate and a custom date too
      setForm(prevState => ({ ...prevState, hasChanged:true, value:{ ...prevState.value, startDate:dateValue, customStartDate:dateValue } }))
    }else{
      //its just a date
      setForm(prevState => ({ ...prevState, hasChanged:true, value:{ ...prevState.value, date:dateValue } }))
    }
  }, [form]);

  const handleCancelForm = useCallback(e => {
    setForm(null);
  }, [form]);

  const handleSaveDate = useCallback(e => {
    const newStartDateValue = form.value.startDate;
    const newDateValue = form.value.date;
    const newDate = new Date(newDateValue);
    newDate.setUTCHours(12);
    const newStartDate = new Date(newStartDateValue);
    newStartDate.setUTCHours(12);
    if(newStartDate && newDate < newStartDate){
      alert("The start date must be earlier than all target card dates.")
      return;
    }

    const cards = selectedDeck.cards.map(c => c.id !== form.value.id ? c : ({ ...c, date: newDate }))
    const startDate = newStartDate || selectedDeck.startDate
    updateDeck({ ...selectedDeck, startDate, cards })
    setForm(null);
}, [form, selectedDeckId]);

//keypresses
useEffect(() => {
  d3.select("body").on("keypress", (e) => {
    if(e.keyCode === "13" || e.key === "Enter"){
      e.preventDefault();
      if(form){
        if(form.formType === "item") { onSelectItem(); }
        if(form.formType === "card-date") { }
        setForm(null)
      }
    }
  })
}, [form, stringifiedData])


const itemPeople = selectedDeck && form?.formType === "item" ? [
  '/customers/england/analyst.png',
  '/customers/england/ryanGarry.png',
  selectedDeck.photoURL
 ] : []

 const onTouchEvent = e => {
    console.log("Decks touch event")
    const { target } = e;
    const { nodeName } = target;
    const className = d3.select(target).attr("class") || "";
    const isInteractive = className.includes("interactive") || className.includes("btn") || className.includes("icon") 
      || ["svg", "rect", "circle", "path", "polygon"].includes(nodeName)
    console.log("touchev", isInteractive, nodeName, className, target)
    alert(`d ${isInteractive}-${nodeName} -${className}`);
    if(!isInteractive){
      preventPropagationAndDefault(e);
    }
}
const preventPropagationAndDefault = e => {
  e.preventDefault();
  e.stopPropagation();
} 

  return (
    <div className={`cards-root ${classes.root}`} 
      onClick={onClickBg}
      onTouchStart={onTouchEvent}
      onTouchMove={onTouchEvent}
      onTouchEnd={onTouchEvent}
    >
      {data.map(deckData => 
        <div key={`cell-${deckData.id}`} className={`${classes.cell} cell interactive`} style={{ left: cellX(deckData), top: cellY(deckData) }}
          onTouchStart={onTouchEvent}
          onTouchMove={onTouchEvent}
          onTouchEnd={onTouchEvent}
        ></div>
      )}
      <svg className={classes.svg} id={`decks-svg`} overflow="visible">
        <g ref={zoomRef} className="zoom"><rect width={width} height={height} fill="transparent" /></g>
        <g ref={containerRef} className="decks" pointerEvents={selectedDeckId && !form ? "all" : "none"} />
        <defs>
          <clipPath id="card-photo">
            <circle></circle>
          </clipPath>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      <div className={classes.formUnderlay} onClick={onClickBg}
        onTouchStart={onTouchEvent}
        onTouchMove={onTouchEvent}
        onTouchEnd={onTouchEvent}
      ></div>
      <div className={classes.formContainer} ref={formRef} 
        onTouchStart={onTouchEvent}
        onTouchMove={onTouchEvent}
        onTouchEnd={onTouchEvent}
      >
        {/**form?.formType === "item" && 
          <ItemForm item={form.value} cardTitle={getCardTitle(form.value.id)} 
            dimns={getFormDimnsAndPos()} fontSize={form.height * 0.5} save={updateItemTitle} close={() => onSelectItem()} />
        */}
        {form?.formType === "item" && 
          <div 
            style={{ width:"100%", height:"100%", pointerEvents:"all" }}
            onClick={(e) => { e.stopPropagation(); }}
          >
            <ItemApp 
              screen={screen} item={{ ...form.value }}
              cardTitle={getCardTitle(form.value.id) || `Card ${form.value.cardNr + 1}`}
              save={updateItem} close={() => onSelectItem()} 
              logo={logo}
            />
          </div>
        }
        {form?.formType === "deck-title" && 
          <DeckTitleForm deck={selectedDeck} save={updateDeckTitle} close={() => setForm(null)}
            dimns={getFormDimnsAndPos()} 
          />
        }
        {form?.formType === "section" && 
          <SectionTitleForm section={selectedSection} saveTitle={updateSectionTitle} saveInitials={updateSectionInitials} 
            close={handleCancelForm} dimns={getFormDimnsAndPos()} 
          />
        }
        {form?.formType === "card-title" && 
          <CardTitleForm deck={selectedDeck} cardD={form.value} save={updateCardTitle} close={handleCancelForm}
            dimns={getFormDimnsAndPos()} 
          />
        }
        {form?.formType === "purpose" && 
          <PurposeParagraphForm deck={selectedDeck} paraD={form.value} save={updatePurposeParagraph} close={handleCancelForm}
            dimns={getFormDimnsAndPos()} 
          />
        }
        {form?.formType === "card-date" && 
          <CardDateForm dimns={getFormDimnsAndPos()} date={form.value.date} startDate={form.startDate} 
              handleDateChange={handleDateChange} handleCancelForm={handleCancelForm} handleSave={handleSaveDate}
              hasChanged={form.hasChanged}
            
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