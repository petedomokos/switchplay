import React, { useEffect, useState } from 'react'
import { CSSTransition } from "react-transition-group";
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { grey10 } from "./cards/constants"
import Tick from './Tick';
  
const useStyles = makeStyles(theme => ({
    keypoints:{
        margin:"0",
        width:"450px",
        height:"100%",
        display:"flex",
        flexDirection:"column",
        //justifyContent:"center",
        //border:"solid",
        borderColor:"yellow",
      },
      keypoint:{
        margin:"0 10px 20px 0",
        //margin:"10px", //for when centred
        height:props => `${props.keypointHeight}px`,
        //border:"solid",
        display:"flex",
        alignItems:"center"
      },
      tick:{
        color:grey10(3)
      },
      keypointText:{
        display:"flex",
        flexDirection:"column",
      },
      keypointTitle:{
        marginLeft:"10px",
        fontsize:"14px",
        color:grey10(5)
      },
      keypointDesc:{
        marginLeft:"10px",
        fontsize:"10px",
        color:grey10(7)
      },
    
}))

export default function Keypoints({keypoints, style}){
  const keypointHeight = 70;
  const tickHeight = keypointHeight * 0.7;
  const tickWidth = tickHeight;
  const titleHeight = keypointHeight * 0.4;
  const descHeight = keypointHeight * 0.6;
  const classes = useStyles({ keypointHeight, titleHeight, descHeight });
  const [nrKeypointTicksShown, setNrKeypointTicksShown] = useState(0);
  const [nrKeypointTextsShown, setNrKeypointTextsShown ] = useState(0);

  /*
  useEffect(() => {
    //each keypoint has 2 stages - show tick, then show text
    let n = 1;
    const t = d3.interval(() => {
      if (n > keypoints.length) {
        t.stop();
        return;
      }
      setNrKeypointTicksShown(prevState => prevState + 1);
      setTimeout(() => { setNrKeypointTextsShown(prevState => prevState + 1) }, 500)

      n += 1;
    }, 2000);

  }, [])
  */

  const onEntered = () => {
    //console.log("entered")
  }

  const onExit = () => {
    //console.log("exit")
  }
  
  return (
      <div className={classes.keypoints} style={style.root || {}}>
        {keypoints.map((keypoint,i) =>
            <div className={classes.keypoint} key={`keypoint-${keypoint.id}`}>
            <CSSTransition
                in={i < nrKeypointTicksShown || 2 === 2}
                timeout={200}
                classNames="list-transition"
                unmountOnExit
                appear
                onEntered={onEntered}
                onExit={onExit}
            >
                <Tick style={{ root: { width:tickWidth, height:tickHeight } }}/>
            </CSSTransition>
            <CSSTransition
                in={i < nrKeypointTextsShown || 2===2}
                timeout={200}
                classNames="list-transition"
                unmountOnExit
                appear
                onEntered={onEntered}
                onExit={onExit}
            >
              <div className={classes.keypointText} >
                <Typography className={classes.keypointTitle} type="body1" component="p">
                {keypoint.title}
                </Typography>
                <h5 className={classes.keypointDesc}>
                  {keypoint.desc}
                </h5>
              </div>
            </CSSTransition>
            </div>
        )}
      </div>
  )
}

Keypoints.defaultProps = {
  keypoints:[],
  style:{},
}
