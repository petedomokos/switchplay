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
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Instructions from "./Instructions"
import Decks from './Decks';
import { grey10, TRANSITIONS, COLOURS } from './constants';
import { withLoader } from '../../util/HOCs';

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
    background:COLOURS.CARDS_TABLE
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
const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

const embellishedDecks = (decks, nrCols=DEFAULT_NR_COLS) => decks
  .map((d,i) => ({
  ...d, 
  //@todo - impl layoutFormat grid
  colNr: /*layoutFormat === "grid" ? d.fixedColNr :*/ calcColNr(i, nrCols),
  rowNr: /*layoutFormat === "grid" ? d.fixedRowNr :*/ calcRowNr(i, nrCols),
  listPos:i,
}))

const CardsTable = ({ user, journeyData, customSelectedDeckId, datasets, loading, loadingError, screen, createTable, updateTable, createDeck, updateDeck, updateDecks, deleteDeck, hideMenus, showMenus }) => {
  const { tables=[], decks=[] } = user;
  //console.log("CardsTable...jData")

  //@todo - move creating flag to asyncProcesses
  const [creatingTable, setCreatingTable] = useState(false);
  //for now, we just assume its the first table
  useEffect(() => {
    if(user._id && tables.length === 0 && !creatingTable){
      setCreatingTable(true);
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

  const width = screen.width || 300;
  const height = screen.height || 600;

  const containerWidth = 100000;
  const containerHeight = 100000;

  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [shouldDisplayInstructions, setShouldDisplayInstructions] = useState(false);
  const [form, setForm] = useState(null);

  //we follow d3 margin convention here (eg html padding)
  //NOTE: WIDTH < HEIGHT TEMP FIXES A BUG WITH CARDTITLEFORM POSITIONING ON LARGER SCREENS
  //IT DOESNT FIX THE ISSUE FULLY ON SS WHEN IN LANDSCAPE ORIENTATION
  const multiDeckMarginTop = 35;
  const selectedDeckMarginTop = 0;
  const tableMarginTop = selectedDeckId && width < height ? selectedDeckMarginTop : multiDeckMarginTop;
  const tableMarginBottom = width < height ? 0 : 35;
  const margin = { 
    left:0,//width * 0.1,// selectedDeckId ? 0 : width * 0.05, 
    right:0,//width * 0.1,// selectedDeckId ? 0 : width * 0.05, 
    top:tableMarginTop,// height * 0.1,// selectedDeckId ? 20 : 40,// d3.max([vertSpaceForHeader + 10, height * 0.05]), 
    bottom:tableMarginBottom,//height * 0.1// selectedDeckId ? 0 :  height * 0.05
  }
  const contentsWidth = width - margin.left - margin.right;
  const contentsHeight = height - margin.top - margin.bottom;
  const selectedDeckContentsHeight = height - selectedDeckMarginTop - margin.bottom;

  const minDeckWidthWithMargins = 125;
  const nrCols = Math.floor(contentsWidth / minDeckWidthWithMargins);
  const remainingSpace = contentsWidth - nrCols * minDeckWidthWithMargins;
  const deckWidthWithMargins = minDeckWidthWithMargins + (remainingSpace/nrCols);

  const decksData = embellishedDecks(tableDecks, nrCols);
  const stringifiedData = JSON.stringify(tableDecks);

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

  const onSetSelectedDeckId = id => {
    setSelectedDeckId(id);
    if(id){ hideMenus() }
    else{ showMenus() }
  }

  return (
    <div className={classes.root} onClick={() => { setSelectedDeckId("") }}>
      <div className={classes.contents}>
        {shouldDisplayInstructions ?  
          <Instructions />
          :
          <Decks 
            table={table} setSel={onSetSelectedDeckId} nrCols={nrCols} deckWidthWithMargins={deckWidthWithMargins} 
            data={decksData} height={contentsHeight} heightInSelectedDeckMode={selectedDeckContentsHeight}
            journeyData={journeyData} tableMarginTop={tableMarginTop}
            onCreateDeck={onCreateDeck} deleteDeck={deleteDeck} updateDeck={updateDeck}
            updateTable={updateTable} updateDecks={updateDecks} availWidth={width} availHeight={height} />
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

//export default CardsTable;
export default withLoader(CardsTable, ["allDatasetsFullyLoaded"] )
