import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import imageComponent from './imageComponent';
import { isNumber } from '../data/dataHelpers';


import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  imageSvg: {
      //border:"solid",
      borderColor:"blue",
      /*[theme.breakpoints.up('md')]: {
        display:props => props.className.includes("sm-down") ? "none" : null
      },
      [theme.breakpoints.down('sm')]: {
        display:props => props.className.includes("md-up") ? "none" : null
      },*/
  }
}))

//@todo - add proper window event listener
const SVGImage = ({ imgKey, image, fixedDimns, styles, className, settings, contentFit }) =>{
    const [dimns, setDimns] = useState({ width: fixedDimns?.width || 0, height: fixedDimns?.height || 0 })
    const containerRef = useRef(null);
    
    //console.log("update dimns now..", dimns)
    const { borderColour="black" } = styles;
    const { withBorderGradient=false, borderWidth=0 } = settings;

    const styleProps = { className };
    const classes = useStyles(styleProps);
    const [svgImage, setImageComponent] = useState(() => imageComponent());

    const { aspectRatio, rawImgWidth=dimns.width, rawImgHeight=dimns.height, imgTransX=0, imgTransY=0, scale  } = image;

    useEffect(() => {
        if(fixedDimns){ return; }
        //console.log("parent", containerRef?.current?.parentNode)
        const containerDimns = containerRef?.current?.parentNode.getBoundingClientRect() || { width:0, height:0 };
        const { width } = containerDimns;
        //console.log("cont dimns", containerDimns)
        const height = aspectRatio ? width * aspectRatio : containerDimns.height;
        
        //console.log("USE-EFFECT widths heights equal?", width === dimns.width, height === dimns.height)
        //console.log("dimns.w rw w", dimns.width, width)
        //console.log("dimns.h rh", dimns.height, height)
        if((isNumber(width) && width !== dimns.width) || (isNumber(height) && height !== dimns.height)){
            //console.log("setting.................", width, height)
            //setTimeout(() => {
                setDimns({ width, height })
            //}, 5000)
        }
    })

    useEffect(() => {
        //calc the transform required
        //@todo - impl option to scale y separately based on height
        //console.log("scale", scale)

        //todo - if contentFit = contain, work out the vertScale too,
        //then use the max of the two scales
        const horizScale = (dimns.width / rawImgWidth) * (scale || 1);
        const vertScale = (dimns.height / rawImgHeight) * (scale || 1);
        //two options atm: contain or horizFit
        const imgScale = contentFit === "contain" ? d3.min([horizScale, vertScale]) : horizScale;

        let dx = 0;
        let dy = 0;
        if(contentFit === "contain"){
            if(vertScale < horizScale){
                //extra horiz space needs sharing out so img is centered
                const extraHorizSpace = (horizScale - vertScale) * rawImgWidth;
                dx = extraHorizSpace/2; 
            }else{
                const extraVertSpace = (vertScale - horizScale) * rawImgHeight;
                dy = extraVertSpace/2;
            }
        }
        //if contentsFit is contain, need to add extra transX or transY so img is centered
        //find the extra reduction to the one that could have been bigger
        //then divide it by two

        //console.log("imgScale", imgScale)
        const imgTransform = `translate(${imgTransX + dx},${imgTransY + dy}) scale(${imgScale})`;
        //console.log("trans", imgTransform)

        d3.select(containerRef.current)
            .datum({ ...image, transform:image.transform || imgTransform })
            .call(svgImage
                .width(dimns.width)
                .height(dimns.height)
                .borderWidth(borderWidth)
                .withBorderGradient(withBorderGradient)
                .imgKey(imgKey))
            
    }, [dimns, image])

    return (
        <svg className={`${classes.imageSvg} ${className}`} id={`image-svg`} ref={containerRef} width={dimns.width} height={dimns.height} style={{ ...styles.root }} >
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
    image:{},
    styles:{ root:{} },
    settings:{
    },
    className:"",
    contentFit:"horizFit"
  }
  
export default SVGImage;
