import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import cardStacksLayout from './cardStacksLayout';
import cardsVisComponent from "./cardsVisComponent";
import { sortAscending } from '../../util/ArrayHelpers';
import { initStack } from '../../data/cards';
//import { createId } from './helpers';

import { grey10 } from './constants';

const instructions = [
  { keyPhrase:"Swipe a card down", rest:" to put it down" },
  { keyPhrase:"Swipe a card up", rest:" to pick it up" },
  { keyPhrase:"Tap a card", rest:" to bring it closer/put it back" },
  { keyPhrase:"Tap a line", rest:" to change an items status" }
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
    color:grey10(2)

  },
  showInstructions:{

  },
  svg:{
  },

}))

const Cards = ({ user, customActiveStack, data, datasets, asyncProcesses, screen, save }) => {
  //we dont user defaultProps as we want to pass through userId too
  const stacksData = data && data.length !== 0 ? data : [initStack(user?._id)];
  const activeStack = stacksData.find(s => s.id === customActiveStack) || stacksData[0];
  console.log("Cards", stacksData)
  //console.log("screen", screen)

  const [showInstructions, setShowInstructions] = useState(true);
  const [layout, setLayout] = useState(() => cardStacksLayout());
  const [cards, setCards] = useState(() => cardsVisComponent());

  let styleProps = {
    screen
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

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
    console.log("updateStack", updatedStack)
    //const updatedStackData = stacksData.map(s => s.id !== updatedStack.id ? s : updatedStack);
    //save(user._id, updatedStackData);
    save(updatedStack);
  }, [stringifiedData]);

  const updateCard = useCallback((updatedCard) => {
    console.log("updateCard", updatedCard)
    const updatedCards = activeStack.cards.map(c => c.cardNr !== updatedCard.cardNr ? c : updatedCard);
    updateStack({ ...activeStack, cards:updatedCards })
  }, [stringifiedData]);

  const updateItemTitle = useCallback((cardNr, itemNr, updatedTitle) => {
    console.log("updateTitle", cardNr, itemNr, updatedTitle)
    const cardToUpdate = activeStack.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, title: updatedTitle }));
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData]);

  const updateItemStatus = useCallback((cardNr, itemNr, updatedStatus) => {
    console.log("updateItemStatus", cardNr, itemNr, updatedStatus)
    const cardToUpdate = activeStack.cards.find(c => c.cardNr === cardNr);
    const updatedItems = cardToUpdate.items.map(it => it.itemNr !== itemNr ? it : ({ ...it, status: updatedStatus }));
    //next - update it in store, with no persistance, and then persist
    //then next after that, do the titles/react inputs
    updateCard({ ...cardToUpdate, items:updatedItems })
  }, [stringifiedData]);

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
    </div>
  )
}

Cards.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default Cards;