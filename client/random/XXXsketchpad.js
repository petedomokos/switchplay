import * as d3 from 'd3'

const svg = d3.select("#chart-area").append("svg")
  .attr("width", 600)
  .attr("height", 600)
  .style('border', 'solid')

const drag = d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended);

svg.append('circle')
  .attr("cx", 300)
  .attr("cy", 300)
  .attr("r", 10)
  .style('fill', 'black')
  .style('cursor', 'pointer')
  .call(drag)

function dragstarted(event, d) {
  //d3.select(this).raise().attr("stroke", "black");
  const newPath = svg.append("path")
  //.attr("d", d="M z")
  .attr("d", d="M")
  .attr("stroke", "blue")
  .attr("stroke-width", 2)
  .attr("fill", "none");

  //next step, create a function for the path d attrs
}

function dragged(event) {
  /*
  d3.select(this)
    .attr("cx", d3.event.x)
    .attr("cy", d3.event.y);
  
    console.log('d3.event.x', d3.event.x)
    console.log('d3.event.y', d3.event.y)

    const currentPathD = d3.select('path').node().getAttribute("d")
    const pathStart = currentPathD//.slice(0, currentPathD.length - 1)
    console.log('currentD', currentPathD)
    //console.log('pathStart', pathStart)

    const currentCoods = d3.event.x + ',' + d3.event.y;
    console.log('currentCoods', currentCoods)
    const nextPathD = pathStart + ' ' +currentCoods// + ' z';
    console.log('nextD', nextPathD) 

    d3.select('path').node().setAttribute("d", nextPathD)
  
    //update the path -> its last pos should be the current pos
    //of circle
    */
}

function dragended(event, d) {
  //temp remove so we can see next path added
  //d3.select('path').remove('*')
}

//todo
//1. on click svg, move circle to there

//2. touch event drag: