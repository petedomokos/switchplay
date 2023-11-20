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
import { TrainRounded } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: {
    position:"absolute",
    left:props => props.left,
    top:props => props.top,
    width:"180px",
    height:props => props.height,
    paddingTop:"3px",
    paddingBottom:"3px",
    textAlign: 'center',
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    //alignItems:"center",
    background:"white",
    pointerEvents:"all",
  },
  content:{
    padding:"0px",
    paddingTop:"5px",
    margin:"0px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center"
  },
  actions:{
  },
  dateContainer:{
      marginTop:"7.5px",
      marginBottom:"7.5px"
  },
  title: {
      
  },
  more:{
      fontSize:"10px",
      marginTop:"10px",
  },
  formCtrls:{
    marginTop:"5px",
    display:"flex",
    justifyContent:"center"
  },
  submit:{
    width:"60px",
    margin:"5px",
    fontSize:"12px",
    opacity:props => props.submitBtnOpacity
  },
  cancel:{
    width:"60px",
    margin:"5px",
    fontSize:"12px"
  },
}))


export default function CardDateForm({ title, date, startDate, handleDateChange, handleCancelForm, handleSave, hasChanged, shouldAutosaveForm, editable, styles, dimns }) {
    //console.log("dimns", dimns)
    const styleProps = { ...styles, ...dimns, height:`${startDate ? 200 : 140}px`, submitBtnOpacity:hasChanged ? 1 : 0.5 }
    const classes = useStyles(styleProps);
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
        <Card className={classes.root} elevation={4} onClick={e => { e.stopPropagation() }}>
        <CardContent className={classes.content}>
            {title && <Typography variant="h6" className={classes.title}>{title} </Typography>}
            {startDate && 
                <SelectDate
                    classes={classes}
                    withLabel="Start Date"
                    dateFormat="YYYY-MM-DD"
                    type="date"
                    defaultValue={startDate}
                    handleChange={handleDateChange("startDate")}
                />
            }
            <SelectDate
                classes={classes}
                withLabel="Target Date"
                dateFormat="YYYY-MM-DD"
                type="date"
                defaultValue={date}
                handleChange={handleDateChange("date")}
            />
          
        </CardContent>
        <CardActions className={classes.actions}>
            <div className={classes.formCtrls}>
                <Button color="primary" variant="contained" onClick={handleCancelForm} className={classes.cancel}>Cancel</Button>
                {!shouldAutosaveForm &&
                    <Button color="primary" variant="contained" onClick={handleSave} className={classes.submit}>Save</Button>
                }
            </div>
        </CardActions>
    </Card>
    )
}

CardDateForm.defaultProps = {
  date:new Date(),
  handleDateChange:() => {}, 
  handleCancelForm:() => {}, 
  handleSave:() => {},  
  classes:{}, 
  hasChanged:false, 
  shouldAutosaveForm:false,
  editable:true,
  dimns:{ left:0, top:0 },
  styles:{}
}