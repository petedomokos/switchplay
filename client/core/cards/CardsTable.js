import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ItemForm from "./forms/ItemForm";
import Deck from "./Deck";
import { sortAscending } from '../../util/ArrayHelpers';
//import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import IconComponent from './IconComponent';
import { grey10, TRANSITIONS } from './constants';

const instructions = [
  { keyPhrase:"Swipe up", rest:" to pick up a card" },
  { keyPhrase:"Swipe down", rest:" to put down a card" },
  { keyPhrase:"Tap a section", rest:" to view or edit" },
  { keyPhrase:"Longpress a section", rest:" to change status" }
]

const useStyles = makeStyles((theme) => ({
  root: {
    position:"absolute",
    left:props => props.left,
    top:props => props.top,
    width:props => props.width,
    height:props => props.height,
    transition: `all ${TRANSITIONS.MED}ms`,
    //display:"flex",
    //flexDirection:"column",
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
  decks:{
    display:props => props.decks.display,
    width:1000, //props => `${props.width}px`,
    transition: `all ${TRANSITIONS.MED}ms`,
    height:1000, //props => `${props.height}px`,
    flexWrap:"wrap",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    /*border:"solid",
    borderWidth:"thin", 
    borderColor:"yellow"*/
  },
  deckContainer:{
    position:"absolute",
    width:props => `${props.deckContainer.width}px`, //always selectedWidth
    height:props => `${props.deckContainer.height}px`, //always selectedHeight
    //scales down when no deck selected
    transform:props => `scale(${props.deckContainer.scale})`, 
    transformOrigin:"top left",
    transition: `transform ${TRANSITIONS.MED}ms, top ${TRANSITIONS.MED}ms, left ${TRANSITIONS.MED}ms`,
    /*border:"solid",
    borderWidth:"thin", 
    borderColor:"blue"*/

  },
  //add deck
  addTextWrapper:{
  },
  addDeckText:{

  },
  addDeckIconContainer:{
    position:"absolute",
    left:props => props.addDeckIcon.left,
    top:props => props.addDeckIcon.top,
    width:props => `${props.addDeckIcon.width}px`,
    height:props => `${props.addDeckIcon.height * 0.4}px`,
    padding:props => `${props.addDeckIcon.height * 0.3}px 0px`,
    //transition: `${TRANSITIONS.MED}ms`,
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-around",
    alignItems:"center",
    color:grey10(4),
    /*border:"solid",
    borderWidth:"thin", 
    borderColor:"red"*/
  },
  newDeckPlaceholder:{
    width:props => `${props.deckContainer.width}px`,
    height:props => `${props.deckContainer.height}px`,
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    fontSize:"12px",
    background:grey10(5)
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
  //const decks = [user.decks[0]]
  const width = screen.width || 300;
  const height = screen.height || 600;
  //console.log("CardsTable", decks)

  const decksData = embellishedDecks(decks);
  //console.log("decksData", decksData)
  const stringifiedData = JSON.stringify(decksData);

  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [showInstructions, setShowInstructions] = useState(false);
  const [form, setForm] = useState(null);

  const selectedDeck = decksData.find(d => d.id === selectedDeckId);

  //we follow d3 margin convention here (eg html padding)
  const vertSpaceForHeader = 40;
  const margin = { 
    left:0,// selectedDeckId ? 0 : width * 0.05, 
    right:0,// selectedDeckId ? 0 : width * 0.05, 
    top: selectedDeckId ? 20 : 40,// d3.max([vertSpaceForHeader + 10, height * 0.05]), 
    bottom:0,// selectedDeckId ? 0 :  height * 0.05
  }
  const tableContentsWidth = width - margin.left - margin.right;
  const tableContentsHeight = height - margin.top - margin.bottom;

  const selectedDeckWidth = tableContentsWidth * 0.98;
  const selectedDeckHeight = tableContentsHeight * 0.98;
  //aspect ratio is width to height, so height * ratio = width
  const aspectRatio = selectedDeckWidth / selectedDeckHeight;
  const nonSelectedDeckWidth = /*selectedDeck ? 0 :*/ d3.min([tableContentsWidth/3, 200]);
  const nonSelectedDeckHeight = nonSelectedDeckWidth / aspectRatio;

  //extra margin at bottom of each deck to give a nice gap between them
  const deckMarginBottom = 20// selectedDeck ? 20 : 30;

  const deckWidth = selectedDeck ? selectedDeckWidth : nonSelectedDeckWidth;
  const deckHeight = selectedDeck ? selectedDeckHeight : nonSelectedDeckHeight;
  //new icon goes in next avail slot
  const addDeckIconLeft = margin.left + calcColNr(decksData.length) * nonSelectedDeckWidth;
  const addDeckIconTop = margin.top + calcRowNr(decksData.length) * nonSelectedDeckHeight;

  const deckScale = selectedDeckId ? 1 : nonSelectedDeckWidth/selectedDeckWidth;

  let styleProps = {
    left:selectedDeck ? -selectedDeckWidth * selectedDeck.colNr : 0,
    top:selectedDeck ? -selectedDeckHeight * selectedDeck.rowNr : 0,
    width:tableContentsWidth * 10, //selectedDeck ? width * 3 : width,
    height: tableContentsHeight * 10,
    form:{ 
      display: form ? null : "none",
    },
    decks:{
      display:showInstructions ? "none" : "flex",
    },
    deckContainer:{
      //width:deckWidth,
      //height:deckHeight,
      width:selectedDeckWidth,
      height:selectedDeckHeight,
      scale:selectedDeckId ? 1 : deckScale,
    },
    addDeckIcon:{
      left:addDeckIconLeft,
      top:addDeckIconTop,
      width:nonSelectedDeckWidth,
      //height:45
      height:/*decks.length === 0 ?*/ nonSelectedDeckHeight// : nonSelectedDeckHeight/2
    }

  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const setSelectedDeck = useCallback((newSelectedDeckId) => {
      setSelectedDeckId(prevState => prevState ? "" : newSelectedDeckId);
  }, [stringifiedData]);

  //@todo - add a settings form with a useState toggle to show it when user clicks to create
  const createNewDeck = useCallback((settings={}) => {
    //do animation to show its being created
    createDeck(settings)
  }, [decks]);
  /*
  const moveDeck = (origArrPos, newArrPos) => {
    setDecksState(prevState => {
      if(newArrPos < origArrPos){
        //moving it back
        return prevState.map(d => {
          if(d.pos === origArrPos) { return { ...d, pos:newArrPos } }
          //decks before the new pos arent changed
          if(d.pos < newArrPos) { return d; }
          //decks after the old pos arent changed
          if(d.pos > origArrPos) { return d; }
          //decks between will increase by 1
          return { ...d, pos:d.pos + 1 }
        })
      }
      //moving it forward
      return prevState.map(d => {
        if(d.pos === origArrPos) { return { ...d, pos:newArrPos } }
        //decks before the orig pos arent changed
        if(d.pos < origArrPos) { return d; }
        //decks after the new pos arent changed
        if(d.pos > newArrPos) { return d; }
        //decks between will reduce by 1
        return { ...d, pos:d.pos - 1 }
      })
    })
  } 
  */

  useEffect(() => {
    //setShowInstructions(???);
  }, [selectedDeckId])

  useEffect(() => {
    setSelectedDeck(customSelectedDeckId);
  }, [customSelectedDeckId])

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

  //next: Deck still displaying even when showInstructions is true

  return (
    <div className={`cards-root ${classes.root}`} 
      onClick={() => { setSelectedDeckId("") }}>
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
      <div ref={containerRef} className={classes.decks} >
        {decksData.map(deckData => {
          const { colNr, rowNr } = deckData;
          return <div 
              key={`deckContainer-${deckData.id}`}
              className={classes.deckContainer}
              style={{
                //left and top not affect by scale coz origin is top-left
                left:margin.left + colNr * deckWidth, //so we use deckWidth which is dynamic
                top:margin.top + rowNr * (deckHeight + deckMarginBottom), //and deckHeight
              }}
            >
              {deckData.id.includes("temp") ? 
                <div className={classes.newDeckPlaceholder}>Saving Deck...</div>
                :
                <Deck data={deckData} user={user} 
                  width={selectedDeckWidth} 
                  height={selectedDeckHeight}
                  scale={deckScale}
                  update={updateDeck}
                  selectedDeckId={selectedDeckId}
                  onClick={(e) => {
                    setSelectedDeck(deckData.id);
                    e.stopPropagation();
                  }} 
                />
              }
          </div>
        })}

        {user && !selectedDeckId && 
          <div className={classes.addDeckIconContainer}>
            {decks.length === 0 && 
              <div className={classes.addDeckText} onClick={() => createNewDeck()}>
                Add a deck
              </div>
            }
            <IconComponent text="New" onClick={() => createNewDeck()} />
          </div>
        }
      </div>
      {/**form && <div className={classes.formOverlay} onClick={handleSaveForm}></div>*/}
      {/**<div className={classes.formContainer}>
          {form?.formType === "item" && 
            <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
          }
      </div>*/}
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