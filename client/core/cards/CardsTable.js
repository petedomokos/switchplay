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
import { createPlayerFromUser } from '../../util/userHelpers';

const { burgerBarWidth, CUSTOMER_LOGO_WIDTH, CUSTOMER_LOGO_HEIGHT } = DIMNS;

const timeframeOptions = {
  longTerm:{ key:"longTerm", label:"Long Term" },
  singleDeck:{ key:"singleDeck", label:"Next Steps" }
} 

const useStyles = makeStyles((theme) => ({
  container:{
    width:"100vw",
    height:props => `calc(100vh - ${props.urlBarHeight}px)`,
    position:"relative",
    overflow:props => props.overflow,
    //border:"solid",
    borderColor:"white",
    borderWidth:"thin",
    touchAction:"none"
  },
  canvas: {
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
    touchAction:"none"
  },
  tableContents:{
    position:"absolute",
    left:props => props.tableContents.left,
    top:props => props.tableContents.top,
    width:props => `${props.tableContents.width}px`,
    height:props => `${props.tableContents.height}px`,
    transition: `top ${TRANSITIONS.MED}ms`,
    //border:"solid",
    borderColor:"yellow",
    borderWidth:"thin",
    touchAction:"none"
  },
  decksContents:{
    position:"absolute",
    left:props => props.decksContents.left,
    top:props => props.decksContents.top,
    width:props => `${props.decksContents.width}px`,
    height:props => `${props.decksContents.height}px`,
    transition: `top ${TRANSITIONS.MED}ms`,
    //border:"solid",
    borderColor:"red",
    borderWidth:"thin",
    touchAction: "none"
  },
  hideInstructions:{
    margin:"25px 5px",
    width:"125px",
    height:"30px",
    fontSize:"12px",
    color:grey10(2),
    touchAction:"none"
  },
  shouldDisplayInstructions:{

  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display,
    touchAction:"none"
  }
}))

//helper


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
  const atLeastOnePlayer = playerIds.length !== 0;

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

  //console.log("screen", screen)
  const width = screen.width || 300;
  const height = screen.height - screen.urlBarHeight || 600;

  const canvasWidth = 100000;
  const canvasHeight = 100000;

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
    const embellishedDecks = embellishDecks(tableDecks, settings);
    //console.log("emb", embellishedDecks)
    const decksData = tableLayout(embellishedDecks, nrCols, settings);
    //console.log("decksData", decksData)
    setDecksData(decksData);
  }, [allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTag, stringifiedTableAndDecks])

  //const deckScale = selectedDeckId ? 1 : nonSelectedDeckWidth/selectedDeckWidth;

  let styleProps = {
    touchAction:selectedDeckId ? "none" : "auto",
    urlBarHeight:screen.urlBarHeight,
    overflow:form ? null : "hidden",
    left: -canvasWidth/2,
    top: -canvasHeight/2,
    width: canvasWidth,
    height: canvasHeight,
    //padding:`${margin.top}px ${margin.right}px  ${margin.bottom}px  ${margin.left}px`,
    tableContents:{
      left: canvasWidth/2,
      top: canvasHeight/2,
      width,
      height
    },
    decksContents:{
      left: margin.left + (screen.width - width)/2,
      top: margin.top,
      width,
      height:height - tableHeaderHeight - 5
    },
    form:{ 
      display: form ? null : "none",
    },
    decks:{
      display:shouldDisplayInstructions ? "none" : "flex",
    },

  };

  const classes = useStyles(styleProps) 

  const onCreateDeck = useCallback((options={}) => {
    //@todo -in settings in Decks, give option to assign a different player or a group to the deck instead of the user
    const player = options.group ? null : (options.player || createPlayerFromUser(user));
    createDeck(user, { ...options, player }, table.id)
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

  const onTouchEvent = e => {
    const { target } = e;
    const { nodeName } = target;
    const className = d3.select(target).attr("class") || "";
    const isInteractive = className.includes("interactive") || className.includes("btn") || className.includes("icon") 
      || ["svg", "rect", "circle", "path", "polygon"].includes(nodeName)
    //console.log("touchev CT", /*styleProps.touchAction,*/ isInteractive, nodeName, className)
    //alert(`ct ${isInteractive}-${nodeName} -${className}`);
    if(!isInteractive){
      preventPropagationAndDefault(e);
    }
  }
  const preventPropagationAndDefault = e => {
    e.preventDefault();
    e.stopPropagation();
  } 
  return (
    <div className={`${classes.container} container`}
      onTouchStart={onTouchEvent}
      onTouchMove={onTouchEvent}
      onTouchEnd={onTouchEvent}
    >
      <div className={`${classes.canvas} canvas`} onClick={() => { setSelectedDeckId("") }}>
        <div className={`${classes.tableContents} table-contents`}>
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
          <div 
            className={`${classes.decksContents} decks-contents`}
            onTouchStart={onTouchEvent}
            onTouchMove={onTouchEvent}
            onTouchEnd={onTouchEvent}
          >
            {shouldDisplayInstructions ?  
              <Instructions />
              :
              <Decks 
                setForm={setForm} form={form} screen={screen}
                table={table} setSel={onSetSelectedDeckId} nrCols={nrCols} deckWidthWithMargins={deckWidthWithMargins} 
                datasets={datasets}
                logo={logo}
                data={decksData} height={contentsHeight * 0.8} heightInSelectedDeckMode={selectedDeckContentsHeight}
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
