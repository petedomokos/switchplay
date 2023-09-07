import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import ItemForm from "./forms/ItemForm";
import Deck from "./Deck";
import { sortAscending } from '../../util/ArrayHelpers';
import { initStack } from '../../data/cards';
//import { createId } from './helpers';

import { grey10 } from './constants';
import { HeightRounded } from '@material-ui/icons';

const instructions = [
  { keyPhrase:"Swipe up", rest:" to pick up a card" },
  { keyPhrase:"Swipe down", rest:" to put down a card" },
  { keyPhrase:"Tap a section", rest:" to view or edit" },
  { keyPhrase:"Longpress a section", rest:" to change status" }
]

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:props => props.width,
    height:props => props.height,
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
    fontSize:"12px",
    color:grey10(2)

  },
  showInstructions:{

  },
  decks:{
    display:props => props.decks.display,
    width:props => `${props.width}px`,
    //height:props => `${props.height}px`,
    flexWrap:"wrap",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    border:"solid",
    borderWidth:"thin", 
    borderColor:"yellow"
  },
  nonSelectedDeckContainer:{
    width:props => `${props.nonSelectedDeckContainer.width}px`,
    height:props => `${props.nonSelectedDeckContainer.height}px`,
  },
  selectedDeckContainer:{
    width:props => `${props.selectedDeckContainer.width}px`,
    height:props => `${props.selectedDeckContainer.height}px`,
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

const CardsTable = ({ user, customActiveDeck, data, datasets, asyncProcesses, screen, save }) => {
  const width = screen.width || 300;
  const height = screen.height * 0.98 || 600;
  //we dont user defaultProps as we want to pass through userId too
  const mockDecks = [1,2,3,4,5].map(nr => 
    ({ ...initStack(user?._id), id:nr === 1 ? "temp" : `temp${nr}` }))
  
  const decksData = mockDecks;
  //const decksData = data && data.length !== 0 ? data : [initStack(user?._id)];
  const activeDeck = decksData.find(s => s.id === customActiveDeck) || decksData[0];
  const notSavedYet = !data?.find(s => s.id === activeDeck.id);

  const [selectedDeck, setSelectedDeck] = useState("");
  const [showInstructions, setShowInstructions] = useState(activeDeck.id === "temp");
  const [form, setForm] = useState(null);

  const nonSelectedDeckWidth = d3.min([width/3, 200]);
  const nonSelectedDeckHeight = nonSelectedDeckWidth * 1.5;
  const selectedDeckWidth = width * 0.98;
  const selectedDeckHeight = height * 0.9;

  let styleProps = {
    width,
    height,
    form:{ 
      display: form ? null : "none",
    },
    decks:{
      display:showInstructions ? "none" : "flex",
    },
    nonSelectedDeckContainer:{
      width:nonSelectedDeckWidth,
      height:nonSelectedDeckHeight
    },
    selectedDeckContainer:{
      width:selectedDeckWidth,
      height:selectedDeckHeight
    }
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const instructionsRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  useEffect(() => {
    setShowInstructions(activeDeck.id === "temp");
  }, [activeDeck._id])

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

  //next: Deck still displaying even when showInstrucitons is true

  return (
    <div className={`cards-root ${classes.root}`} 
      onClick={() => { setSelectedDeck("") }}>
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
        {decksData.map(deckData =>
          <div 
            key={`deckContainer-${deckData.id}`}
            className={selectedDeck ? classes.selectedDeckContainer : classes.nonSelectedDeckContainer}
            style={{display:!selectedDeck || selectedDeck === deckData.id ? null : "none" }}
          >
            <Deck data={activeDeck} user={user} 
              width={selectedDeck ? selectedDeckWidth : nonSelectedDeckWidth} 
              height={selectedDeck ? selectedDeckHeight : nonSelectedDeckHeight}
              onClick={(e) => { 
                setSelectedDeck(deckData.id);
                e.stopPropagation();
              }} />
          </div>
        )}
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
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default CardsTable;