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
    width:props => `${props.width}px`,
    transition: `all ${TRANSITIONS.MED}ms`,
    //height:props => `${props.height}px`,
    flexWrap:"wrap",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    //border:"solid",
    //borderWidth:"thin", 
    //borderColor:"yellow"
  },
  deckContainer:{
    position:"absolute",
    width:props => `${props.deckContainer.width}px`,
    height:props => `${props.deckContainer.height}px`,
    transition: `all ${TRANSITIONS.MED}ms`,
  },
  addDeckIconContainer:{
    position:"absolute",
    left:props => props.addDeckIcon.left,
    top:props => props.addDeckIcon.top,
    width:props => `${props.deckContainer.width}px`,
    height:props => `${props.deckContainer.height}px`,
    transition: `all ${TRANSITIONS.MED}ms`,
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    color:grey10(4)
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
const createMockDecks = (userId, nrDecks=1) => d3.range(nrDecks).map((nr,i) =>  
  ({ 
      ...initDeck(userId), 
      id:`temp-${nr}`,
  })
)

const calcColNr = pos => pos % 3;
const calcRowNr = pos => Math.floor(pos/3);

const embellishedDecks = decks => decks
  .map((d,i) => ({ ...d, pos:typeof d.pos === "number" ? d.pos : i })) //pos may or may nt be persisted
  .map(d => ({
  ...d, 
  colNr:calcColNr(d.pos),
  rowNr:calcRowNr(d.pos),
}))

const CardsTable = ({ user, customSelectedDeckId, datasets, asyncProcesses, screen, save, createDeck }) => {
  const { decks=[] } = user;
  const width = screen.width || 300;
  const height = screen.height * 0.98 || 600;
  //console.log("CardsTable", decks)

  const decksData = embellishedDecks(decks);
  //console.log("decksData", decksData)
  const stringifiedData = JSON.stringify(decksData);

  const [selectedDeckId, setSelectedDeckId] = useState(customSelectedDeckId);
  const [showInstructions, setShowInstructions] = useState(false);
  const [form, setForm] = useState(null);

  const selectedDeck = decksData.find(d => d.id === selectedDeckId);

  const nonSelectedDeckWidth = /*selectedDeck ? 0 :*/ d3.min([width/3, 200]);
  const nonSelectedDeckHeight = /*selectedDeck ? 0 :*/ nonSelectedDeckWidth * 1.5;
  const selectedDeckWidth = width * 0.98;
  const selectedDeckHeight = height * 0.9;
  const deckWidth = selectedDeck ? selectedDeckWidth : nonSelectedDeckWidth;
  const deckHeight = selectedDeck ? selectedDeckHeight : nonSelectedDeckHeight;
  //pos of new icon - in next avail slot
  const addDeckIconLeft = calcColNr(decksData.length) * nonSelectedDeckWidth;
  const addDeckIconTop = calcRowNr(decksData.length) * nonSelectedDeckHeight;

  let styleProps = {
    left:selectedDeck ? -selectedDeckWidth * selectedDeck.colNr : 0,
    top:selectedDeck ? -selectedDeckHeight * selectedDeck.rowNr : 0,
    width:width * 10, //selectedDeck ? width * 3 : width,
    height: height * 10,
    form:{ 
      display: form ? null : "none",
    },
    decks:{
      display:showInstructions ? "none" : "flex",
    },
    deckContainer:{
      width:deckWidth,
      height:deckHeight
    },
    addDeckIcon:{
      left:addDeckIconLeft,
      top:addDeckIconTop
    }

  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const updateDeck = useCallback(updatedDeck => {
    // console.log("updateDeck", updatedDeck)
    const updatedDecks = decks.map(d => d.id === updatedDeck.id ? updatedDeck : d)
    save(updatedDecks, false); //dont persist yet
  }, [stringifiedData]);


  //@todo - add a settings form with a useState toggle to show it when user clicks to create
  const createNewDeck = useCallback((settings={}) => {
    //do animation to show its being created
    const pos = decks.length;
    createDeck({ ...settings, pos })
  }, [decks]);

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

  useEffect(() => {
    //setShowInstructions(???);
  }, [selectedDeckId])

  useEffect(() => {
    setSelectedDeckId(customSelectedDeckId);
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
                left:colNr * deckWidth,
                top: rowNr * deckHeight, 
              }}
            >
              {deckData.id.includes("temp") ? 
                <div className={classes.newDeckPlaceholder}>Saving Deck...</div>
                :
                <Deck data={deckData} user={user} 
                  width={deckWidth} 
                  height={deckHeight}
                  update={updateDeck}
                  onClick={(e) => {

                    setSelectedDeckId(prevState => prevState ? "" : deckData.id);
                    e.stopPropagation();
                  }} 
                />
              }
          </div>
        })}
        {user && !selectedDeckId && 
          <div className={classes.addDeckIconContainer}>
            <IconComponent 
              text="New" onClick={() => createNewDeck()} />
          </div>
        }
      </div>
      {/**form && <div className={classes.formOverlay} onClick={handleSaveForm}></div>*/}
      <div className={classes.formContainer}>
          {form?.formType === "item" && 
            <ItemForm item={form.value} fontSize={form.height * 0.5} save={updateItemTitle} close={() => setForm(null)} />
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