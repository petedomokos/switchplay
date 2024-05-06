import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Instructions from "./Instructions"
import Decks from './Decks';
import { grey10, TRANSITIONS, COLOURS, DIMNS } from './constants';
import { withLoader } from '../../util/HOCs';
import { embellishDecks } from "./embellishDecks"
import TableHeader from './TableHeader';
import { tableLayout } from "./tableLayout"
import { onlyUnique } from "../../util/ArrayHelpers"

const { burgerBarWidth, CUSTOMER_LOGO_WIDTH, CUSTOMER_LOGO_HEIGHT } = DIMNS;

const timeframeOptions = {
  longTerm:{ key:"longTerm", label:"Long Term" },
  singleDeck:{ key:"singleDeck", label:"Next Steps" }
} 

const useStyles = makeStyles((theme) => ({
  outerRoot:{
    width:"100vw",
    height:"100vh",
    position:"relative",
    overflow:props => props.overflow
  },
  root: {
    position: "absolute",
    left:props => props.left,
    top:props => props.top,
    width:props => props.width,
    height:props => props.height,
    //margin:"30px",
    //padding:props => props.padding,
    transition: `all ${TRANSITIONS.MED}ms`,
    //display:"flex",
    //flexDirection:"column",
    background:COLOURS.CARDS_TABLE,
    overflow:"scroll",
    //border:"solid",
    //borderColor:"yellow"
    //borderWidth:"thin",
  },
  tableContents:{
    position:"absolute",
    left:props => props.tableContents.left,
    top:props => props.tableContents.top,
    width:"200px",
    height:"200px",
    transition: `top ${TRANSITIONS.MED}ms`,
  },
  decksContents:{
    position:"absolute",
    left:props => props.decksContents.left,
    top:props => props.decksContents.top,
    transition: `top ${TRANSITIONS.MED}ms`,
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

const CardsTable = ({ user, customSelectedDeckId, datasets, loading, loadingError, screen, createTable, updateTable, createDeck, updateDeck, updateDecks, deleteDeck, hideMenus, showMenus }) => {
  const { tables=[], decks=[], customer } = user;
  const stringifiedDecks = JSON.stringify(decks);

  //next - find where kpi values are added, and adjust so they are not all completed
  //console.log("CardsTable", user)
  //console.log("datasets", datasets)
  // @todo - move creating flag to asyncProcesses
  // helper consts
  // data will be grouped by playerId if at least one deck has a playerid tag, otherwise it is not grouped
  const playerIds = decks.map(d => d.player?._id)
  const allPlayerIdsSame = playerIds.filter(onlyUnique).length === 1;
  const allPlayerIdsUnique = playerIds.filter(onlyUnique).length === decks.length;
  const atLeastOnePlayer = playerIds.length !== 0

  //State
  const [timeframe, setTimeframe] = useState(timeframeOptions.singleDeck);
  const [creatingTable, setCreatingTable] = useState(false);
  const [decksData, setDecksData] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [shouldDisplayInstructions, setShouldDisplayInstructions] = useState(false);
  const [form, setForm] = useState(null);

  const timeframeKey = timeframe.key === "longTerm" ? "longTerm" : "singleDeck";
  let groupingTag;
  if(timeframeKey === "longTerm"){
    groupingTag = "player";
  }else if(!atLeastOnePlayer || allPlayerIdsSame || allPlayerIdsUnique){
    //we never group decks if all decks refer to same player, unless user wants the long-term view
    groupingTag = ""
  }else{
    groupingTag = "player"
  }

  const toggleTimeframe = () => {
    setTimeframe(prevState => prevState.key === "singleDeck" ? timeframeOptions.longTerm : timeframeOptions.singleDeck)
  }

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

  if(tables.length === 0){ return null; }

  const logo = {
    url:customer ? `/customers/${customer._id}/logo.png` : "/switchplay/logo.png",
    transform:customer ? customer.tableLogoTransform : "translate(-70px,-70px) scale(0.2)"
  }
  const table = { 
    ...tables[0], 
    title:tables[0]?.title || customer?.name || "",
    photoURL:logo.url,
    logoTransform:logo.transform
  };
  const tableDecks = table?.decks.map(id => decks.find(d => d.id === id)).filter(d => d) || [];
  const stringifiedTableAndDecks = JSON.stringify({ table, tableDecks });

  const width = screen.width || 300;
  const height = screen.height || 600;

  const containerWidth = 100000;
  const containerHeight = 100000;

  //we follow d3 margin convention here (eg html padding)
  //NOTE: WIDTH < HEIGHT TEMP FIXES A BUG WITH CARDTITLEFORM POSITIONING ON LARGER SCREENS
  //IT DOESNT FIX THE ISSUE FULLY ON SS WHEN IN LANDSCAPE ORIENTATION
  const tableHeaderHeight = 60;
  const selectedDeckMarginTop = 0;
  const tableMarginTop = selectedDeckId && width < height ? selectedDeckMarginTop : tableHeaderHeight;
  const tableMarginBottom = width < height ? 0 : tableHeaderHeight;
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

  //this adds status and completionProportion to cards and deck based on items statuses
  useEffect(() => {
    const settings = { allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTag }
    //console.log("tableDecks", tableDecks)
    const embellishedDecks = embellishDecks([tableDecks[0]], settings);
    //console.log("emb", embellishedDecks)
    const decksData = tableLayout(embellishedDecks, nrCols, settings);
    //console.log("decksData", decksData)
    setDecksData(decksData);
  }, [allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTag, stringifiedTableAndDecks])

  //const deckScale = selectedDeckId ? 1 : nonSelectedDeckWidth/selectedDeckWidth;

  let styleProps = {
    overflow:form ? null : "hidden",
    left: -containerWidth/2,
    top: -containerHeight/2,
    width: containerWidth,
    height: containerHeight,
    //padding:`${margin.top}px ${margin.right}px  ${margin.bottom}px  ${margin.left}px`,
    tableContents:{
      left: containerWidth/2,
      top: containerHeight/2,
    },
    decksContents:{
      left: margin.left + (screen.width - width)/2,
      top: margin.top,
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

  const stringifiedData = JSON.stringify(decksData);

  const handleUpdateDeck = useCallback(deck => {
    if(timeframeKey === "longTerm"){
      //in this case, just update the decksData object here
      setDecksData(prevState => prevState.map(d => d.id !== deck.id ? d : ({ ...d, ...deck })))
    }else{
      updateDeck(deck)
    }
  }, [stringifiedData, form, selectedDeckId, timeframeKey]);

  return (
    <div className={classes.outerRoot}>
      <div className={classes.root} onClick={() => { setSelectedDeckId("") }}>
        <div className={classes.tableContents}>
          {!selectedDeckId && <TableHeader dimns={{ 
              padding: { left:10, right:10, top:tableHeaderHeight * 0.1, bottom:tableHeaderHeight * 0.1 },
              width:width, 
              height:tableHeaderHeight 
            }}
            table={table}
            timeframe={timeframe}
            nrTimeframeOptions={atLeastOnePlayer ? 2 : 1}
            toggleTimeframe={toggleTimeframe}
          />}
          <div className={classes.decksContents}>
            {shouldDisplayInstructions ?  
              <Instructions />
              :
              <Decks 
                setForm={setForm} form={form} screen={screen}
                table={table} setSel={onSetSelectedDeckId} nrCols={nrCols} deckWidthWithMargins={deckWidthWithMargins} 
                datasets={datasets}
                logo={logo}
                data={decksData} height={contentsHeight} heightInSelectedDeckMode={selectedDeckContentsHeight}
                groupingTag={groupingTag} timeframeKey={timeframeKey}
                tableMarginTop={tableMarginTop}
                onCreateDeck={onCreateDeck} deleteDeck={deleteDeck} updateDeck={handleUpdateDeck}
                updateTable={updateTable} updateDecks={updateDecks} availWidth={width} availHeight={height} />
            }
          </div>
        </div>
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
