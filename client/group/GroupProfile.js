import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import Edit from '@material-ui/icons/Edit'
import Person from '@material-ui/icons/Person'
import Divider from '@material-ui/core/Divider'
import DeleteGroupContainer from './containers/DeleteGroupContainer'
import auth from '../auth/auth-helper'
import { Link } from 'react-router-dom'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    //minWidth:300,
    //maxWidth: 600,
    width:300,
    height:150,
    //margin: 'auto',
    padding: theme.spacing(3),
    marginTop: theme.spacing(2),
  }),
  title: {
    marginTop: theme.spacing(3),
    color: theme.palette.protectedTitle
  }
}))
 
export default function GroupProfile({profile}) {
  console.log('profile', profile)
  const { _id, name, desc, type, admin, created } = profile;
  const classes = useStyles()
  const jwt = auth.isAuthenticated()
  //note - it is possible that group may have been fully loaded, in which case
  //arrays like admin will not just be id but will be an object. 
  //Therefore, we handle both cases.
  //admin could be either flat or object from (if comes thrroguh Group, it will be object form)
  const adminIds = admin[0] && typeof admin[0] != 'string' ? 
    admin.map(user => user._id) : admin
  const userHasAdminAuth = jwt && adminIds.includes(jwt.user._id);

    return (
      <Paper className={classes.root} elevation={4}>
        <Typography variant="h6" className={classes.title}>
          Group
        </Typography>
        <List dense>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Person/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={name} secondary={type}/>
            {userHasAdminAuth &&
              (<ListItemSecondaryAction>
                <Link to={"/group/edit/" + _id}>
                  <IconButton aria-label="Edit" color="primary">
                    <Edit/>
              </IconButton>
                </Link>
                <DeleteGroupContainer groupId={_id} />
              </ListItemSecondaryAction>)
            }
          </ListItem>
          <Divider/>
          <ListItem>
            <ListItemText primary={"Created: " + (
              new Date(created)).toDateString()}/>
          </ListItem>
        </List>
      </Paper>
    )
  }

  
GroupProfile.defaultProps = {
  profile: {
    _id:'',
    name:'',
    desc:'',
    surname:'',
    admin:[]
  }
}