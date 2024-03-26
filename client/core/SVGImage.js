import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import imageComponent from './imageComponent';
import { isNumber } from '../data/dataHelpers';


import { makeStyles } from '@material-ui/core/styles'
import { width } from 'styled-system';

const useStyles = makeStyles(theme => ({
  imageSvg: {
      border:"solid",
      borderColor:"yellow",
      overflow:"hidden"
      /*[theme.breakpoints.up('md')]: {
        display:props => props.className.includes("sm-down") ? "none" : null
      },
      [theme.breakpoints.down('sm')]: {
        display:props => props.className.includes("md-up") ? "none" : null
      },*/
  }
}))

//@todo - add proper window event listener
const SVGImage = ({ imgKey, image, fixedDimns, styles, className, settings, contentFit, centreHoriz, centreVert }) =>{
    const [dimns, setDimns] = useState({ width: fixedDimns?.width || 0, height: fixedDimns?.height || 0 })
    const containerRef = useRef(null);
    
    //console.log("update dimns now..", dimns)
    const { borderColour="black" } = styles;
    const { withBorderGradient=false, borderWidth=0 } = settings;

    const styleProps = { className };
    const classes = useStyles(styleProps);
    const [svgImage, setImageComponent] = useState(() => imageComponent());

    const { aspectRatio, rawImgWidth=dimns.width, rawImgHeight=dimns.height, imgTransX=0, imgTransY=0, scale, requiredHeight  } = image;

    useEffect(() => {
        if(fixedDimns){ return; }
        const containerDimns = containerRef?.current?.parentNode.getBoundingClientRect() || { width:0, height:0 };
        const { width } = containerDimns;
        const height = requiredHeight || (aspectRatio ? width * aspectRatio : containerDimns.height);
        
        if((isNumber(width) && width !== dimns.width) || (isNumber(height) && height !== dimns.height)){
            //setTimeout(() => {
                setDimns({ width, height })
            //}, 5000)
        }
    })

    useEffect(() => {

        //todo - if contentFit = contain, work out the vertScale too,
        //then use the max of the two scales
        const horizScale = (dimns.width / rawImgWidth) * (scale || 1);
        const vertScale = (dimns.height / rawImgHeight) * (scale || 1);
        //console.log("vertScale horizScale", vertScale, horizScale)
        //two options atm: contain or horizFit
        let imgScale;
        if(contentFit === "contain"){
            imgScale = d3.min([horizScale, vertScale]);
        }else if (contentFit === "cover"){
            imgScale = d3.max([horizScale, vertScale]);
        }else if (contentFit === "fit-height"){
            imgScale = vertScale;
        }else{
            imgScale = horizScale;
        }
        //console.log("imgScale", imgScale)

        let dx = 0;
        let dy = 0;
        //if(contentFit === "contain"){
        if(imgScale === vertScale){
            //console.log("used vert scale, must adjust horiz")
            //extra horiz space needs sharing out so img is centered
            const extraHorizSpace = (horizScale - vertScale) * rawImgWidth;
            dx = centreHoriz ? extraHorizSpace/2 : 0; 
        }else{
            //console.log("used horiz scale, must adjust vert")
            const extraVertSpace = (vertScale - horizScale) * rawImgHeight;
            dy = centreVert ? extraVertSpace/2 : 0;
        }
        
        const imgTransform = `translate(${imgTransX + dx},${imgTransY + dy}) scale(${imgScale})`;

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
    contentFit:"horizFit",
    centreHoriz:false,
    centreVert:false
  }
  
export default SVGImage;
