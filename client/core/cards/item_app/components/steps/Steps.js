import React, { useRef } from 'react';
import Draggable from 'react-draggable';
import DraggableCore from 'react-draggable';
import * as d3 from 'd3';

import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/steps.css';

function Steps({ /*steps,*/ logo }) {
  console.log("Steps...")
  const draggedNodeRef = useRef({ y:0 })
  const title = 'Steps';
  const placeholder = 'Add step';
  const steps = [
    { id:"1", title:"step 1 jkhd dshj dhj fhofs hf fhj fjjljjklfj jf jf jf jf fkjh fjhf f ", status:"complete" },
    { id:"1", title:"step 2", status:"In Progress" },
    { id:"1", title:"step 3", status:"Todo" }
  ]

  const titleHeight = 80;
  const stepHeight = 60;
  const stepMarginVert = 0;
  const stepStyle = {
    position:"absolute",
    width:"100%",
    height:`${stepHeight}px`, margin:`${stepMarginVert}px`,
    display:"flex", alignItems:"center", backgroundColor:"transparent",
  }

  const getStepStyle = i => ({
    ...stepStyle,
    top:`${titleHeight + stepMarginVert + (i * stepHeight + stepMarginVert)}px`,
    left:0
  })

  const onDragStart = (e,d) => {
    const { node, x, y, deltaX, deltaY, lastX, lastY } = d;
    //console.log("dragstart e", e)
    console.log("dragstart d", d)
    console.log("e", e)
    //console.log("op", d3.select(node).style("opacity"))
    const selection = d3.select(node);
    console.log("initTras", selection.style("transform"))
    const all = d3.select(node.parentNode).selectAll("*");

    selection
      .style("z-index", 1000)
        .transition("bg")
        .duration(200)
          .style("background-color", "grey")

  }
  const onDrag = (e,d) => {
    const { node, x, y, deltaX, deltaY, lastX, lastY } = d;
    //console.log("drag e", e)
    //console.log("drag d", d.deltaY, d.lastY)
    //console.log("draggedNode", draggedNodeRef.current)
  }
  const onDragEnd = (e,d) => {
    const { node, x, y, deltaX, deltaY, lastX, lastY } = d;
    //console.log("dragend e", e)
    console.log("dragend d", d)
    const selection = d3.select(node);
    console.log("endTras", selection.style("transform"))
    selection
        .transition("bg-out")
        .duration(1000)
          //.style("transform", "translate(0px, 0px)")
          .on("end", function(){
            d3.select(this)
              .transition("bg-out")
              .duration(500)
                .style("background-color", "transparent")
                .on("end", function(){
                  d3.select(this)
                    .style("z-index", 0);
                })
          })
          
  }
  return (
    <div className='steps-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content' style={{ height: 3 * (stepHeight + 2 * stepMarginVert)}}>
          {/**steps.map((step,i) => 
            <DraggableCore onStart={onDragStart} onDrag={onDrag} onStop={onDragEnd}
              axis="y">
              <div className={`handle step-wrapper-${i}`} style={getStepStyle(i)}>
                <StepsItemTemplate key={step.id} value={step.title} status={step.status} logo={logo} />
              </div>
            </DraggableCore>
          )*/}
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
{steps.map((step,i) => 
            <DraggableCore onStart={onDragStart} onDrag={onDrag} onStop={onDragEnd}
              axis="y">
              <div className={`handle step-wrapper-${i}`} style={getStepStyle(i)}>
                <StepsItemTemplate key={step.id} value={step.title} status={step.status} logo={logo} />
              </div>
            </DraggableCore>
          )}
*/
