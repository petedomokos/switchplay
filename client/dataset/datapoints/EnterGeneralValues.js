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
  textField:{
    width:"100%"
  }
}))

function EnterGeneralValues({ values, optionObjects, handleChange }) {
  const classes = useStyles()
  return (
      <div>
          <DropdownSelector
              description="Surface"
              selected={values.surface}
              options={optionObjects.surface.options}
              handleChange={handleChange("surface")} 
              style={{width:"350px"}}
              />
          <DropdownSelector
              description="Fatigue Level"
              selected={values.fatigueLevel}
              options={optionObjects.fatigueLevel.options}
              handleChange={handleChange("fatigueLevel")} 
              style={{width:"350px"}}
              />
          <EditNotes
              notes={values.notes}
              handleChange={handleChange("notes")}
              classes={classes}
              style={{width:"350px"}}/>
      </div>
  )
}

EnterGeneralValues.defaultProps = {

}


//todo - move wrapper to root of app
/*
2020 18:37:55 GMT+0000 (Greenwich Mean Time)" does not conform 
to the required format.  The format is "yyyy-MM-ddThh:mm" 
followed by optional ":ss" or ":ss.SSS".*/
const SelectEventDate = ({handleChange, classes}) =>
  <div>
    <form className={classes.container} noValidate>
    <TextField
        className={classes.textField}
        id="datetime-local"
        label="Date and Time"
        type="datetime-local"
        onChange={handleChange}
        defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}/>
    </form>
  </div>

const EditNotes = ({notes, handleChange, classes, style}) => {
  return(
       <TextField 
          id="notes" type="notes" label="notes" className={classes.textField}  style={style || {}}
          value={notes} 
          onChange={handleChange} margin="normal"/>
    )
}

EditNotes.defaultProps = {
}










export default EnterGeneralValues;