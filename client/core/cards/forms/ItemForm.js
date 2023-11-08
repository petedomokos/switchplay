import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import { Checkbox } from '@material-ui/core';
import { FormControlLabel } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Input } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { makeStyles } from '@material-ui/core/styles'
import { grey10, COLOURS } from '../constants';
import VideoPlayer from "../../VideoPlayer"

const mockDesc = " ewiof efojjew fewfjew xxxx xccxx eiofj efj fewiof efojjew fewfjew xxxx xccxx eiofj efj fw fefjw efoe wfe fjf ewof oef hhhhhhhh kjdlkd dj uhd dhud dud d houh zzzz zz zz"

const useStyles = makeStyles(theme => ({
  root: {
    pointerEvents:"all",
    width:props => props.width - 40,
    height:props => props.height,
    padding:"30px 20px 10px 20px",
    textAlign:'center',
    display:"flex",
    flexDirection:"column",
    alignItems:"flex-start",
    background:COLOURS.CARDS_TABLE,
  },
  backBtn:{
    width:"50px",
    height:"40px",
    padding:"5px",
  },
  backBtnIcon:{
    color:"white"
  },
  sectionAndCardTitle:{
    display:"flex",
    margin:"20px"
  },
  sectionTitle:{
    margin:"0px 15px 0px 0px",
    color:grey10(3),
  },
  cardTitle:{
    margin:"0px", //if not section, we want this aligned at start, so no marginLeft
    color:grey10(5),
  },
  itemTitle:{
    margin:"10px 20px",
    color:grey10(5),
  },
  form:{
    width:"calc(100% - 40px)",
    height:"40px",
    margin:"0px 20px 10px 20px",
  },
  input:{
    width:"100%",
    height:"40px",
    marginBottom:"10px",
    padding:"0px 5px",
    fontSize:"10px",
    overflow:"hidden",
    //cursor:"pointer",
    pointerEvents:"all",
    fontSize:props => props.fontSize,
    background:"transparent",
    color:"white",
    border:"solid",
    borderWidth:"thin",
    borderColor:grey10(7)
  },
  checkboxFormGroup:{
    margin:"20px 0px 0px 0px",
    alignSelf:"center"
  },
  checkbox:{
    color:grey10(5)
  },
  checkboxLabel:{
    color:grey10(6)
  },
  attachments:{
    margin:"20px",
  },
  attachment:{
  },
  closeBtn:{
    width:"80px",
    height:"30px",
    margin:"10px",
    alignSelf:"center"
  }
}))

export function splitMultilineString(str){
  return str.split("\n");
}

export default function ItemForm({ cardTitle, item, dimns, fontSize, save, close }) {
  const { title, section } = item;

  const [value, setValue] = useState(item)
  const [editing, setEditing] = useState(false);
  const [applyChangesToAllDecks, setApplyChangesToAllDecks] = useState(false);
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    fontSize,
    ...dimns
  }
  const classes = useStyles(styleProps);

  //issue - we want dialog to ask if apply to all, but this would get called on first char change
  //so need to move saving to end, OR forget dialogs, instead, have a toggle next to the name
  //even if user doesnt toggle until end, 
  //as long as we call an additonal save when they toggle, it will still apply to all decks and so the 
  //others will "catch up" with the changes on that save
  const handleChange = event => { 
    const newTitle = event.target.value;
    setValue(prevState => ({ ...prevState, title:newTitle })) 
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
  useEffect(() => { d3.timeout(() => { setEditing(true) }, 1) }, [])

  const includesVideo = title.includes("Video") || title.includes("Video");
  const attachments = includesVideo ? [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] : [];

  return (
    <div className={classes.root} onClick={e => { e.stopPropagation() }}>
      <div className={classes.backBtn} onClick={close}>
      <IconButton aria-label="add-datapoint" color="primary">
        <ArrowBackIcon className={classes.backBtnIcon} />
      </IconButton>
      </div>
      
      <div className={classes.sectionAndCardTitle}>
        {section && <p className={classes.sectionTitle}>{section.title}</p>}
        <p className={classes.cardTitle}>{cardTitle || `Card ${value.cardNr+1}`}</p>
      </div>
      <p className={classes.itemTitle}>Item {value.itemNr}</p>
      <form className={classes.form}>
        {editing && 
          <Input
            id="desc" onChange={handleChange} margin="dense" autoFocus className={classes.input}
            disableUnderline defaultValue={value.title} placeholder="Enter Title..."
          />}
      </form>
      <div className={classes.attachments}>
        {attachments.map(att => 
          <div className={classes.attachment} key={att.key} >
            {att.type === "video" &&
              <VideoPlayer link={att.link} height={100} />
            }
          </div>
        )}
      </div>
      <FormGroup className={classes.checkboxFormGroup}>
        <FormControlLabel 
          className={classes.checkboxLabel} 
          onChange={toggleApplyChangesToAllDecks}
          control={<Checkbox className={classes.checkbox} checked={applyChangesToAllDecks} />} label="Apply changes to all decks"
        />
      </FormGroup>
      <Button color="primary" variant="contained" onClick={close} className={classes.closeBtn}>Done</Button>
    </div>
  )
}

ItemForm.defaultProps = {
  step:{ desc:"" },
  fontSize:"11px"
}