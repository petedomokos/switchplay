import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { grey10 } from "./cards/constants"

const useStyles = makeStyles(theme => ({
    strapline: {
        zIndex:1,
        //alignSelf:"flex-start",
        //padding:`${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(2)}px`,
        display:"flex",
        flexDirection:"column",
        justifyContent:"center",
        alignItems:"flex-start",    
        width:"100%",
        height:"60px",
        //border:"solid",
        borderColor:"yellow",
        color: theme.palette.openTitle,
        [theme.breakpoints.down('md')]: {
        },
        [theme.breakpoints.up('lg')]: {
        },
    },
    straplinePart1:{
        fontSize:"28px",
        //alignSelf:"flex-start",
        color:grey10(4)
        //border:"solid"
    },
    straplineJoiner:{
        //alignSelf:"flex-start",
        //alignSelf:"center",
        fontSize:"28px",
        //border:"solid"
    },
    straplinePart2:{
        //alignSelf:"flex-start",
        //alignSelf:"flex-end",
        fontSize:"28px",
        color:grey10(4)
        //border:"solid"
    },
    straplineTop:{
        fontSize:"20px"
    },
}))

export default function Strapline({style}){
  const classes = useStyles()
  return (
      <div className={classes.strapline} style={style.root || {}}>
          <Typography className={classes.straplinePart1} type="body1" component="p">
          The project management tool
          </Typography>
          <Typography className={classes.straplinePart2} type="body1" component="p">
          for football academies
          </Typography>
        {/**<div className={classes.strapline}>
          <Typography className={classes.straplinePart1} type="body1" component="p">
          Project Management for
          </Typography>
          <Typography className={classes.straplineJoiner} type="body1" component="p">
          for
          </Typography>
          <Typography className={classes.straplinePart2} type="body1" component="p">
          Player Development
          </Typography>

        </div>*/}
        {/**<div style={{marginTop:"30px", width:200 , alignSelf:"flex-start"}}>
          <Typography className={classes.straplineJoiner} type="body1" component="p">
          The
          </Typography>
          <Typography className={classes.straplinePart2} type="body1" component="p">
          Player Development App
          </Typography>

        </div>*/}
        {/**<div style={{marginTop:"30px", width:200 , alignSelf:"flex-start",
          display:"flex", flexDirection:"column" }}>
          <Typography style={{
              alignSelf:"flex-end", fontSize:"14px", transform:"rotate(-45deg)"
            }} type="body1" component="p">
          App
          </Typography>
          <div style={{alignSelf:"center", display:"flex", justifyContent:"space-around", width:"140px"}}>
            <Typography style={{fontSize:"14px", transform:"translate(0px, 5px) rotate(-30deg)"}} type="body1" component="p">
            Athlete
            </Typography>
            <Typography style={{fontSize:"14px", transform:"translate(0px, -10px) rotate(-0deg)"}} type="body1" component="p">
            Development
            </Typography>
          </div>
          <Typography style={{alignSelf:"flex-start", fontSize:"14px"}}type="body1" component="p">
          The
          </Typography>
        </div>*/}
        {/**<svg viewBox="0 0 500 500">
          <path id="curve" d="M 10, 50 a 40,40 0 1,1 80,0 40,40 0 1,1 -80,0" fill="none" />
          <text width="500">
            <textPath alignmentBaseline="top" xlinkHref="#curve" className={classes.straplineTop}>
              Project Management
            </textPath>
          </text>
        </svg>*/}
      </div>
  )
}

Strapline.defaultProps = {
    style:{},
  }
