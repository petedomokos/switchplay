import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
//import { initDeck } from '../../data/cards';
import { isNumber } from '../../data/dataHelpers';
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
    width:props => props.width,
    height:props => props.height,
    //margin:"30px",
    //padding:props => props.padding,
    transition: `all ${TRANSITIONS.MED}ms`,
    //display:"flex",
    //flexDirection:"column",
    background:grey10(9)
    //border:"solid",
    //borderWidth:"thin",
  },
  contents:{
    position:"absolute",
    left:props => props.contents.left,
    top:props => props.contents.top,
    transition: `top ${TRANSITIONS.MED}ms`,
    //width:props => props.contents.width,
    //height:props => props.contents.height,
    //background:"red"
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
const DEFAULT_NR_COLS = 3;
const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

const embellishedDecks = (decks, nrCols=DEFAULT_NR_COLS) => decks
  .map((d,i) => ({
  ...d, 
  colNr: isNumber(d.colNr) ? d.colNr : calcColNr(i, nrCols),
  rowNr: isNumber(d.rowNr) ? d.rowNr : calcRowNr(i, nrCols),
  listPos:i
}))

/*
todo
   - work out why 2 tables are being created - wy is cerate`table being called on each reload
   - put teh new deck icon back on screen
   - create a new deck by clicking icon -> add the deckid into the table.decks array too, so need to also updateTable
   (this will be a separate Reacr rerender, but the order they happen in shouldnt matter, it will only show the deck when both are returned)


*/
const CardsTable = ({ user, customSelectedDeckId, datasets, asyncProcesses, screen, createTable, updateTable, createDeck, updateDeck, deleteDeck }) => {
  const { tables=[], decks=[] } = user;
  //console.log("tables", tables)

  //@todo - move creating flag to asyncProcesses
  const [creatingTable, setCreatingTable] = useState(false);
  //for now, we just assume its the first table
  //console.log("CardsTable", user._id, creatingTable, user.tables)
  useEffect(() => {
    if(user._id && tables.length === 0 && !creatingTable){
      setCreatingTable(true);
      //console.log("call createTable..................")
      createTable();
      return;
    }
    //reset flag if it has been created
    if(tables.length !== 0 && creatingTable){
      setCreatingTable(false)
    }
  },[user._id, tables.length])

  const table = tables[0];
  const tableDecks = table?.decks.map(id => decks.find(d => d.id === id)).filter(d => d) || [];
  //console.log("tableDecks", tableDecks.map(d => d.id))

  const width = screen.width || 300;
  const height = screen.height || 600;

  const containerWidth = 100000;
  const containerHeight = 100000;

  const nrCols = DEFAULT_NR_COLS;

  const decksData = embellishedDecks(tableDecks, nrCols);
  const stringifiedData = JSON.stringify(tableDecks);

  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [shouldDisplayInstructions, setShouldDisplayInstructions] = useState(false);
  const [form, setForm] = useState(null);

  //we follow d3 margin convention here (eg html padding)
  //const vertSpaceForHeader = 40;
  const margin = { 
    left:0,//width * 0.1,// selectedDeckId ? 0 : width * 0.05, 
    right:0,//width * 0.1,// selectedDeckId ? 0 : width * 0.05, 
    top: selectedDeckId ? 0 : 35,// height * 0.1,// selectedDeckId ? 20 : 40,// d3.max([vertSpaceForHeader + 10, height * 0.05]), 
    bottom:0,//height * 0.1// selectedDeckId ? 0 :  height * 0.05
  }
  const contentsWidth = width - margin.left - margin.right;
  const contentsHeight = height - margin.top - margin.bottom;

  //const deckScale = selectedDeckId ? 1 : nonSelectedDeckWidth/selectedDeckWidth;

  let styleProps = {
    left: -containerWidth/2,
    top: -containerHeight/2,
    width: containerWidth,
    height: containerHeight,
    //padding:`${margin.top}px ${margin.right}px  ${margin.bottom}px  ${margin.left}px`,
    contents:{
      left: containerWidth/2 + margin.left + (screen.width - width)/2,
      top: containerHeight/2 + margin.top,
    },
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

  const onCreateDeck = useCallback((settings={}) => {
    createDeck(settings, table.id)
  }, [table]);

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
      <div className={classes.contents}>
        {shouldDisplayInstructions ?  
          <Instructions />
          :
          <Decks 
            table={table} setSel={setSelectedDeckId} nrCols={nrCols} 
            data={decksData} width={contentsWidth} height={contentsHeight} 
            onCreateDeck={onCreateDeck} deleteDeck={deleteDeck} 
            updateTable={updateTable} updateDeck={updateDeck} />
        }
      </div>
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
