import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//import {  } from './constants';
import DeckHeader from './DeckHeader';
import deckLayout from './deckLayout';
import decksComponent from "./decksComponent";
import ItemForm from "./forms/ItemForm";
import { sortAscending } from '../../util/ArrayHelpers';
import { initDeck } from '../../data/cards';
//import { createId } from './helpers';
import { TRANSITIONS } from "./constants"
import { grey10, COLOURS } from './constants';
import { trophy } from "../../../assets/icons/milestoneIcons.js"
const { GOLD } = COLOURS;



const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    transition: `all ${TRANSITIONS.MED}ms`,
    display:"flex",
    flexDirection:"column",
    /*border:"solid",
    borderWidth:"thin",
    borderColor:grey10(7)*/
  },
  overlay:{
    width:props => props.width,
    height:props => props.height,
    position:"absolute",
    display:props => props.overlayDisplay,
    transition: `all ${TRANSITIONS.MED}ms`
  },
  keyPhrase:{
    color:grey10(1)
  },
  svg:{
    pointerEvents:props => props.svg.pointerEvents,
    position:"absolute",
  },
  formContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:props => `${props.width}px`,
    height:props => `${props.height}px`,
    display:props => props.form.display,
  }
}))

const Decks = ({ user, data, selectedDeckId, scale, datasets, asyncProcesses, width, height, onClick, update }) => {
  console.log("Decks", data)
  const [layout, setLayout] = useState(() => deckLayout());
  const [decks, setDecks] = useState(() => decksComponent());
  const [form, setForm] = useState(null);

  const deckAspectRatio = width / height;
  const deckWrapperWidth = d3.min([width/3, 200]);
  const deckWrapperHeight = deckWrapperWidth / deckAspectRatio;

  const deckHeaderWidth = deckWrapperWidth;
  const deckHeaderHeight = 30;// d3.min([45, d3.max([11, height * 0.15])]);

  const deckWidth = deckWrapperWidth;
  const deckHeight = deckWrapperHeight - deckHeaderHeight;

  const deckMarginBottom = 0;

  const deckX = (d,i) => d.colNr * deckWidth;
  const deckY = (d,i) => d.rowNr * (deckWrapperHeight + deckMarginBottom);

  let styleProps = {
    width,
    height,
    svg:{
      pointerEvents:selectedDeckId ? "all" : "none",
    },
    form:{ 
      display: form ? null : "none",
    },
    overlayDisplay:selectedDeckId ? "none" : null
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const stringifiedData = JSON.stringify(data);


  useEffect(() => {
    const processedDeckData = data//.map(deckData => layout(deckData));
    //just use first deck for now
    d3.select(containerRef.current).datum(processedDeckData)

  }, [stringifiedData])

  useEffect(() => {
    decks
      .width(width)
      .height(height)
      .selectedDeckId(selectedDeckId)
      .x(deckX)
      .y((d,i) => deckY(d,i) + deckHeaderHeight)
      .deckWidth((d,i) => deckWidth)
      .deckHeight((d,i) => deckHeight)
      //.updateItemStatus(updateItemStatus)
      //.updateFrontCardNr(updateFrontCardNr)
      //.setForm(setForm)
  }, [stringifiedData, width, height, selectedDeckId])

  useEffect(() => {
    //why when we comment out this line, only the 1st deck opens!?
    d3.select(containerRef.current).call(decks);
  }, [stringifiedData, width, height, selectedDeckId])

  return (
    <div className={`cards-root ${classes.root}`} >
      {data.map((deckData,i) =>
        <div style={{ position:"absolute", left:deckX(deckData), top:deckY(deckData) }}>
          <DeckHeader width={deckWrapperWidth} height={deckHeaderHeight} />
        </div>
      )}
      <svg className={classes.svg} ref={containerRef} id={`cards-svg`} width={width} height={height} >
        {/**<defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>*/}
      </svg>
      <div className={classes.overlay} onClick={onClick}></div>
    </div>
  )
}

Decks.defaultProps = {
  asyncProcesses:{},
  datasets: [], 
  width:300,
  height:600,
  scale:1
}

export default Decks;