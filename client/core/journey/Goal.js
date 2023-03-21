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

const mockDesc = " ewiof efojjew fewfjew xxxx xccxx eiofj efj fw fefjw ---- -- efoe wfe fjf ewof oef hhhhhhhh kjdlkd djd  ..... ... .. .. . . uhd dhud dud d houh zzzz zz zz"

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
    background:"pink",
    //paddingBottom:0,
    display:"flex",
    flexDirection:"column",
    alignItems:"center"
  },
  titleContainer:{
    background:"yellow",
    width:"85%",
    height:"45px",
    margin:0,
    marginBottom:"5px",
    display:"flex",
    justifyContent:"center",
    alignItems:"center"
  },
  descContainer:{
    border:"solid",
    borderWidth:"thin",
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
    background:"red",
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
    background:"orange",
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

export default function Goal({ goal, submit, error }) {
  //console.log("Goal")
    const classes = useStyles()
    const initState = {
        title: goal.title || "",
        desc:goal.desc || "",
    }
    const [values, setValues] = useState(initState)
    const [editing, setEditing] = useState("")

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = () => {
      //todo next - add title and desc to profile, and wire submit up so it saves title
      //then do desc textfield and wire it up
        submit(goal);
    }

    const openTitleForm = () => { setEditing("title") }

    return (
      <div className={classes.root}>
        <div className={classes.cardContent}>
          <div className={classes.titleContainer}>
            {editing === "title" ? 
              <TextField 
              id="title" label={values.title ? "" : "Enter title"} className={classes.titleTextField} autoFocus
              InputLabelProps={{shrink: values.title ? false : true}}
              value={values.title} onChange={handleChange('title')} margin="dense"/>
              :
              <Typography variant="h2" className={classes.title} onClick={openTitleForm}>
              {goal.title|| "No Title"}
              </Typography>
            }
          </div>
          <div className={classes.descContainer}>
            {editing === "desc" ?
              <TextField 
              id="desc" label="Description" className={classes.descTextField} 
              value={values.desc} onChange={handleChange('desc')} margin="normal"/>
              :
              <Typography variant="h6" className={classes.desc} paragraph={true} align="left" onClick={openTitleForm}>
              {goal.desc || mockDesc || "No Description"}
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
    goal:{},
    submit:() => {}
}