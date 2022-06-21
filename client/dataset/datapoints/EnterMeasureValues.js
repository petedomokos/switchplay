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
  root:{
    marginTop:theme.spacing(10)
  },
  textContainer:{
    display:'flex',
    justifyContent:'center'
  },
  textField:{
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
  unit:{
    alignSelf:'flex-end',
    marginBottom:"8px"
  }
}))

function EnterMeasureValues({ measures, values, handleChange }) {
  //wrap this with with:Loader fro datasets
  const classes = useStyles()
  return (
      <div className={classes.root}>
          <Typography type="headline" component="h2" className={classes.subtitle}>
          Values
          </Typography>
          {measures.map((measure,i) =>{
              //note - in value, measure is just measure _id ref
              const currentValue = values.find(d => d.measure === measure._id)
              const value = currentValue && currentValue.value ? currentValue.value : "";
              return(
                <div className={classes.textContainer} key={measure.key} >
                    <TextField 
                        id={"value-"+i} label={measure.name} 
                        className={classes.textField} 
                        value={ (value || "")} 
                        onChange={event => handleChange(event, measure)} 
                        margin="normal"
                        />
                    <div className={classes.unit}>{measure.unit || ""}</div>
                </div>
              )
          })}
      </div>
  )
}

EnterMeasureValues.defaultProps = {

}

export default withLoader(EnterMeasureValues, ["measures"]);

