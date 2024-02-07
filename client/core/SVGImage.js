import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import imageComponent from './imageComponent';
import uuid from 'react-uuid';

import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  imageSvg: {
      //border:"solid"
  }
}))

const SVGImage = ({ imgKey, image, dimns, styles, settings }) =>{
    const { width, height } = dimns;
    const { borderColour="black" } = styles;
    const { withBorderGradient=true, borderWidth=40 } = settings;

    const styleProps = { };
    const classes = useStyles(styleProps);
    const [svgImage, setImageComponent] = useState(() => imageComponent());
    const containerRef = useRef(null);

    useEffect(() => {
        d3.select(containerRef.current)
            .datum(image)
            .call(svgImage
                .width(width)
                .height(height)
                .borderWidth(borderWidth)
                .withBorderGradient(withBorderGradient)
                .imgKey(imgKey))
            
    }, [width, height])

    useEffect(() => {

    },[])

    return (
        <svg className={classes.imageSvg} id={`image-svg`} ref={containerRef} width={width} height={height} >
            <defs>
                <clipPath id={`${imgKey}-circle-clip`}><circle/></clipPath>
                <clipPath id={`${imgKey}-rect-clip`}><rect/></clipPath>
                <linearGradient id={`${imgKey}-img-grad-left`} x1={"0%"} x2={"100%"} y1={"0%"} y2={"0%"} >
                    <stop offset={"0%"} style={{ stopColor:borderColour, stopOpacity:1 }} />
                    <stop offset={"60%"} style={{ stopColor:borderColour, stopOpacity:0 }} />
                </linearGradient>
                <linearGradient id={`${imgKey}-img-grad-right`} x1={"100%"} x2={"0%"} y1={"0%"} y2={"0%"} >
                    <stop offset={"0%"} style={{ stopColor:borderColour, stopOpacity:1 }} />
                    <stop offset={"60%"} style={{ stopColor:borderColour, stopOpacity:0 }} />
                </linearGradient>
                <linearGradient id={`${imgKey}-img-grad-top`} x1={"0%"} x2={"0%"} y1={"0%"} y2={"100%"} >
                    <stop offset={"0%"} style={{ stopColor:borderColour, stopOpacity:1 }} />
                    <stop offset={"60%"} style={{ stopColor:borderColour, stopOpacity:0 }} />
                </linearGradient>
                <linearGradient id={`${imgKey}-img-grad-bottom`} x1={"0%"} x2={"0%"} y1={"100%"} y2={"0%"} >
                    <stop offset={"0%"} style={{ stopColor:borderColour, stopOpacity:1 }} />
                    <stop offset={"60%"} style={{ stopColor:borderColour, stopOpacity:0 }} />
                </linearGradient>
            </defs>
        </svg>
    )
}

SVGImage.defaultProps = {
    imgKey:"",
    dimns:{
        width:300,
        height:300
    },
    image:{},
    style:{},
    settings:{
    }
  }
  
export default SVGImage;
