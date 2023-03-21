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
  card: {
    width:"100%",
    height:"100%",
    textAlign: 'center',
  },
  cardContent:{
    width:"90%",
    height:"90%",
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    height:"15%",
    margin:"5%",
    color: theme.palette.openTitle,
    fontSize:"18px",
    background:"blue",
    padding:"5px"
  },
  desc:{
    height:"45%",
    margin:"5%",
    padding:"5px",
    fontSize:"10px",
    background:"red",
    overflow:"hidden"
    //overflowY:"scroll" - doesnt work - may be coz of milestoneWrapper?
  },
  textField: {
    //marginLeft: theme.spacing(1),
    //marginRight: theme.spacing(1),
    //width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default function Goal({ goal, submit, error }) {
  //console.log("Goal")
    const classes = useStyles()
    const initState = {
        title: goal.title || "",
        desc:goal.desc || "",
    }
    const [values, setValues] = useState(initState)

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = () => {
        submit(goal);
    }

    return (
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography variant="h2" className={classes.title}>
          {goal.title|| "No Title"}
          </Typography>
          <Typography variant="h6" className={classes.desc} paragraph={true} align="left">
          {goal.desc || mockDesc || "No Description"}
          </Typography>
          {/**<TextField id="username" label="Username" className={classes.textField} value={values.username} onChange={handleChange('username')} margin="normal"/><br/>*/}
          {/**<TextField id="firstname" label="First name" className={classes.textField} value={values.firstname} onChange={handleChange('firstname')} margin="normal"/><br/>*/}
          <br/> 
          {
            error && (<Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {error}</Typography>)
          }
        </CardContent>
        {/**<CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Save</Button>
        </CardActions>*/}
      </Card>
    )
}

Goal.defaultProps = {
    goal:{},
    submit:() => {}
}