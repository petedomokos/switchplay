import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
//children
import SimpleList from '../util/SimpleList'
import auth from '../auth/auth-helper'
import { Button } from '@material-ui/core'
import { grey10 } from "./journey/constants"



const useStyles = makeStyles(theme => ({
  root: {
  },
  videoPlayerContainer:{
  },
  /*
  videoCtrls:{
    position:"absolute",
    right:0,
    top:0,
    width:80,
  },
  videoCtrlsBtn:{
    width:70,
    height:50,
    margin:"5px",
    fontSize:"16px"
  },
  elapsedTime:{
    background:"grey"
  },
  */
}))

//helper
//const timeInSecs = (timeInMS, pts=0) => (timeInMS/1000).toFixed(pts)

export default function VideoPlayer({link, withTime, width, height}){
  const classes = useStyles({ })
  const [playing, setPlaying] = useState(false);
  /*
  //const [timer, setTimer] = useState(null);
  const [timerIsPaused, setTimerIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const onTogglePlay = () => {
    if(playing){
      onStopPlaying();
    }else{
      onStartPlaying();
    }
  }

  const startTimer = () => {
    const timeSoFar = time;
    const timer = d3.interval((time) => {
      setTime(time + timeSoFar);
    },
    100)
    setTimer(timer);
  }
  const onStartPlaying = () => {
    if(timerIsPaused){
      startTimer();
      setTimerIsPaused(false);
    }
    setPlaying(true);
  }
  */


  let requiredWidth;
  let requiredHeight;
  if(!width && !height){
    //these are the defaults anyway but we make it explicit here
    requiredWidth = 640;
    requiredHeight = 360;
  }else{
    requiredWidth =  width || height * (640/360);
    requiredHeight = height || width / (640/360);
  }

  return (
      <div className={classes.root}>
        <div className={classes.videoPlayerContainer}>
          <ReactPlayer
              controls={true}
              playing={playing}
              url={link} 
              width={requiredWidth}
              height={requiredHeight}
          />
          {/**<div className={classes.videoCtrls}>
              <button 
                className={classes.videoCtrlsBtn}
                onClick={onTogglePlay}
                >
                {playing ? "Pause" : "Play"}
              </button>
              {playing && !timer && !timerIsPaused &&
                <button 
                  className={classes.videoCtrlsBtn}
                  onClick={startTimer}
                  >
                  start clock
                </button>
              }
              {withTime && time && 
                <div className={classes.elapsedTime}>time: {timeInSecs(time, 1)}</div>
              }
            </div>**/}
        </div>
      </div>
  )
}

VideoPlayer.defaultProps = {
  link:""
}
