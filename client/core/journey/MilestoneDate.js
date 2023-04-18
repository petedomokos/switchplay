import React, { useState, useEffect } from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import SelectDate from "../../util/SelectDate";

/*
const useStyles = makeStyles(theme => ({
  root: {
    width:"100%",
    height:"100%",
    textAlign: 'center',
    display:"flex",
    flexDirection:"column",
    //alignItems:"center",
    background:"none",
  }
}))
*/


export default function MilestoneDate({ date, startDate, handleDateChange, handleCancelForm, handleSaveForm, classes, hasChanged, shouldAutosaveForm }) {
  //const classes = useStyles(styleProps);
  const defaultName = nr => nr < 0 ? `Past ${-nr}` : (nr > 0 ? `Future ${nr}` : "Current")

  const handleChange = event => { 
    const newEditing = { ...editing, value:event.target.value };
    setEditing(newEditing) 
  }
  const openTitleForm = () => { 
    if(!editable){ return; }
    setEditing({ milestoneId:id, key:"title", value:title }) 
  }
  const openDescForm = () => { 
    if(!editable){ return; }
    setEditing({ milestoneId:id, key:"desc", value:desc }) 
  }

  return (
    <>
        <SelectDate
            classes={classes}
            withLabel="Start Date"
            dateFormat="YYYY-MM-DD"
            type="date"
            defaultValue={startDate}
            handleChange={handleDateChange("startDate")}/>
        <SelectDate
            classes={classes}
            withLabel="Target Date"
            dateFormat="YYYY-MM-DD"
            type="date"
            defaultValue={date}
            handleChange={handleDateChange("date")}/>

        {hasChanged && !shouldAutosaveForm &&
        <div className={classes.formCtrls}>
            <Button color="primary" variant="contained" onClick={handleCancelForm} className={classes.cancel}>Cancel</Button>
            <Button color="primary" variant="contained" onClick={handleSaveForm} className={classes.submit}>Save</Button>
        </div>}
     
    </>
  )
}

MilestoneDate.defaultProps = {
}