import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Input } from '@material-ui/core';
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const mockDesc = " ewiof efojjew fewfjew xxxx xccxx eiofj efj fewiof efojjew fewfjew xxxx xccxx eiofj efj fw fefjw efoe wfe fjf ewof oef hhhhhhhh kjdlkd dj uhd dhud dud d houh zzzz zz zz"

const useStyles = makeStyles(theme => ({
  root: {
    width:"100%",
    height:"100%",
    textAlign:'center',
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    background:"none",
  },
  input:{
    width:"100%",
    height:"100%",
    margin:0,
    paddingTop:"5%",//"2.5% 5% 2.5% 5%",
    padding:0,//"3px 5px 3px 5px",
    fontSize:"10px",
    overflow:"hidden",
    //cursor:"pointer",
    pointerEvents:"all",
    fontSize:props => props.fontSize,
    background:"white"
  }
}))

export function splitMultilineString(str){
  return str.split("\n");
}

export default function StepForm({ step, fontSize, save }) {
  //console.log("StepForm")
  const { _id, desc="Step 1" } = step;
  const [value, setValue] = useState(desc)
  const [editing, setEditing] = useState(false);
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    fontSize
  }
  const classes = useStyles(styleProps);

  const handleChange = event => { 
    const newValue = event.target.value;
    setValue(newValue) 
    save(newValue)
  }

  //this is a fix to esure autoFocus is triggered
  useEffect(() => { d3.timeout(() => { setEditing(true) }, 1) }, [])

  return (
    <form className={classes.root}>
      {editing && 
        <Input
          id="desc" onChange={handleChange} margin="dense" autoFocus className={classes.input}
          disableUnderline defaultValue={value}
        />}
    </form>
  )
}

StepForm.defaultProps = {
  step:{},
  fontSize:"11px"
}