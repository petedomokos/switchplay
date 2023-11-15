import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import deckLayout from './deckLayout';
import deckComponent from "./deckComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/initDeck';
//import { createId } from './helpers';
import { TRANSITIONS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
import { get } from 'lodash';
const { GOLD } = COLOURS;



const useStyles = makeStyles((theme) => ({
  root: {
  },
}))

const Deck = ({ user, data, selectedDeckId, scale, datasets, asyncProcesses, width, height, onClick, update }) => {
  //we dont user defaultProps as we want to pass through userId too
  const deckData = data || initDeck(user?._id);
  //console.log("Deck", selectedDeckId)
  const isSelected = selectedDeckId === deckData.id;

  const [layout, setLayout] = useState(() => deckLayout());
  const [deck, setDeck] = useState(() => deckComponent());
  const [form, setForm] = useState(null);

  let styleProps = {
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  /*
  useEffect(() => {
    const processedDeckData = layout(deckData);
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData])

  useEffect(() => {
    deck
      .width(width)
      .height(height)
      .selectedDeckId(selectedDeckId)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    //why when we comment out this line, only the 1st deck opens!?
    //d3.select(containerRef.current).call(deck);
  }, [stringifiedData, width, height, selectedDeckId])
  */

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
    <g className={`deck-cont-${data.id}`} ref={containerRef} >
      <rect width={width} height={height} stroke="blue" fill="none" />
    </g>
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