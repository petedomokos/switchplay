import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Checkbox } from '@material-ui/core';
import { FormControlLabel } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
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
    pointerEvents:"all",
  },
  form:{
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

export default function CardTitleForm({ deck, cardD, dimns, save, close }) {
  const [value, setValue] = useState(cardD)
  //console.log("CardTitleForm", cardD)
  const [editing, setEditing] = useState(false);
  const [applyChangesToAllDecks, setApplyChangesToAllDecks] = useState(false);
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    ...dimns,
    background:COLOURS.CARD.FILL(cardD),
  }
  const classes = useStyles(styleProps);

  const handleChange = event => { 
    const newTitle = event.target.value;
    setValue(prevState => ({ ...prevState, title:newTitle })) 
    //console.log("calling save", newTitle)
    save(newTitle, applyChangesToAllDecks)
  }

  const toggleApplyChangesToAllDecks = () => {
    if(!applyChangesToAllDecks){
      //trigger a save so any changes so far go to all decks
      save(value.title, true)
    }
    setApplyChangesToAllDecks(prevState => !prevState);
  }

  //this is a fix to esure autoFocus is triggered
  useEffect(() => { d3.timeout(() => { setEditing(true); }, 1) }, [])

  return (
    <div className={classes.root} onClick={e => { e.stopPropagation() }}>
      <form className={classes.form}>
        {editing && 
          <Input
            id="desc" onChange={handleChange} margin="dense" autoFocus className={classes.input}
            disableUnderline defaultValue={value.title} placeholder="Enter Title..."
          />
        }
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
      </form>
    </div>
  )
}

CardTitleForm.defaultProps = {
  dimns:{}
}