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
import VideoApp from "./VideoApp"

const useStyles = makeStyles(theme => ({
  root: {
    margin: theme.spacing(2)
  },
  strapline: {
    marginLeft:"30px",
    padding:`${theme.spacing(0)}px ${theme.spacing(1)}px ${theme.spacing(1)}px`,
    color: theme.palette.openTitle,
    [theme.breakpoints.down('md')]: {
    },
    [theme.breakpoints.up('lg')]: {
    },
  } 
}))

export default function NonUserHome(){
  const classes = useStyles()
  return (
      <div className={classes.root}>
        <Typography className={classes.strapline} type="body1" component="p">
        SWITCHPLAY
        </Typography>
        {/**<VideoApp/>*/}
      </div>
  )
}
