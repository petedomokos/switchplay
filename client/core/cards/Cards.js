import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import cardsLayout from './cardsLayout';
import cardsVisComponent from "./cardsVisComponent";
import { sortAscending } from '../../util/ArrayHelpers';
//import { createId } from './helpers';
 import { mockCards } from './mockCards';
import { grey10 } from './constants';
import { mergeClasses } from '@material-ui/styles';

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

const Cards = ({ user, data, datasets, asyncProcesses, screen }) => {
  const { } = data;
  //console.log("Cards user", user)
  //console.log("screen", screen)

  const [showInstructions, setShowInstructions] = useState(true);
  const [layout, setLayout] = useState(() => cardsLayout());
  const [cards, setCards] = useState(() => cardsVisComponent());

  let styleProps = {
    screen
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  useEffect(() => {
    //console.log("uE layout-------------")
    if(asyncProcesses.creating.datapoints){ 
      //saving datapoint so dont update
      return; 
    }

    //profiles go before contracts of same date
    const orderedData = sortAscending(data.cards, d => d.date);

    d3.select(containerRef.current).datum(layout(orderedData))

  }, [stringifiedData])

  useEffect(() => {
    cards
      .width(screen.width || 300)
      .height(screen.height || 600)

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

  return (
    <div className={`cards-root ${classes.root}`}>
      <div className={classes.instructionsSection} ref={instructionsRef}
        style={{display:showInstructions ? null : "none"}}>
        <div className={classes.instructionsTitle}>How To Play</div>
        <div className={classes.instructions}>
          {instructions.map(ins => 
              <p className={classes.instruction}>
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
  data: {
    cards:mockCards
  },
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default Cards;