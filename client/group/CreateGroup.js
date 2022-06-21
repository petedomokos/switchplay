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
import { withLoader } from '../util/HOCs';

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

export default withLoader(function CreateGroup({ user, creating, error, success, open, submit, closeDialog }) {
  const classes = useStyles()
  const initState = {
      parent:'',
      name: '', //must be unique to this user
      initials:'', //max 5 chars
      desc:'',
      groupType:'',
      admin:[user._id]
  }
  const [values, setValues] = useState(initState)

  //useEffect to reset dialog and error when unmounting (in case user moves away from component)
  //if this doesnt work, we can always reset in useEffcet itself if need be, although thats a bit wierd
  useEffect(() => {
    //note - if we check open here, it gives false, dont know why, so we just closeDialog always.
    return () => {
        closeDialog();
      //if(error || success){
        //resetAsyncProcesses
     // }
    };
  }, []); // will only apply once, not resetting the dialog at teh end of every render eg re-renders

  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  const clickSubmit = () => {
    if(user.administeredGroups.find(grp => grp.name === values.name)){
      alert('You already have a group with this name.')
    }
    else if(values.initials.length >= 6){
      alert('Group initials must be 5 characters or less.')
    }
    else{
      //validate name is unique 
      const group = {
        parent: values.parent || undefined,
        name: values.name || undefined, //must be unique to this user
        initials: values.initials || undefined,
        desc: values.desc || undefined,
        groupType: values.groupType || undefined,
        admin:values.admin || [user._id]
      };

      submit(group);
    }
  }

  const reset = () =>{
    //console.log('reset-------')
      closeDialog();
      setValues(initState)
  }
  //get group once it has been saved to store (unless thre was error)
  const savedGroup = user.loadedGroups.find(grp => grp.name === values.name);

  return (<div>
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Create Group
        </Typography>
        <TextField id="name" label="name" className={classes.textField} value={values.name} onChange={handleChange('name')} margin="normal"/><br/>
        <TextField id="initials" label="Initials (max 5)" className={classes.textField} value={values.initials} onChange={handleChange('initials')} margin="normal"/><br/>
        <TextField id="desc" label="Description" className={classes.textField} value={values.desc} onChange={handleChange('desc')} margin="normal"/><br/>
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
      <DialogTitle>New Group</DialogTitle>
      <DialogContent>
        <DialogContentText>
          New group successfully created.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={reset} color="primary" autoFocus="autoFocus" variant="contained">
        Create another
        </Button>
        {savedGroup && <Link to={"/group/"+savedGroup._id} >
            <Button color="primary" autoFocus="autoFocus" variant="contained">
            Go to group
            </Button>
      </Link>}
        <Link to={"/"} >
            <Button color="primary" autoFocus="autoFocus" variant="contained">
            Return home
            </Button>
        </Link>
      </DialogActions>
    </Dialog>
  </div>
  )
},['user'])