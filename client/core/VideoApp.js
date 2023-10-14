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
    margin: theme.spacing(2)
  },
  title: {
    padding:`${theme.spacing(1)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    color: theme.palette.openTitle,
    [theme.breakpoints.down('md')]: {
    },
    [theme.breakpoints.up('lg')]: {
    },
  },
  videoAppContainer:{
    border:"1px solid blue", 
    position:"relative"
  },
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
  actionBtns:{
    position:"absolute", 
    left:0, 
    top:"calc(100% - 100px)",
    width:"100%", 
    height:"50px"
  },
  catBtns:{
    position:"absolute", 
    left:0,
    top:0,
    width:"100%",
    height:"calc(100% - 50px)", 
    background:"white"
  },
  outcomeBtns:{
    position:"absolute", 
    left:0,
    top:0,
    width:"100%",
    height:"calc(100% - 50px)", 
    background:"white"
  },
  actionBtn:{
    width:"33.3%",
    height:"100%",
    fontSize:"2rem",
    borderRadius: "5px"
  },
  catBtn:{
    width:"100%",
    height:props => props.nrCats === 4 ? "25%" : (props.nrCats === 3 ? "33.3%" : "50%"),
    fontSize:"2rem",
    borderRadius: "10px"
  },
  catDesc:{
    fontSize:"12px"
  },
  outcomeBtn:{
    width:"100%",
    height:props => props.nrOutcomes === 4 ? "25%" : (props.nrOutcomes === 3 ? "33.3%" : "50%"),
    fontSize:"2rem",
    borderRadius: "10px"
  },
  pastActionsContainer:{

  },
  pastAction:{
    display:"flex"
  },
  pastActionTime:{ 
    width:"70px"
  },
  pastActionKey:{ 
    width:"70px"
  },
  pastActionCat:{
    width:"110px"
  },
  pastActionOutcome:{ 
    width:"90px"
  }
  
}))

const actions = [
  {
    key:"dribble",
    categories:["run_into_space", "go_past_player"],
    outcomes:["success", "fail"]
  },
  {
    key:"shot",
    categories:["power", "placement", "both"],
    outcomes:["goal", "saved", "blocked", "off_target"]
  },
  {
    key:"pass",
    categories:["forward", "possession"],
    outcomes:[ "chance", "kept_ball", "lost_ball"]
  }
]

//helper
const timeInSecs = (timeInMS, pts=0) => (timeInMS/1000).toFixed(pts)

export default function VideoApp(){
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timerIsPaused, setTimerIsPaused] = useState(false);
  const [time, setTime] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOutcome, setSelectedOutcome] = useState("");
  const [pastActions, setPastActions] = useState([]);
  const classes = useStyles({ 
    nrCats:selectedAction?.categories.length || 0,
    nrOutcomes:selectedAction?.outcomes.length || 0
  })
  //todo - onPlay, startPlaying ie user clicks red arrow
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
  //note: d3.interval not compatible with timer.restart so create new one each time
  //from http://www.using-d3js.com/08_04_timers.html
  const onStopPlaying = () => {
    if(timer){
      timer.stop();
      setTimer(null);
      setTimerIsPaused(true);
    }
    setPlaying(false);
  }

  const handleActionClick = action => {
    //pause video
    onStopPlaying(false);
    //todo next - time is not now, but the time on the video.
    //the timer needs to also be paused, rewound etc in snyc with the video
    setSelectedAction({ ...action, time });
  }
  const handleCategoryClick = cat => {
    setSelectedCategory(cat);
  }
  const handleOutcomeClick = outcome => {
    setSelectedOutcome(outcome);
    const newAction = { 
      key:"act-"+pastActions.length,
      time:selectedAction.time, 
      actionKey:selectedAction.key,
      category:selectedCategory,
      outcome,
    }

    setTimeout(() => {
      setPastActions(prevState => ([...prevState, newAction]));
      setSelectedAction(null);
      setSelectedCategory("");
      setSelectedOutcome("");
      //play video
      onStartPlaying();
    }, 500)
  }

  //helper
  //full match https://www.youtube.com/watch?v=eyGmSmEaCQk

  //highlights https://www.youtube.com/watch?v=yUSLSaUutnw

  const categoryDesc = action => {
    if(selectedAction?.key !== action.key || !selectedCategory){ return ""}
    return `(${selectedCategory})`
  }

  return (
      <div className={classes.root}>
        <Typography className={classes.strapline} type="body1" component="p">
          Video Analysis 
        </Typography>
        <div className={classes.videoAppContainer}>
          <ReactPlayer
            controls={true}
            playing={playing}
            url='https://www.youtube.com/watch?v=eyGmSmEaCQk' />
          <div className={classes.videoCtrls}>
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
            {time && 
              <div className={classes.elapsedTime}>time: {timeInSecs(time, 1)}</div>
            }
          </div>
          <div className={classes.actionBtns} >
              {actions.map(action => (
                <button
                  className={classes.actionBtn} 
                  style={{background:action.key === selectedAction?.key ? "blue" : grey10(1)}}
                  key={action.key}
                  onClick={() => handleActionClick(action)}
                  >
                    {action.key} 
                    <span className={classes.catDesc}>{categoryDesc(action)}</span>
                </button>
              ))}
          </div>
          {selectedAction && 
            <div className={classes.catBtns}>
              {selectedAction.categories.map(cat => (
                <button
                  className={classes.catBtn}
                  key={`${selectedAction.key}-${cat}`}
                  style={{background:cat === selectedCategory ? "blue" : grey10(2)}}
                  onClick={() => handleCategoryClick(cat)}
                  >
                    {cat}
                </button>
              ))}
            </div>
          }
          {selectedAction && selectedCategory && 
            <div className={classes.outcomeBtns}>
              {selectedAction.outcomes.map(outcome => (
                <button
                  className={classes.outcomeBtn}
                  key={`${selectedAction.key}-${selectedCategory}-${outcome}`}
                  style={{background:outcome === selectedOutcome ? "blue" : grey10(2)}}
                  onClick={() => handleOutcomeClick(outcome)}
                  >
                    {outcome}
                </button>
              ))}
            </div>
          }
        </div>
        <div className={classes.pastActionsContainer}>
          <div style={{margin:"10px"}}> Past Actions</div>
          {pastActions.map((action,i) => (
            <div className={classes.pastAction} key={action.key}>
              <div className={classes.pastActionTime}>
                {timeInSecs(action.time)}
              </div>
              <div className={classes.pastActionKey}>
                {action.actionKey}
              </div>
              <div className={classes.pastActionCat}>
                {action.category}
              </div>
              <div className={classes.pastActionOutcome}>
                {action.outcome}
              </div>
            </div>
          ))}
        </div>
      </div>
  )
}
