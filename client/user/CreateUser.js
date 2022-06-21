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
import {Link} from 'react-router-dom'
import auth from '../auth/auth-helper'

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

export default function CreateUser({ user, creating, error, open, submit, closeDialog }) {
    const classes = useStyles()
    const initState = {
        username: '',
        firstname:'',
        surname:'',
        initials:'', //max 5 chars
        password: '',
        email: '',
        //the signed in user is added to admin (if a user is signed in)
        admin: user && user._id ? [user._id] : []
    }
    const [values, setValues] = useState(initState)
    //useEffect to reset dialog and error when unmounting (in case user moves away from component)
    //if this doesnt work, we can always reset in useEffcet itself if need be, although thats a bit wierd
    useEffect(() => {
      return () => {
        //we dont have access to open prop anymore, so just always close Dialog
        const path = user._id ? 'createUser' :'signup'
        closeDialog(path);
      };
    }, []); // will only apply once, not resetting the dialog at teh end of every render eg re-renders

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = () => {
      if(values.initials.length >= 6){
        alert('User initials must be 5 characters or less.')
      }else{
        const user = {
        username: values.username || undefined,
        firstname: values.firstname || undefined,
        surname: values.surname || undefined,
        initials: values.initials || undefined,
        email: values.email || undefined,
        password: values.password || undefined,
        admin: values.admin || undefined
        };
        submit(user);
      }
    }

    const reset = () =>{
      //console.log('reset-------')
        closeDialog();
        setValues(initState)
    }

    //get group once it has been saved to store (unless thre was error)
    //warning - todo - username should be unique
    //this will only be uses for non-signed in users created
    const savedUser = user.loadedUsers.find(us => us.username === values.username);

    return (<div>
      <Card className={classes.card}>
        <CardContent>
          <Typography variant="h6" className={classes.title}>
          {auth.isAuthenticated() ? 'Create user' : 'Sign Up'}
          </Typography>
          <TextField id="username" label="Username" className={classes.textField} value={values.username} onChange={handleChange('username')} margin="normal"/><br/>
          <TextField id="firstname" label="First name" className={classes.textField} value={values.firstname} onChange={handleChange('firstname')} margin="normal"/><br/>
          <TextField id="surname" label="Surname" className={classes.textField} value={values.surname} onChange={handleChange('surname')} margin="normal"/><br/>
          <TextField id="initials" label="Initials (max 5)" className={classes.textField} value={values.initials} onChange={handleChange('initials')} margin="normal"/><br/>
          <TextField id="email" type="email" label="Email" className={classes.textField} value={values.email} onChange={handleChange('email')} margin="normal"/><br/>
          <TextField id="password" type="password" label="Password" className={classes.textField} value={values.password} onChange={handleChange('password')} margin="normal"/>
          <br/> {
            values.error && (<Typography component="p" color="error">
              <Icon color="error" className={classes.error}>error</Icon>
              {values.error}</Typography>)
          }
        </CardContent>
        <CardActions>
          <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
        </CardActions>
      </Card>
      <Dialog open={open} disableBackdropClick={true}>
        <DialogTitle>New Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            New account successfully created.
          </DialogContentText>
        </DialogContent>
        {auth.isAuthenticated() ?
            <DialogActions>
                <Button onClick={reset} color="primary" autoFocus="autoFocus" variant="contained">
                Create another
                </Button>
                {savedUser && <Link to={"/user/"+savedUser._id} >
                  <Button color="primary" autoFocus="autoFocus" variant="contained">
                  Go to user
                  </Button>
                </Link>}
                <Link to="/">
                    <Button color="primary" autoFocus="autoFocus" variant="contained">
                    Return home
                    </Button>
                </Link>
            </DialogActions>
            :
            <DialogActions>
                <Link to="/signin">
                    <Button color="primary" autoFocus="autoFocus" variant="contained">
                    Sign In
                    </Button>
                </Link>
            </DialogActions>
        }
      </Dialog>
    </div>
    )
}

CreateUser.defaultProps = {
  open:false
}