import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import { Checkbox } from '@material-ui/core';
import { FormControlLabel } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import Typography from '@material-ui/core/Typography'
import { Input } from '@material-ui/core';
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
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
  },
  checkboxFormGroup:{
    width:"130px",
    margin:"10px 0px 0px 0px",
    padding:"5px",
    alignSelf:"center",
    background:grey10(7),
    opacity:0.7
  },
  checkboxContainer:{
    display:"flex",
    justifyContent:"center",
  },
  checkbox:{
    color:grey10(1),
    fontSize:"8px"
  },
  label:{
    color:grey10(1),
    fontSize:"12px",
    opacity:1
  },
}))

export function splitMultilineString(str){
  return str.split("\n");
}

export default function SectionTitleForm({ section, dimns, saveTitle, saveInitials, close }) {
  const [value, setValue] = useState(section)
  const [editing, setEditing] = useState(false);
  const [applyChangesToAllDecks, setApplyChangesToAllDecks] = useState(false);
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
    saveTitle(newTitle, applyChangesToAllDecks)
  }

  const handleInitialsChange = event => { 
    const newInitials = event.target.value;
    if(newInitials.length > 2){
      alert("Sorry, initials can't be more than 2 characters");
      return;
    }
    setValue(prevState => ({ ...prevState, initials:newInitials })) 
    //console.log("calling save", newTitle)
    saveInitials(newInitials);
  }

  const toggleApplyChangesToAllDecks = () => {
    if(!applyChangesToAllDecks){
      //trigger a save so any changes so far go to all decks
      saveTitle(value.title, true);
      saveInitials(value.initials, true);

    }
    setApplyChangesToAllDecks(prevState => !prevState);
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
            <FormGroup className={classes.checkboxFormGroup}>
          <FormControlLabel 
            className={classes.checkboxContainer}
            classes={{
              label: classes.label, // Pass your override css here
            }}
            onChange={toggleApplyChangesToAllDecks}
            control={<Checkbox className={classes.checkbox} checked={applyChangesToAllDecks} />} 
            label="Apply changes to all decks"
          />
        </FormGroup>
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