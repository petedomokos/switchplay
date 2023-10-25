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
import { grey10, COLOURS } from '../constants';

const mockDesc = " ewiof efojjew fewfjew xxxx xccxx eiofj efj fewiof efojjew fewfjew xxxx xccxx eiofj efj fw fefjw efoe wfe fjf ewof oef hhhhhhhh kjdlkd dj uhd dhud dud d houh zzzz zz zz"

const useStyles = makeStyles(theme => ({
  root: {
    position:"absolute",
    left:props => props.left,
    top:props => props.top,
    width:props => props.width,
    height:props => props.height,
    pointerEvents:"all"
  },
  form:{
  },
  textfield:{
    marginTop:"5px"
  },
  input:{
    width:props => props.width,
    height:props => props.height,
    margin:0,
    color:grey10(7),
    fontSize:props => props.fontSize,
    overflow:"hidden",
    //cursor:"pointer",
    pointerEvents:"all",
    background:props => props.background,
    border:"solid",
  },
  label:{
    //color:"white"
  },
  closeBtn:{
    width:"80px",
    height:"30px",
    margin:"20px"
  }
}))

export function splitMultilineString(str){
  return str.split("\n");
}

export default function SectionTitleForm({ section, dimns, saveTitle, saveInitials, close }) {
  const [value, setValue] = useState(section)
  //console.log("SectionTitleForm", section)
  const [editing, setEditing] = useState(false);
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    ...dimns,
    background:COLOURS.DECK.HEADER.BG,
  }
  const classes = useStyles(styleProps);

  const handleTitleChange = event => { 
    const newTitle = event.target.value;
    setValue(prevState => ({ ...prevState, title:newTitle })) 
    //console.log("calling save", newTitle)
    saveTitle(newTitle)
  }

  const handleInitialsChange = event => { 
    const newInitials = event.target.value;
    if(newInitials.length > 2){
      alert("Sorry, initials can't be more than 2 characters");
      return;
    }
    setValue(prevState => ({ ...prevState, initials:newInitials })) 
    //console.log("calling save", newTitle)
    saveInitials(newInitials)
  }

  //this is a fix to esure autoFocus is triggered
  useEffect(() => { d3.timeout(() => { setEditing(true); }, 1) }, [])

  return (
    <div className={classes.root} onClick={e => { e.stopPropagation() }}>
      {<form className={classes.form}>
        {editing && 
          <>
            <Input
              id="desc" onChange={handleTitleChange} margin="dense" autoFocus className={classes.input}
              disableUnderline defaultValue={value.title} placeholder="Enter Title..."
            />
            <TextField 
                id="initials" label="Initials" 
                onChange={handleInitialsChange} margin="dense" className={classes.textfield}
                defaultValue={value.initials}
                InputProps={{
                  className: classes.input
                }}
                InputLabelProps={{
                  className:classes.label
                }}
            />
          </>
        }
      </form>}
    </div>
  )
}

SectionTitleForm.defaultProps = {
  dimns:{},
  section:{}
}