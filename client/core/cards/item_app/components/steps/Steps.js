import React, { useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';

import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/steps.css';
import uuid from 'react-uuid';

const createEmptyStep = pos => ({ pos, id:uuid(), title:"", status:"todo" })

function getLeftAsNumber(step){
  const currentLeftString = d3.select(`.step-wrapper-${step.pos}`).style("left");
  return currentLeftString ? Number(currentLeftString.slice(0, currentLeftString.length - 2)) : 0;
}

function getTopAsNumber(step){
  const currentTopString = d3.select(`.step-wrapper-${step.pos}`).style("top");
  return currentTopString ? Number(currentTopString.slice(0, currentTopString.length - 2)) : 0;
}


function Steps({ steps, logo, updateSteps }) {
  const [stepBeingEdited, setStepBeingEdited] = useState("")
  const dragRef = useRef({})
  const touchRef = useRef({})
  const longpressRef = useRef({ mouseMoves: 0 })
  //console.log("Steps...", steps)
  const title = 'Steps';
  const placeholder = 'Add step';
  const titleHeight = 80;
  const stepHeight = 60;
  const stepMarginVert = 0;
  const stepStyle = {
    position:"absolute",
    width:"100%",
    height:`${stepHeight}px`, margin:`${stepMarginVert}px`,
    touchAction: "none"
  }

  const calcTop = pos => stepMarginVert + (pos * stepHeight + stepMarginVert); 
  const getStepStyle = step => ({
    ...stepStyle,
    top:`${calcTop(step.pos)}px`,
    left:0,
    backgroundColor:"transparent",
    padding:"0px",
    transform:"translate(0,0)",
    opacity:1,
    zIndex:null
  })

  const getStepOverlayStyle = step => ({
    ...stepStyle,
    width:"calc(100% - 55px)",
    left:"55px",
    top:`${calcTop(step.pos)}px`,
    opacity:0.5,
    padding:"0px",
    display:stepBeingEdited === step.id ? "none" : null,
    zIndex:1
  })

  const createStep = () => { updateSteps([ ...steps, createEmptyStep(steps.length) ]); }
  const updateStep = updatedStep => { updateSteps(steps.map(s => s.id !== updatedStep.id ? s : updatedStep)); }
  const deleteStep = step => { updateSteps(steps.filter(s => s.pos !== step.pos).map(s => s.pos < step.pos ? s : ({ ...s, pos: s.pos - 1 }))) }

  const cleanupDrag = () => {
    d3.selectAll(".step-overlay")
      .style("z-index", null)
    
    d3.selectAll(".step-wrapper")
      .style("z-index", null)
      .transition("cleanup")
      .duration(200)
        .style("background-color","transparent")
  }

  const onClickBg = e => {
    //console.log("clickbg", longpressRef.current.isLongpress)
    if(stepBeingEdited){ setStepBeingEdited(""); }
    //this will be an issue due to propagation, but no need for it now
    //cleanupDrag();
    e.stopPropagation();
    e.preventDefault();
  }

  const onClickStepOverlay = (e, step) => {
    //console.log("click step overlay")
    cleanupDrag();
    e.stopPropagation();
    e.preventDefault();
    setStepBeingEdited(step.id);
  }

  const onClick = e => {
    //console.log("click step")
    return;
    cleanupDrag();
    e.stopPropagation();
    e.preventDefault();
  }

  const onMouseDown = (e, step) => {
    //console.log("md")
    e.stopPropagation();
    //console.log("md")
    cleanupDrag();

    const overlaySelection = d3.select(e.target);
    const stepSelection = d3.select(`.step-wrapper-${step.id}`)
    longpressRef.current.timer = setTimeout(() => { 
      //console.log("set lp true")
      longpressRef.current.isLongpress = true;
      overlaySelection
        .style("z-index", -1);

      stepSelection.style("background-color", "grey");

    }, 500);
  }
  const onMouseUp = e => {
    e.stopPropagation();
    //console.log("mu")
    d3.select(e.target)
    clearTimeout(longpressRef.current.timer)
    if(longpressRef.current.isLongpress){
      longpressRef.current.isLongpress = false;
    }
  }
  const onMouseMove = () => {
    //e.stopPropagation();
  }

  const onDragStart = (e, step) => {
    e.stopPropagation();
    //console.log("ds", e.timeStamp)
    const selection = d3.select(e.target);
    dragRef.current.draggedSelection = selection;
    dragRef.current.draggedOrigIndex = step.pos;
    dragRef.current.startCoods = [e.clientX, e.clientY];
    dragRef.current.startTime = e.timeStamp;

    selection.style("background-color", "grey").style("z-index", 0)
    selection.transition().duration(0.01).style("opacity", 0)

  }

  const onDrag = (e, step) => {
    e.stopPropagation();
    const { startCoods } = dragRef.current;
    //console.log("dg")
    const totalDX = e.clientX - startCoods[0];
    const totalDY = e.clientY - startCoods[1];
    const totalTime = e.timeStamp - dragRef.current.startTime;
    const vx = totalDX / totalTime;
    if(Math.abs(totalDX) > 50 && Math.abs(totalDY) < 50 && Math.abs(vx) > 0.1){
      deleteStep(step);
    }
    
  }
  const onDragEnd = (e, step) => {
    e.stopPropagation();
    //console.log("de")
    cleanupDrag();

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
    //then move all that are before new pos numerically down 1 (ie physically up 1), and opposite
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
            updateSteps(steps.map(step => ({ ...step, pos: calcNewPos(step.pos) })))
          }
        })

    cleanupDrag();
  }

  const cleanupTouch = () => {
    touchRef.current = {};
    longpressRef.current.isLongpress = false;
    d3.selectAll(".step-wrapper").style("background-color", "transparent").style("z-index", null)
    d3.selectAll(".step-wrapper-overlay").style("z-index", null)
  }

  const onTouchStart = (e, step) => {
    //console.log("touchstart overlay")
    e.stopPropagation();
    e.preventDefault();
    d3.selectAll(".step-wrapper").style("background-color", "transparent")
    //cleanupDrag();
    //console.log("touch", e.timeStamp, touch)
    const overlaySelection = d3.select(e.target);
    const stepSelection = d3.select(`.step-wrapper-${step.id}`)
    const selection = d3.select(e.target);

    longpressRef.current.timer = setTimeout(() => { 
      longpressRef.current.isLongpress = true;
      overlaySelection.style("z-index", 1);
      stepSelection
        .style("z-index", 1)
        .style("background-color", "grey");
    }, 500);
  }
  const onTouchMove = (e, step) => {
    //console.log("touchmove overlay")
    e.stopPropagation();
    const touch = e.touches[0];

    if(longpressRef.current.isLongpress && !touchRef.current.startCoods){
      //console.log("set start pos for drag")
      touchRef.current.origPos = step.pos;
      touchRef.current.startCoods = [touch.clientX, touch.clientY];
      touchRef.current.startTime = e.timeStamp;
      touchRef.current.stepOrigLeft = getLeftAsNumber(step);
      touchRef.current.stepOrigTop = getTopAsNumber(step);
      touchRef.current.nrEvents = 1;
      return;
    }
    touchRef.current.nrEvents += 1;
    const { nrEvents, startCoods, stepOrigLeft, stepOrigTop, startTime, origPos, prevPos, prevPosWasValidChange } = touchRef.current;
    const overlaySelection = d3.select(touch.target);
    const stepSelection = d3.select(`.step-wrapper-${step.id}`);
    const totalDX = touch.clientX - startCoods[0];
    const totalDY = touch.clientY - startCoods[1];
    const totalTime = e.timeStamp - touchRef.current.startTime;
    //@todo - calc velocity from the last few events only, so user can press and hold for ages before deleting
    const vx = totalDX / totalTime;
    stepSelection
      .style("left", `${stepOrigLeft + totalDX}px`)
      .style("top", `${stepOrigTop + totalDY}px`);

    //console.log("ev dx dy vx",nrEvents, totalDX, totalDY, vx)
    if(Math.abs(totalDX) > 100 && Math.abs(totalDY) < 50 && Math.abs(vx) > 0.1){
      //console.log("DELETE------------------------", step)
      cleanupTouch();
      deleteStep(step);
      return;
    }

    const newPos = origPos + Math.round(totalDY / stepHeight);
    //console.log("newPos", newPos)
    //check if no change
    if(prevPos === newPos){ return; }
    //helper
    const newPosIsValidChange = newPos !== origPos && newPos !== prevPos && steps[newPos];
    //remove highlight from old (if it was a valid pos)
    if(prevPosWasValidChange){
      d3.select(`.step-wrapper-${prevPos}`).style("background-color", "transparent")
    }
    //add highlight to new (if it is a valid pos)
    if(newPosIsValidChange){
      d3.select(`.step-wrapper-${newPos}`).style("background-color", "#F5F5F5")
    }
    //update ref
    touchRef.current.prevPos = newPos;
    touchRef.current.prevPosWasValidChange = newPosIsValidChange;
  }

  const onTouchEnd = (e, step) => {
    //console.log("touchend overlay")
    e.preventDefault();
    e.stopPropagation();
    clearTimeout(longpressRef.current.timer)
    if(!longpressRef.current.isLongpress){
      setStepBeingEdited(step.id);
      return;
    }

    const { startCoods, stepOrigTop, startTime, origPos, prevPos, prevPosWasValidChange } = touchRef.current;
    if(prevPosWasValidChange){
      const draggedNewPos = prevPos;
      const draggedOrigPos = origPos;

      const posDelta = draggedNewPos - origPos;
      const draggedPosIncreased = draggedNewPos > origPos;
      const nodeMustShift = pos => 
        (draggedPosIncreased && pos <= draggedNewPos && pos > draggedOrigPos) || 
        (!draggedPosIncreased && pos >= draggedNewPos && pos < draggedOrigPos);
  
      const numericalShiftDirection = draggedPosIncreased ? "down" : "up";
  
      const calcNewPos = step => {
        if(step.pos === draggedOrigPos){ return draggedNewPos; }
        if(!nodeMustShift(step.pos)){ return step.pos; }
        return numericalShiftDirection === "up" ? step.pos + 1 : step.pos - 1;
      }

      const calcNewTopForStep = step => {
        const currentTop = getTopAsNumber(step)
        //the dragged step
        if(step.pos === draggedOrigPos){ 
          return stepOrigTop + (posDelta * stepHeight)
        }
        //other steps that don't have to move
        if(!nodeMustShift(step.pos)){ return currentTop; }
        //other steps that do need to move
        return numericalShiftDirection === "up" ? currentTop + stepHeight : currentTop - stepHeight;
      }

      d3.selectAll(".step-wrapper")
          .transition()
          .duration(500)
            .style("background-color", "transparent")
            .style("left", 0)
            .style("top", function(){
              const step = JSON.parse(d3.select(this).attr("datum"))
              return `${calcNewTopForStep(step)}px`
            })
            .on("end", function(_d, j, data){
              //set state when last transition ends
              if(j === data.length - 1){
                cleanupTouch();
                updateSteps(steps.map(step => ({ ...step, pos: calcNewPos(step) })))
              }
            })
    } else {
      //@todo - add transition onto the React render instead, but only want it on update, not init render
      d3.select(`.step-wrapper-${step.pos}`)
        .transition()
        .duration(200)
          .style("background-color", "transparent")
          .style("top", `${stepOrigTop}px`)
          .on("end", function(){
            cleanupTouch();
            updateSteps(steps);
          })
    }
  }

  return (
    <div className='steps-wrapper' onClick={onClickBg}>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div 
          className='section-child-content' 
          style={{ height: steps.length * (stepHeight + 2 * stepMarginVert) }}
          onClick={onClickBg}
        >
          {steps.map(step => 
            <div
              datum={JSON.stringify(step)}
              className={`handle step-wrapper step-wrapper-${step.id} step-wrapper-${step.pos}`} 
              style={getStepStyle(step)}
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
                <StepsItemTemplate 
                  key={step.id} step={step} logo={logo} 
                  beingEdited={stepBeingEdited === step.id} update={updateStep} 
                />
            </div>
          )}
          {steps.map(step => 
            <div
              key={`step-overlay step-overlay-${step.id} step-overlay-${step.pos}`}
              datum={JSON.stringify(step)}
              className={`step-overlay step-overlay-${step.id}`}
              style={getStepOverlayStyle(step)}
              onClick={e => onClickStepOverlay(e, step)}
              onMouseDown={e => onMouseDown(e, step)}
              onMouseUp={onMouseUp}
              onMouseMove={onMouseMove}

              onTouchStart={e => onTouchStart(e, step)}
              onTouchMove={e => onTouchMove(e, step)}
              onTouchEnd={e => onTouchEnd(e, step)}

              onDragEnter={e => onDragEnter(e, step, true)} 
              onDragOver={e => onDragOver(e, step, true)} 
              onDragLeave={e => onDragLeave(e, step, true)}
              onDrop={e => onDrop(e, step, true)}
            >
            </div>
          )}
        </div>
      </div>
      <AddNewTemplate placeholder={placeholder} onClick={createStep} />
    </div>
  );
}

Steps.defaultProps = {
  steps:[]
}

export default Steps;
