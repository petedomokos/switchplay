import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import { TRANSITIONS } from './constants';

const useStyles = makeStyles(theme => ({
  root: {
    width:"100%",
    height:"100%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
  }

}))

export default function IconComponent({ transition, text, onClick, styles }) {
  const classes = useStyles();
  const containerRef = useRef(null);

  useEffect(() => { 
      //transition in
      d3.select(containerRef.current)
        .style("opacity", 0)
            .transition()
            .delay(transition.delay)
            .duration(transition.duration)
                .style("opacity", 1)
  }, [])

  return (
    <div className={classes.root} ref={containerRef} onClick={onClick} styles={styles} >
        {text}
    </div>
  )
}

IconComponent.defaultProps = {
    transition:{ duration: TRANSITIONS.FAST, delay:TRANSITIONS.MED },
    text:"",
    styles:{},
    onClick:() => {}
}