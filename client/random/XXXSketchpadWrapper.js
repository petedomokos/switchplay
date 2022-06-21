import React, { useEffect } from 'react'
import * as d3 from 'd3'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { path } from 'd3'

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2)
  },
  strapline: {
    padding:`${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    color: theme.palette.openTitle
  },
  instructions:{
    padding:`${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    color: theme.palette.openTitle,
    fontSize:'12px'
  }
}))

export default function SketchpadWrapper(){
  const classes = useStyles();

  useEffect(() =>{

    const width = window.innerWidth*0.8;
    const height = window.innerHeight*0.6;
    const paths = [];
        
    const svg = d3.select("#chart-area").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("border", "solid")
        .style("border-width", "thin");

    const backgroundG = svg.append("g")
        .attr("class", "backgroundG");
    
    backgroundG.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'white')
        //move the circle when user clicks screen
        .on('click', event =>{
            svg.select('circle')
                .attr("cx", event.offsetX)
                .attr("cy", event.offsetY);
        });
    
    //create the drag function
    const drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    
    //append circle and call the drag function on it
    svg.append('circle')
        .attr("cx", 300)
        .attr("cy", 200)
        .attr("r", 10)
        .style('fill', 'black')
        .style('cursor', 'pointer')
        .call(drag);

    function dragstarted(event, d) {
        //set up a new path element for this drag
        //new drawing path will start from where circle is
        const start = "M" +event.x +',' +event.y;
        const pathNr = paths.length;
        //conditionally add isCircle -> const newPath = svg.append("path").attr('class', 'isCircle drawing drawing-'+pathNr)
        const newPath = svg.append("path").attr('class', 'drawing drawing-'+pathNr)
            .attr("d", start)
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");

        //keep a record of the paths
        paths.push(newPath.node());
    }

    function dragged(event) {
        //move the circle
        d3.select(this)
            .attr("cx", event.x)
            .attr("cy", event.y);

        //update d attribute of the path that corresponds to this drag action
        //new path has been pushed now, so pathNr is 1 less than array length
        const pathNr = paths.length-1;
        const currentPathD = d3.select('path.drawing-'+pathNr).node().getAttribute("d");
        const currentCoods = event.x + ',' + event.y;
        const nextPathD = currentPathD + ' ' +currentCoods;

        d3.select('path.drawing-'+pathNr).attr("d", nextPathD);
    }

    function dragended(event, d) {
      /*if(isCircle){
        remove path
        append circle
      }*/
        //clean up
    }
  }, [])

  function onClear(){
    d3.selectAll('path.drawing').remove();
    //we dont reset paths array as user may wish to undo clear
  }

  return (
      <div className={classes.root}>
        <Typography className={classes.strapline} type="body1" component="p">
          Sketchpad
        </Typography>
        <Typography className={classes.instructions} type="body2" component="p">
          Click space to move circle position. Drag circle to draw.
        </Typography>
        <div id='chart-area'></div>
        <div id='ctrls'>
            <button onClick={onClear} style={{margin:'20px 0'}}>Clear</button>
        </div>
      </div>
  )
}
