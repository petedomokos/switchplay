import React, { } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const pathD = "M31.5,6c-0.82839,0.00008 -1.49992,0.67161 -1.5,1.5v4.5h-4.5c-0.82839,0.00008 -1.49992,0.67161 -1.5,1.5v4.5h-4.5c-0.82839,0.00008 -1.49992,0.67161 -1.5,1.5v4.5h-4.5c-0.82839,0.00008 -1.49992,0.67161 -1.5,1.5v4.5h-4.5c-0.82839,0.00008 -1.49992,0.67161 -1.5,1.5v4c0,3.57194 2.92806,6.5 6.5,6.5h23c3.57194,0 6.5,-2.92806 6.5,-6.5v-23c0,-3.57194 -2.92806,-6.5 -6.5,-6.5zM33,9h2.5c1.95006,0 3.5,1.54994 3.5,3.5v23c0,1.95006 -1.54994,3.5 -3.5,3.5h-23c-1.95006,0 -3.5,-1.54994 -3.5,-3.5v-2.5h4.5c0.82839,-0.00008 1.49992,-0.67161 1.5,-1.5v-4.5h4.5c0.82839,-0.00008 1.49992,-0.67161 1.5,-1.5v-4.5h4.5c0.82839,-0.00008 1.49992,-0.67161 1.5,-1.5v-4.5h4.5c0.82839,-0.00008 1.49992,-0.67161 1.5,-1.5z"

const useStyles = makeStyles(theme => ({

}))

export default function StepsIcon({ width, height, transformOrigin, fill }) {
  const styleProps = {
  }
  const classes = useStyles(styleProps);

  //note- it has some padding so need to accomodate it
  return (
    <svg viewBox="0,0,256,256" width={`${width * 1.2}px`} height={`${height * 1.2}px`} 
        transform={`translate(${-width * 0.1}, ${-height * 0.1})`} transformOrigin={transformOrigin}>
        <g fill={fill} fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" 
           strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" 
           fontSize="none" textAnchor="none" style={{ mixBlendMode: "normal" }}>
            <g transform="scale(5.33333,5.33333)">
                <path d={pathD}>
                </path>
            </g>
        </g>
    </svg>
  )
}

StepsIcon.defaultProps = {
    fill:"#e8e8e8",
    width:30,
    height:30,
    transformOrigin:"top left"
}