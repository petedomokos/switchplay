import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import cardStacksLayout from './cardStacksLayout';
import cardsVisComponent from "./cardsVisComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initStack } from '../../data/cards';
//import { createId } from './helpers';

import { grey10 } from './constants';

const instructions = [
  { keyPhrase:"Swipe a card down", rest:" to put it down" },
  { keyPhrase:"Swipe a card up", rest:" to pick it up" },
  { keyPhrase:"Tap the top of a card", rest:" to bring it closer/put it back" },
  { keyPhrase:"Tap a section", rest:" to edit" },
  { keyPhrase:"Longpress a section", rest:" to change status" }
]

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:props => props.screen.width,
    height:props => props.screen.height,
    display:"flex",
    flexDirection:"column",
    background:grey10(9)
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
  hideInstructions:{
    margin:"25px 5px",
    width:"125px",
    height:"30px",
    fontSize:"12px",
    color:grey10(2)

  },
  showInstructions:{

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

// next - position the form properly, need the topSpaceheight and margins so we can get to top left of selected card.
// may change margins for selected so it expands even more to take entire screen
// also then decide how to close the form and deselect if it wasnt selected before item was clicked
// then impl the very basic form properly (just title), and how it saves, inc keyPress
//also
//Make a note somewhere for later to consider making it go to a list of all 5 items, as long as keyboard causes it to scroll up 
//like trello so the one being edited is in screen
//this way, we can enter 5 items as a list. but we lose the positional meaning of the 5 items eg 4 corner model for FA for example

const Cards = ({ user, customActiveStack, data, datasets, asyncProcesses, screen, save }) => {
  //we dont user defaultProps as we want to pass through userId too
  const stacksData = data && data.length !== 0 ? data : [initStack(user?._id)];
  const activeStack = stacksData.find(s => s.id === customActiveStack) || stacksData[0];
  const notSavedYet = !data?.find(s => s.id === activeStack.id);
  //console.log("Cards", activeStack)
  //console.log("screen", screen)

  const [showInstructions, setShowInstructions] = useState(false)// useState(activeStack.id === "temp");
  const [layout, setLayout] = useState(() => cardStacksLayout());
  const [cards, setCards] = useState(() => cardsVisComponent());
  const [form, setForm] = useState(null);
  //console.log("Form", form)

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
  const instructionsRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  useEffect(() => {
    //setShowInstructions(activeStack.id === "temp");
  }, [activeStack._id])

  useEffect(() => {
    //for now, just use active stack
    //const orderedCardsData = sortAscending(activeStack.cards, d => d.date);

    const processedStacksData = layout(stacksData);
    //just use first stack for now
    d3.select(containerRef.current).datum(processedStacksData[0])

  }, [stringifiedData])

  useEffect(() => {
    cards
      .width(screen.width || 300)
      .height(screen.height || 600)
      .updateItemStatus(updateItemStatus)
      .updateFrontCardNr(updateFrontCardNr)
      .setForm(setForm)

  }, [stringifiedData, screen])

  useEffect(() => {
    d3.select(containerRef.current).call(cards);
  }, [stringifiedData, screen])

  const handleHideInstructions = () => {
    d3.select(instructionsRef.current)
      .style("opacity", 1)
      .transition()
        .duration(200)
        .style("opacity", 0);

    d3.select(containerRef.current)
      .style("display", null)
      .style("opacity", 0)
      .transition()
        .delay(300)
        .duration(200)
        .style("opacity", 1)
          .on("end", () => { setShowInstructions(false); });
  }

  const updateStack = useCallback(updatedStack => {
    save(updatedStack, notSavedYet);
  }, [stringifiedData]);

  const updateFrontCardNr = useCallback(cardNr => {
    updateStack({ ...activeStack, frontCardNr:cardNr })
  }, [stringifiedData, form]);

  const updateCard = useCallback((updatedCard) => {
    //console.log("updateCard", updatedCard)
    const updatedCards = activeStack.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    updateStack({ ...activeStack, cards:updatedCards })
  }, [stringifiedData]);

  const updateItemTitle = useCallback(updatedTitle => {
    //console.log("updateTitle", updatedTitle, form)
    const { cardNr, itemNr } = form.value;
    const cardToUpdate = activeStack.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, title: updatedTitle }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData, form]);

  const updateItemStatus = useCallback((cardNr, itemNr, updatedStatus) => {
    //console.log("updateItemStatus", cardNr, itemNr, updatedStatus)
    const cardToUpdate = activeStack.cards.find(c => c.cardNr === cardNr);
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
      <div className={classes.instructionsSection} ref={instructionsRef}
        style={{display:showInstructions ? null : "none"}}>
        <div className={classes.instructionsTitle}>How To Play</div>
        <div className={classes.instructions}>
          {instructions.map((ins,i) => 
              <p className={classes.instruction} key={`ins-${i}`}>
                <span className={classes.keyPhrase}>{ins.keyPhrase}</span>
                {ins.rest}
              </p>
          )}
          <Button color="primary" variant="contained" onClick={() => handleHideInstructions()} className={classes.hideInstructions}>Go To Cards</Button>
        </div>
      </div>
      <svg className={classes.svg} ref={containerRef} id={`cards-svg`} 
        style={{display:showInstructions ? "none" : null}}>
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {/**form && <div className={classes.formOverlay} onClick={handleSaveForm}></div>*/}
      <div className={classes.formContainer}>
          {form?.formType === "item" && 
            <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
          }
      </div>
    </div>
  )
}

Cards.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default Cards;