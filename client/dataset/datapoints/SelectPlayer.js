import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withLoader } from '../../util/HOCs';
import { DropdownSelector } from "../../util/Selector";
import { fatigueLevel, surface } from "../../data/datapointOptions";

const useStyles = makeStyles(theme => ({
}))

function SelectPlayer({ selected, players, handleChange, style }) {
  const classes = useStyles()
  return (
    <DropdownSelector
        description="Player"
        selected={selected}
        options={players}
        labelAccessor={option => option.firstname + " " +option.surname}
        handleChange={handleChange}
        style={style}
    />
  )
}
/*
SelectPlayer.defaultProps = {
  players:[],
  open:false
}
*/
//note - loader will load user if no datapoints
export default withLoader(SelectPlayer, ['userLoadsComplete']);