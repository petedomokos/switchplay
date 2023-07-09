import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
//import {  } from './constants';
import cardsLayout from './cardsLayout';
import cardsVisComponent from "./cardsVisComponent";
import { sortAscending } from '../../util/ArrayHelpers';
//import { createId } from './helpers';
 import { mockCards } from './mockCards';
import { grey10 } from './constants';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    width:props => props.screen.width,
    height:props => props.screen.height,
    display:"flex",
    flexDirection:"column",
    border:"solid",
    background:grey10(9)
  },
  svg:{
  }
}))

const Cards = ({ user, data, datasets, asyncProcesses, screen }) => {
  const { } = data;
  console.log("Cards user", user)
  console.log("screen", screen)

  const [layout, setLayout] = useState(() => cardsLayout());
  const [cards, setCards] = useState(() => cardsVisComponent());

  let styleProps = {
    screen
  };
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);

  const stringifiedData = JSON.stringify(data);

  useEffect(() => {
    //console.log("uE layout-------------")
    if(asyncProcesses.creating.datapoints){ 
      //saving datapoint so dont update
      return; 
    }

    //profiles go before contracts of same date
    const orderedData = sortAscending(data.cards, d => d.date);

    d3.select(containerRef.current).datum(layout(orderedData))

  }, [stringifiedData])

  useEffect(() => {
    cards
      .width(screen.width || 300)
      .height(screen.height || 600)

  }, [stringifiedData, screen])

  useEffect(() => {
    d3.select(containerRef.current).call(cards);
  }, [stringifiedData, screen])

  return (
    <div className={`cards-root ${classes.root}`}>
      <svg className={classes.svg} ref={containerRef} id={`cards-svg`}>
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

Cards.defaultProps = {
  data: {
    cards:mockCards
  },
  asyncProcesses:{},
  datasets: [], 
  screen: {}
}

export default Cards;