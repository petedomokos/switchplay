import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Avalanche from "./avalanche/Avalanche";
import { COLOURS } from "./constants";

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

const Games = ({}) => {
  const styleProps = { };
  const classes = useStyles();
  const width = 1000;
  const height = 600;

  return (
    <div className={classes.root} >
      <Avalanche width={width} height={height}/>
    </div>
  )
}

Games.defaultProps = {
}

export default Games
