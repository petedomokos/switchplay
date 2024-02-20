import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import storyAnimationComponent from './storyAnimationComponent';
import { sceneElements } from './sceneElements';

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  workflowAnimationSvg: {
      //border:"solid",
      //borderColor:"blue"
  }
}))

const WorkflowAnimation = ({ dimns }) =>{
    //console.log("dimns", dimns)
    const { width, height } = dimns;
    const styleProps = { };
    const classes = useStyles(styleProps);
    const [animation, setAnimation] = useState(() => storyAnimationComponent());
    const [sceneState,setSceneState] = useState({ sceneNr: 1, frameNr: 1});
    const { sceneNr, frameNr } = sceneState;
    const containerRef = useRef(null);

    const nrScenes = Object.keys(sceneElements).length;

    const updateSceneState = () => {
        if(sceneElements[sceneNr][frameNr + 1]){
        //move frame on
        setSceneState(prevState => ({ ...prevState, frameNr:frameNr + 1 }));
        }else{
        //move scene on
        setSceneState(prevState => ({ sceneNr:(prevState.sceneNr % nrScenes) + 1, frameNr:1 }))
        }
    }

    useEffect(() => {
        const scene = sceneElements[sceneNr];
        const { key, title, lineStyles, lines, heroX, heroY, characterX, characterY } = scene;
        const sceneMetadata = {
            key,
            title,
            lineStyles,
            lines,
            heroX, heroY, characterX, characterY,
            nrHeroes:d3.max(Object.values(scene), d => d.heroes?.length) || 0,
            nrCharacters:d3.max(Object.values(scene), d => d.characters?.length) || 0,
            nrWaves:d3.max(Object.values(scene), d => d.waves?.length) || 0
        }
        d3.select(containerRef.current)
            .datum({ ...sceneElements[sceneNr][frameNr], sceneMetadata })
            .call(animation
                .width(width)
                .height(height)
                .sceneNr(sceneNr)
                .frameNr(frameNr))
            
    }, [width, height, sceneNr, frameNr])

    useEffect(() => {
        const t = d3.interval(() => {
            updateSceneState();
        }, 4000);

        return () => {
            t.stop()
        }

    },[])


    return (
        <svg className={classes.workflowAnimationSvg} id={`workflow-animation-svg`} ref={containerRef} width={width} height={height} >
            <defs>
                <clipPath id="hero-clip"><circle/></clipPath>
                <clipPath id="player-clip"><circle/></clipPath>
            </defs>
        </svg>
    )
}

WorkflowAnimation.defaultProps = {
    dimns:{
        width:450,
        height:350
    },
    style:{},
  }
  
export default WorkflowAnimation;
