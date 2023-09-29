import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
//import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import IconComponent from './IconComponent';
import Decks from './Decks';
import { grey10, TRANSITIONS } from './constants';

const instructions = [
  { keyPhrase:"Swipe up", rest:" to pick up a card" },
  { keyPhrase:"Swipe down", rest:" to put down a card" },
  { keyPhrase:"Tap a section", rest:" to view or edit" },
  { keyPhrase:"Longpress a section", rest:" to change status" }
]

const useStyles = makeStyles((theme) => ({
  root:{
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
}))

const Instructions = () => {
  let styleProps = {};
  const classes = useStyles(styleProps);
  const instructionsRef = useRef(null);

  return (
    <div className={classes.root} ref={instructionsRef} >
        <div className={classes.instructionsTitle}>How To Play</div>
        <div className={classes.instructions}>
            {instructions.map((ins,i) => 
                <p className={classes.instruction} key={`ins-${i}`}>
                <span className={classes.keyPhrase}>{ins.keyPhrase}</span>
                {ins.rest}
                </p>
            )}
            <Button color="primary" variant="contained" onClick={() => handleHideInstructions()} className={classes.hideInstructions}>
                Go To Cards
            </Button>
        </div>
    </div>
  )
}

Instructions.defaultProps = {
  customSelectedDeckId:"",
  asyncProcesses:{},
  datasets: [], 
  screen: {},
  shouldDisplay: false
}

export default Instructions;