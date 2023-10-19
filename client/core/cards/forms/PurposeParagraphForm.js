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

const useStyles = makeStyles(theme => ({
  formRoot: {
    position:"absolute",
    left:props => props.left,
    top:props => props.top,
    width:props => props.width,
    height:props => props.height,
    pointerEvents:"all",
    background:COLOURS.CARDS_TABLE,
    display:"flex",
    alignItems:"flex-start"
  },
  form:{
    display:"flex",
    alignItems:"flex-start"
  },
  input:{
    width:props => props.width,
    height:props => props.height,
    margin:0,
    color:grey10(4),
    fontSize:props => props.fontSize,
    overflow:"hidden",
    //cursor:"pointer",
    pointerEvents:"all",
    fontFamily: "Avant Garde",
    fontStyle:"italic",
    display:"flex",
    alignItems:"flex-start"

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

export default function PurposeParagraphForm({ deck, paraD, dimns, save, close }) {
  const [value, setValue] = useState(paraD)
  const [editing, setEditing] = useState(false);
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    ...dimns,
  }
  const classes = useStyles(styleProps);

  const handleChange = event => { 
    const newText = event.target.value;
    setValue(prevState => ({ ...prevState, text:newText })) 
    save(newText, paraD.i)
  }

  //this is a fix to esure autoFocus is triggered
  useEffect(() => { d3.timeout(() => { setEditing(true); }, 1) }, [])

  return (
    <div className={classes.formRoot} onClick={e => { e.stopPropagation() }}>
      {<form className={classes.form}>
        {editing && 
          <Input
            id="desc" onChange={handleChange} margin="dense" autoFocus className={classes.input}
            disableUnderline defaultValue={value.text} placeholder={paraD.placeholder}
            multiline={true}
          />
        }
      </form>}
    </div>
  )
}

PurposeParagraphForm.defaultProps = {
  dimns:{}
}