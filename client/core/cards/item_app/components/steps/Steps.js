import React, { useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/steps.css';


const initSteps = [
  { pos:0, id:"step-a", title:"step 1", status:"complete" },
  { pos: 1, id:"step-b", title:"step 2", status:"In Progress" },
  { pos: 2, id:"step-c", title:"step 3", status:"Todo" }
]

/*
todo - 
 - put RESET code into a reset function
 - remove unused variables eg ref stuff
 - deploy and test on mobile with touchstart and touchend
 - pass in steps as props, and make update happen in db for order of steps
  - add and delete steps similarly
  - add a transition to the initial styles so when added or delete, the rest slide into place
  
  */


function Steps({ /*steps,*/ logo }) {

  const dragRef = useRef({})
  const longpressRef = useRef({ mouseMoves: 0 })
  const [steps, setSteps] = useState(initSteps);
  //console.log("Steps...", steps)
  //console.log("longpressRef", longpressRef.current)
  const title = 'Steps';
  const placeholder = 'Add step';
  const titleHeight = 80;
  const stepHeight = 60;
  const stepMarginVert = 0;
  const stepStyle = {
    position:"absolute",
    width:"100%",
    height:`${stepHeight}px`, margin:`${stepMarginVert}px`,
  }

  const calcTop = pos => titleHeight + stepMarginVert + (pos * stepHeight + stepMarginVert); 
  const getStepStyle = pos => ({
    ...stepStyle,
    top:`${calcTop(pos)}px`,
    left:0,
    backgroundColor:"transparent",
  })

  const getStepOverlayStyle = pos => ({
    ...stepStyle,
    top:`${calcTop(pos)}px`,
    left:0,
    //backgroundColor:"pink",
    opacity:0.5
  })

  const onClickStepOverlay = () => {
    d3.selectAll(".step-overlay")
      //.style("background-color", "pink")
      .style("z-index", 1)
    
    d3.selectAll(".step-wrapper")
      .style("background-color","transparent")
  }

  const onClick = () => {
    d3.selectAll(".step-overlay")
      //.style("background-color", "pink")
      .style("z-index", 1)
    
    d3.selectAll(".step-wrapper")
      .style("background-color","transparent")

  }

  const onMouseDown = (e, step) => {
    //console.log("md")
    d3.selectAll(".step-overlay")
      //.style("background-color", "pink")
      .style("z-index", 1);
    
    d3.selectAll(".step-wrapper")
      .style("background-color","transparent")

    const overlaySelection = d3.select(e.target);
    const stepSelection = d3.select(`.step-wrapper-${step.id}`)
    longpressRef.current.timer = setTimeout(() => { 
      longpressRef.current.isLongpress = true;
      overlaySelection
        //.style("background-color","transparent")
        .style("z-index", -1);

      stepSelection.style("background-color", "grey");

    }, 500);
  }
  const onMouseUp = e => {
    //console.log("mu")
    d3.select(e.target)
    clearTimeout(longpressRef.current.timer)
    if(longpressRef.current.isLongpress){
      longpressRef.current.isLongpress = false;
      longpressRef.current.mouseMoves = 0;
    }
  }
  const onMouseMove = () => {
    //console.log("mousemove")
    if(longpressRef.current.timer){
      longpressRef.current.mouseMoves += 1;
    }
  }

  const onDragStart = (e, step) => {
    //console.log("ds")
    const selection = d3.select(e.target);
    dragRef.current.draggedSelection = selection;
    dragRef.current.draggedOrigIndex = step.pos;

    selection.style("background-color", "grey").style("z-index", 0)
    selection.transition().duration(0.01).style("opacity", 0)

  }
  const onDrag = (e, step) => {
    //console.log("dg")
  }
  const onDragEnd = (e, step) => {
    //console.log("de")
    //console.log("RESET")
    d3.selectAll(".step-overlay")
      //.style("background-color", "pink")
      .style("z-index", 1)
    
    d3.selectAll(".step-wrapper")
      .style("background-color","transparent")

    const selection = d3.select(e.target);
    selection.style("opacity", 1)

    dragRef.current.draggedSelection = null;
    longpressRef.current.isLongpress = false;
    longpressRef.current.wasLongpress = true;
    longpressRef.current.mouseMoves = 0;
    longpressRef.current.timer = null;

  }
  const onDragEnter = (e, step, nodeIsOverlay) => {
    //console.log("enterstep", step.pos)
    const selection = d3.select(`.step-wrapper-${step.id}`)
    if(selection.attr("class").includes("steps-item-template")){ return; }
    d3.selectAll(".step-wrapper").style("background-color", "transparent")
    selection.style("background-color", "#F5F5F5")

    e.stopPropagation();
    e.preventDefault();
  }

  //these are needed so it works
  const onDragOver = (e, step, nodeIsOverlay) => {
    e.stopPropagation();
    e.preventDefault();
  }
  const onDragLeave = (e, step, nodeIsOverlay) => {
    e.stopPropagation();
    e.preventDefault();
  }

  const onDrop = (e, step) => {
    //console.log("drop")
    const draggedNewIndex = step.pos;

    e.stopPropagation();
    e.preventDefault();

    const selection = d3.select(`.step-wrapper-${step.id}`)
    selection.style("background-color", "transparent");
    dragRef.current.draggedSelection
      .style("z-index", 1)
      .style("top", `${calcTop(draggedNewIndex)}px`)

    const all = d3.selectAll(".step-wrapper")
    //if new pos is numerically above old pos (ie lower down the list physically), 
    //then move all that are before new pos numerically down 1 (ie physically up 1)
    //and...
    //if newpos is numerically below old pos (ie higher up the list physically),
    //then move all that are after new pos numerically up one (ie physically down 1)

    const { draggedOrigIndex } = dragRef.current;
    const draggedIndexIncreased = draggedNewIndex > draggedOrigIndex;
    const nodeMustShift = pos => 
      (draggedIndexIncreased && pos <= draggedNewIndex && pos > draggedOrigIndex) || 
      (!draggedIndexIncreased && pos >= draggedNewIndex && pos < draggedOrigIndex);

    const numericalShiftDirection = draggedIndexIncreased ? "down" : "up";

    const calcNewPos = prevPos => {
      if(prevPos === draggedOrigIndex){ return draggedNewIndex; }
      if(!nodeMustShift(prevPos)){ return prevPos; }
      return numericalShiftDirection === "up" ? prevPos + 1 : prevPos - 1;
    }

    all
      .style("background-color", "transparent")
      .transition()
      .duration(500)
        .style("top", function(){
          const d = JSON.parse(d3.select(this).attr("datum"))
          const newPos = calcNewPos(d.pos);
          return `${calcTop(newPos)}px`
        })
        .on("end", function(_d, j, data){
          //set state when last transition ends
          if(j === data.length - 1){
            setSteps(prevState => prevState.map(step => ({ ...step, pos: calcNewPos(step.pos) })))
          }
        })

    //console.log("RESET")
    d3.selectAll(".step-overlay")
        //.style("background-color", "pink")
        .style("z-index", 1);

    d3.selectAll(".step-wrapper")
      .style("background-color","transparent");
  }

  return (
    <div className='steps-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content' style={{ height: 3 * (stepHeight + 2 * stepMarginVert)}}>
          {steps.map(step => 
            <div
              datum={JSON.stringify(step)}
              className={`handle step-wrapper step-wrapper-${step.id}`} 
              style={getStepStyle(step.pos)}
              key={`step-${step.id}`}
              onClick={onClick}
              draggable={true}
              onDragStart={e => onDragStart(e, step)} 
              onDrag={e => onDrag(e, step)} 
              onDragEnd={e => onDragEnd(e, step)}
              onDragEnter={e => onDragEnter(e, step)} 
              onDragOver={e => onDragOver(e, step)} 
              onDragLeave={e => onDragLeave(e, step)}
              onDrop={e => onDrop(e, step)}
            >
                <StepsItemTemplate key={step.id} value={step.title} status={step.status} logo={logo} />
            </div>
          )}
          {steps.map(step => 
            <div
              key={`step-overlay step-overlay-${step.id}`}
              datum={JSON.stringify(step)}
              className={`step-overlay step-overlay-${step.id}`}
              style={getStepOverlayStyle(step.pos)}
              onClick={onClickStepOverlay}
              onMouseDown={e => onMouseDown(e, step)}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}
              onTouchStart={e => onMouseDown(e, step)}
              onTouchEnd={onMouseUp}
              onDragEnter={e => onDragEnter(e, step, true)} 
              onDragOver={e => onDragOver(e, step, true)} 
              onDragLeave={e => onDragLeave(e, step, true)}
              onDrop={e => onDrop(e, step, true)}
            >
            </div>
          )}
        </div>
      </div>
      <AddNewTemplate placeholder={placeholder} />
    </div>
  );
}

Steps.defaultProps = {
  steps:[]
}

export default Steps;

/*
<Draggable 
              key={`step-${step.id}`}
              onStart={(e, info) => onDragStart(e, info, step, i)} 
              onDrag={(e, info) => onDrag(e, info, step, i)} 
              onStop={(e, info) => onDragEnd(e, info, step, i)}
              axis="y" position={dragPosition[step.id] || { x:0, y: 0}}>
              <div className={`handle step-wrapper-${step.id}`} style={getStepStyle(i)}>
                <StepsItemTemplate key={step.id} value={step.title} status={step.status} logo={logo} />
              </div>
            </Draggable>
*/
