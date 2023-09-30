import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
//import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import IconComponent from './IconComponent';
import Instructions from "./Instructions"
import Decks from './Decks';
import { grey10, TRANSITIONS } from './constants';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"absolute",
    left:props => props.left,
    top:props => props.top,
    width:props => props.width * 10,
    height:props => props.height * 10,
    transition: `all ${TRANSITIONS.MED}ms`,
    //display:"flex",
    //flexDirection:"column",
    background:grey10(9)
  },
  hideInstructions:{
    margin:"25px 5px",
    width:"125px",
    height:"30px",
    fontSize:"12px",
    color:grey10(2)
  },
  shouldDisplayInstructions:{

  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display
  }
}))

//helpers
/*
const createMockDecks = (userId, nrDecks=1) => d3.range(nrDecks).map((nr,i) =>  
  ({ 
      ...initDeck(userId), 
      id:`temp-${nr}`,
  })
)
*/

const calcColNr = i => i % 3;
const calcRowNr = i => Math.floor(i/3);

const embellishedDecks = decks => decks
  .map((d,i) => ({ ...d, i }))
  .map((d,i) => ({
  ...d, 
  colNr:calcColNr(i),
  rowNr:calcRowNr(i),
}))

const CardsTable = ({ user, customSelectedDeckId, datasets, asyncProcesses, screen, createDeck, updateDeck }) => {
  const { decks=[] } = user;
  /*const decks = [
    { id:"d1" }, { id:"d2" }, { id:"d3" }, { id:"d4" }
  ]*/
  //console.log("screen", screen)
  //const decks = user?.decks[0] ? [user.decks[0]] : []
  const width = screen.width || 300;
  const height = screen.height || 600;
  //console.log("CardsTable", decks)

  const decksData = embellishedDecks(decks);
  //console.log("decksData", decksData)
  const stringifiedData = JSON.stringify(decksData);

  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [shouldDisplayInstructions, setShouldDisplayInstructions] = useState(false);
  const [form, setForm] = useState(null);

  //we follow d3 margin convention here (eg html padding)
  const vertSpaceForHeader = 40;
  const margin = { 
    left:0,// selectedDeckId ? 0 : width * 0.05, 
    right:0,// selectedDeckId ? 0 : width * 0.05, 
    top: 30,// selectedDeckId ? 20 : 40,// d3.max([vertSpaceForHeader + 10, height * 0.05]), 
    bottom:0,// selectedDeckId ? 0 :  height * 0.05
  }
  const tableContentsWidth = width - margin.left - margin.right;
  const tableContentsHeight = height - margin.top - margin.bottom;

  //const deckScale = selectedDeckId ? 1 : nonSelectedDeckWidth/selectedDeckWidth;

  let styleProps = {
    width:tableContentsWidth * 10, //selectedDeck ? width * 3 : width,
    height: tableContentsHeight * 10,
    form:{ 
      display: form ? null : "none",
    },
    decks:{
      display:shouldDisplayInstructions ? "none" : "flex",
    },

  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  useEffect(() => {
    //setShouldDisplayInstructions(???);
  }, [selectedDeckId])

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
    <div className={classes.root} onClick={() => { setSelectedDeckId("") }}>
      {shouldDisplayInstructions ?  
        <Instructions />
        :
        <Decks data={decksData} width={tableContentsWidth} height={tableContentsHeight} updateDeck={updateDeck} />
      }
    </div>
  )
}

CardsTable.defaultProps = {
  customSelectedDeckId:"",
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default CardsTable;