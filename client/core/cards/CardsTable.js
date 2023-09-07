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

const instructions = [
  { keyPhrase:"Swipe up", rest:" to pick up a card" },
  { keyPhrase:"Swipe down", rest:" to put down a card" },
  { keyPhrase:"Tap a section", rest:" to view or edit" },
  { keyPhrase:"Longpress a section", rest:" to change status" }
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
    fontSize:"12px",
    color:grey10(2)

  },
  showInstructions:{

  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.form.width}px`,
    height:props => `${props.form.height}px`,
    display:props => props.form.display
  }

}))

const CardsTable = ({ user, customActiveDeck, data, datasets, asyncProcesses, screen, save }) => {
  //we dont user defaultProps as we want to pass through userId too
  const decksData = data && data.length !== 0 ? data : [initStack(user?._id)];
  const activeDeck = decksData.find(s => s.id === customActiveDeck) || decksData[0];
  const notSavedYet = !data?.find(s => s.id === activeDeck.id);

  const [showInstructions, setShowInstructions] = useState(activeDeck.id === "temp");
  const [form, setForm] = useState(null);
  //console.log("Form", form)

  let styleProps = {
    screen,
    form:{ 
      display: form ? null : "none",
      width:screen.width || 300,
      height:screen.height || 600 
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
    <div className={`cards-root ${classes.root}`}>
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
      <div ref={containerRef} style={{display:showInstructions ? "none" : null}}>
        <Deck data={activeDeck} screen={screen} user={user} />
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