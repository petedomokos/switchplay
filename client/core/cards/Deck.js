import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import deckLayout from './deckLayout';
import deckComponent from "./deckComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initStack } from '../../data/cards';
//import { createId } from './helpers';

import { grey10 } from './constants';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:props => props.screen.width * 0.9,
    height:props => props.screen.height * 0.98,
    display:"flex",
    flexDirection:"column",
    border:"solid",
    borderWidth:"thin",
    borderColor:grey10(7)
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
  svg:{
  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.form.width}px`,
    height:props => `${props.form.height}px`,
    display:props => props.form.display
  }

}))

const Deck = ({ user, data, datasets, asyncProcesses, screen, save }) => {
  //we dont user defaultProps as we want to pass through userId too
  const deckData = data || initStack(user?._id);
  console.log("Deck", data)

  const [layout, setLayout] = useState(() => deckLayout());
  const [deck, setDeck] = useState(() => deckComponent());
  const [form, setForm] = useState(null);

  let styleProps = {
    screen,
    form:{ 
      display: form ? null : "none",
      width:screen.width || 300,
      height:screen.height || 600 
    }
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  useEffect(() => {
    const processedDeckData = layout(deckData);
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData])

  useEffect(() => {
    deck
      .width(screen.width || 300)
      .height(screen.height || 600)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)

  }, [stringifiedData, screen])

  useEffect(() => {
    d3.select(containerRef.current).call(deck);
  }, [stringifiedData, screen])

  const updateStack = useCallback(updatedStack => {
    save(updatedStack, notSavedYet);
  }, [stringifiedData]);

  const updateFrontCardNr = useCallback(cardNr => {
    updateStack({ ...deckData, frontCardNr:cardNr })
  }, [stringifiedData, form]);

  const updateCard = useCallback((updatedCard) => {
    //console.log("updateCard", updatedCard)
    const updatedCards = deckData.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    updateStack({ ...deckData, cards:updatedCards })
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
    <div className={`cards-root ${classes.root}`}>
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
    </div>
  )
}

Deck.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default Deck;