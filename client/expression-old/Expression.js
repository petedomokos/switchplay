import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import expressionBuilderGenerator from "./expressionBuilderGenerator";
import { getInstances, planetsData } from './data';
import { INIT_CHAIN_STATE, COLOURS, DIMNS } from "./constants";
import { elementsBefore, elementsAfter } from "./helpers";

const useStyles = makeStyles((theme) => ({
  root: {
      margin:"10px"
  },
  contextMenu:{
      margin:"10px"
  },
  contextBtn:{
      margin:"5px",
  },
  svg:{
      background:COLOURS.svg.bg,
      //width:"840px",
      //height:"420px",
      //margin:"20px" 
  }
}));

const Expression = ({}) => {
  console.log("Exp")
  //starts with 1 expression
  const initState = [INIT_CHAIN_STATE]
  const styleProps = { };
  const classes = useStyles();
  const availableContexts = ["Planet", "Landscape"]
  //change context
  const [context, setContext] = useState(availableContexts[0])
  //should be ref as not changing
  const [expBuilder, setExpBuilder] = useState(undefined)
  const [expBuilderState, setExpBuilderState] = useState(initState)
  //activeBlock described by Pair[chainNr, blockNr]
  const [activeBlock, setActiveBlock] = useState([0,0])
  //console.log("activeBlock", activeBlock)
  //console.log("ExpBuilder state", expBuilderState)

  const containerRef = useRef(null);

  //dimns
  const { width } = DIMNS.svg;
  const expBuilderMargin = DIMNS.expBuilder.margin;
  const chainWrapperMargin = DIMNS.chainWrapper.margin;
  //content is 1 exp per chain, plus 1 calc box for the active chain
  const expAndButtonsHeight = DIMNS.exp.height + DIMNS.chainButtons.height;
  const nrOfChains = expBuilderState.length;
  //there will only be 1 calc box open
  const expBuilderContentHeight = nrOfChains * (chainWrapperMargin.top + expAndButtonsHeight + chainWrapperMargin.bottom) + DIMNS.editor.height
  //make sure svg height is at least big enough for planets, and big enough for number of chains required
  const height = d3.max([DIMNS.svg.minHeight, expBuilderContentHeight + expBuilderMargin.top + expBuilderMargin.bottom]); 
  const onContextUpdate = (context) =>{
    setExpBuilderState(initState)
    setContext(context)
  }
  //init
  useEffect(() => {
    if(!containerRef.current){return; }
    setExpBuilder(() => expressionBuilderGenerator())
  }, [])

  //update data
  useEffect(() => {
     //console.log("2nd uE")
      if(!containerRef.current || !expBuilder){return; }
      //console.log("2nd useEff runniung")
      const amendedExpBuilderState = expBuilderState
          .map((chainState, i) => chainState
              .map((block, j) => ({
                      ...block,
                      prev: j !== 0 ? chainState[j - 1] : undefined,
                      isActive:activeBlock[0] === i && activeBlock[1] === j,
                      chainNr:i,
                      blockNr:j,
              }))
          )

      expBuilder
        .context(context)
        .width(width)
        .height(height)
        .planetsData(planetsData.map(p => ({ ...p, instances:getInstances(p.id) })))
        .updateBlock(((updatedBlock, requireNewBlock) => {
            const { chainNr, blockNr } = updatedBlock;
            setExpBuilderState(prevState => {
              const chainToUpdate = prevState[chainNr];
              //replace block in chain
              const _updatedChain = [...elementsBefore(blockNr, chainToUpdate), updatedBlock, ...elementsAfter(blockNr, chainToUpdate)]
              const updatedChain = requireNewBlock ? [..._updatedChain, {}] : _updatedChain;
              //replace chain in state
              return [...elementsBefore(chainNr, prevState), updatedChain, ...elementsAfter(chainNr, prevState)]
            })
            //if(requireNewBlock){
              setActiveBlock([chainNr, blockNr + 1])
            //}
        }))
        .setActiveBlock(setActiveBlock)
        .addChain(i => {
            setExpBuilderState(prevState => ([...elementsBefore(i+1, prevState), INIT_CHAIN_STATE, ...elementsAfter(i, prevState)]))
            setActiveChainIndex(i+1)
        })
        .copyChain(i =>{
            setExpBuilderState(prevState => ([...elementsBefore(i+1, prevState), prevState[i], ...elementsAfter(i, prevState)]))
            setActiveChainIndex(i+1)
        })
        .deleteChain(i => {
          if(expBuilderState.length !== 1){
              setExpBuilderState(prevState => ([...elementsBefore(i, prevState), ...elementsAfter(i, prevState)]))
              setActiveChainIndex((i === 0 ? i : i - 1))
          }else{
            //deleting the only chain so must add a new init chain
            setExpBuilderState(INIT_CHAIN_STATE);
          }
        });

      d3.select(containerRef.current).datum(amendedExpBuilderState).call(expBuilder)

  }, [expBuilderState, expBuilder, activeBlock, context])

  return (
    <div className={classes.root} >
      <div className={classes.contextMenu} >
        {availableContexts.map(option => 
          <Button 
              value="Landscape" 
              color={context === option ? "primary" : "inherit"} 
              variant="contained" 
              className={classes.contextBtn} 
              onClick={() => onContextUpdate(option)} key={option}>{option}
          </Button>
        )}
      </div>
        <svg 
          className={classes.svg} 
          width={width} 
          height={height} 
          id="exp1" ref={containerRef}></svg>
    </div>
  )
}

Expression.defaultProps = {
}

export default Expression
