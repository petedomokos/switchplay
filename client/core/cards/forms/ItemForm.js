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
  sectionTitle:{
    margin:"15px 0px 10px 0px",
    color:grey10(3),
  },
  cardAndItemTitle:{
    display:"flex",
  },
  cardTitle:{
    margin:"10px 10px 10px 0px",
    color:grey10(5),
  },
  itemTitle:{
    margin:"10px 5px 10px 0px",
    color:grey10(5),
  },
  form:{
    width:"100%",
    height:"40px",
  },
  input:{
    width:"100%",
    height:"40px",
    margin:0,
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
  attachments:{

  },
  attachment:{
  },
  closeBtn:{
    width:"80px",
    height:"30px",
    margin:"20px",
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
  //const descLines = desc ? splitMultilineString(desc) : ["No Desc"];
  const styleProps = {
    fontSize,
    ...dimns
  }
  const classes = useStyles(styleProps);

  const handleChange = event => { 
    const newTitle = event.target.value;
    setValue(prevState => ({ ...prevState, title:newTitle })) 
    save(newTitle)
  }

  //this is a fix to esure autoFocus is triggered
  useEffect(() => { d3.timeout(() => { setEditing(true) }, 1) }, [])

  const includesVideo = title.includes("Video") || title.includes("Video");
  const attachments = includesVideo ? [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] : [];

  return (
    <div className={classes.root} onClick={e => { e.stopPropagation() }}>
      {section && <p className={classes.sectionTitle}>{section.title}</p>}
      <div className={classes.cardAndItemTitle}>
        <p className={classes.cardTitle}>{cardTitle || `Card ${value.cardNr+1}`}</p>
        <p className={classes.itemTitle}>Item {value.itemNr+1}</p>
      </div>
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
              <VideoPlayer link={att.link} height={150} />
            }
          </div>
        )}
      </div>
      <Button color="primary" variant="contained" onClick={close} className={classes.closeBtn}>Done</Button>
    </div>
  )
}

ItemForm.defaultProps = {
  step:{ desc:"" },
  fontSize:"11px"
}