import React, { Fragment, useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import imageComponent from './imageComponent';
import { isNumber } from '../data/dataHelpers';


import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  imageSvg: {
      border:"solid",
      borderColor:"blue",
      display:"flex",
      alignItems:"flex-start"
  }
}))

//@todo - add proper window event listener
const Image = ({ imgKey, image, fixedDimns, styles, className, settings }) =>{
    const styleProps = { };
    const classes = useStyles(styleProps);
    
    const { url } = image;
    //const imgScale = image.dimns.width / rawImgWidth;
    //const imgTransform = `translate(${imgTransX},${imgTransY}) scale(${imgScale})`;

    return (
        <div>
            hello
            <img
            src={url}
            />
        </div>
        
    )
}

Image.defaultProps = {
    imgKey:"",
    image:{},
    styles:{ root:{} },
    settings:{
    },
    className:""
  }
  
export default Image;
