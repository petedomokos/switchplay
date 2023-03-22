import React, { useState, useEffect } from 'react'
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

const mockDesc = " ewiof efojjew fewfjew xxxx xccxx eiofj efj fewiof efojjew fewfjew xxxx xccxx eiofj efj fw fefjw efoe wfe fjf ewof oef hhhhhhhh kjdlkd dj uhd dhud dud d houh zzzz zz zz"

const useStyles = makeStyles(theme => ({
  root: {
    width:"100%",
    height:"100%",
    textAlign: 'center',
    display:"flex",
    flexDirection:"column",
    alignItems:"center",
    background:"none"
  },
  cardContent:{
    width:"100%",
    height:"calc(100% - 45px)",
    marginTop:"5%",
    display:"flex",
    flexDirection:"column",
    alignItems:"center"
  },
  titleContainer:{
    //background:"yellow",
    width:"85%",
    height:"45px",
    margin:0,
    marginBottom:"5px",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },
  descContainer:{
    //border:"solid",
    //borderWidth:"thin",
    width:"85%",
    height:"calc(100% - 45px)",
    margin:0
  },
  title: {
    width:"100%",
    height:"90%",
    display:"flex",
    justifyContent:"center",
    alignItems:"center",
    margin:"0 5% 2.5% 5%",
    //color: theme.palette.openTitle,
    fontSize:"18px",
    padding:"3px 5px 3px 5px",
    cursor:"pointer",
    pointerEvents:"all"
  },
  titleTextField: {
    //marginLeft: theme.spacing(1),
    //marginRight: theme.spacing(1),
    height:"100%",
    margin:"0 5% 0% 5%",
    //color: "aqua",//theme.palette.openTitle,
    fontSize:"18px",
    padding:"0px 5px 0px 5px",
    //cursor:"pointer",
    pointerEvents:"all"
  },
  desc:{
    height:"90%",
    margin:0,//"5% 5% 2.5% 5%",
    padding:"3px 5px 3px 5px",
    fontSize:"10px",
    //background:"red",
    overflow:"hidden",
    cursor:"pointer",
    pointerEvents:"all"
    //overflowY:"scroll" - doesnt work - may be coz of milestoneWrapper?
  },
  descTextField:{
    height:"90%",
    margin:0,//"2.5% 5% 2.5% 5%",
    padding:"3px 5px 3px 5px",
    fontSize:"10px",
    //background:"orange",
    overflow:"hidden",
    //cursor:"pointer",
    pointerEvents:"all"
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
}))

export default function Goal({ milestone, error, editing, setEditing }) {
  const { id, nr, title="", desc="" } = milestone;
  if(id === "current"){
    //console.log("Goal", editing)
  }
  const classes = useStyles();

  const defaultName = nr => nr < 0 ? `Past ${-nr}` : (nr > 0 ? `Future ${nr}` : "Current")

  const handleChange = event => { 
    const newEditing = { ...editing, value:event.target.value };
    setEditing(newEditing) 
  }
  const openTitleForm = () => { setEditing({ milestoneId:id, key:"title", value:title }) }
  const openDescForm = () => { setEditing({ milestoneId:id, key:"desc", value:desc }) }

  return (
    <div className={classes.root}>
      <div className={classes.cardContent}>
        <div className={classes.titleContainer}>
          {editing?.key === "title" ? 
            <TextField 
            id="title" label={editing.value ? "" : "Enter title"} className={classes.titleTextField} autoFocus
            InputLabelProps={{shrink: editing.value ? false : true}}
            value={editing.value} onChange={handleChange} margin="dense"/>
            :
            <Typography variant="h2" className={classes.title} onClick={openTitleForm}>
            {title|| defaultName(nr)}
            </Typography>
          }
        </div>
        <div className={classes.descContainer}>
          {editing?.key === "desc" ?
            <TextField 
            id="desc" label={editing.value ? "" : "Description"} className={classes.descTextField} 
            value={editing.value} onChange={handleChange} margin="normal"/>
            :
            <Typography variant="h6" className={classes.desc} paragraph={true} align="left" onClick={openDescForm}>
            {desc || mockDesc || "No Description"}
            </Typography>
          }
        </div>
        {
          error && (<Typography component="p" color="error">
            <Icon color="error" className={classes.error}>error</Icon>
            {error}</Typography>)
        }
      </div>
      {/**<Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Save</Button>*/}
    </div>
  )
}

Goal.defaultProps = {
    milestone:{},
    editing:null,
    submit:() => {}
}