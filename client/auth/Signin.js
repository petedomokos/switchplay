import React, { useState, useEffect } from 'react'
import { withRouter, Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { makeStyles } from '@material-ui/core/styles'
import auth from './auth-helper'
import { NAVBAR_HEIGHT } from '../core/websiteConstants'

const useStyles = makeStyles(theme => ({
  signinRoot:{
    paddingTop:"calc(50vh - 150px)",
    height:"120vh"
  },
  card: {
    width:"500px",
    maxWidth:"90%",
    height:"300px",

    margin: "auto",
    textAlign: 'center',
    paddingBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle,
    [theme.breakpoints.down('md')]: {
      //fontSize:"50px"
    }
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      width:"80%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
  },
  resize:{
    [theme.breakpoints.down('md')]: {
      //fontSize:"34px"
    },
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default withRouter(function Signin({ onSignin, serverErrorMesg, location, history }) {
  //console.log("Signin", auth.isAuthenticated())
  const classes = useStyles()
  const [values, setValues] = useState({
      emailOrUsername: '',
      password: '',
      error: ''
  })
  
  if(auth.isAuthenticated()){ return <Redirect to='/'/> }

  useEffect(() => {
    window.scrollTo(0, -NAVBAR_HEIGHT);
  },[]);

  /*useEffect(() => {
    const requiredNode = containerRef.current;
    scrollIntoViewWithOffset(requiredNode, NAVBAR_HEIGHT)
  },[]);*/

  const clickSubmit = () => {
    const user = {
      emailOrUsername: values.emailOrUsername || undefined,
      password: values.password || undefined
    }
    //console.log('loc state', location)
    //get referrer for redirect
    const from  = '/'
    /*const {from} = location.state || {
      from: { pathname: '/' }
    }*/
    onSignin(user, history, from)

  }
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  const serverErrorUserMesg = serverErrorMesg === "Unauthorized" ? "Could not sign you in. Please check your username/email and password." : "";

  return (
    <div className={classes.signinRoot}>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6" className={classes.title}>
            Sign In
          </Typography>
          <TextField 
              id="emailOrUsername" type="emailOrUsername" label="Email Or Username" 
              className={classes.textField} 
              value={values.emailOrUsername} 
              onChange={handleChange('emailOrUsername')} 
              margin="normal"
              InputProps={{
                classes: {
                  input: classes.resize,
                },
              }}
          /><br/>
          <TextField 
              id="password" type="password" label="Password" 
              className={classes.textField} value={values.password} 
              onChange={handleChange('password')} margin="normal"
              InputProps={{
                classes: {
                  input: classes.resize,
                },
              }}
          />
          <br/> {
            values.error && 
              <Typography component="p" color="error">
                <Icon color="error" className={classes.error}>error</Icon>
                {values.error}
              </Typography>
          }
          {
            serverErrorMesg &&
              <Typography component="p" color="error" variant="subtitle2" >
                <Icon color="error" className={classes.error}></Icon>
                {serverErrorUserMesg}
              </Typography>
          }
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
        </CardActions>
      </Card>
    </div>
  )
})
