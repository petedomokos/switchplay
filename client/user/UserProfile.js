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
import DeleteUserContainer from './containers/DeleteUserContainer'
import auth from '../auth/auth-helper'
import { Link } from 'react-router-dom'
import { SurroundSoundSharp } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    [theme.breakpoints.down('sm')]: {
      width:"80vw",
      alignSelf:"center"
    },
    [theme.breakpoints.up('lg')]: {
      width:"300px"
    },
    //flex:"100px 0 0",
    //margin: 'auto',
    padding: theme.spacing(3),
    margin: theme.spacing(2) + "px 0px"
  }),
  title: {
    marginTop: theme.spacing(3),
    color: theme.palette.protectedTitle
  }
}))

export default function UserProfile({ profile, withTitle }) {
  //console.log('profile', profile)
  const { _id, username, firstname, surname, email, created, admin } = profile;
  const classes = useStyles()
  const jwt = auth.isAuthenticated();
  const userHasAdminAuth =  jwt && (jwt.user._id === _id || admin.find(user => user._id === jwt.user._id));
  return (
      <Paper className={classes.root} elevation={4}>
      {withTitle && <Typography variant="h6" className={classes.title}>
          Player
        </Typography>}
        <List dense>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <Person/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={username} secondary={firstname + ' ' +surname}/>
            {userHasAdminAuth &&
              (<ListItemSecondaryAction>
                <Link to={"/user/edit/" + _id} >
                  <IconButton aria-label="Edit" color="primary">
                    <Edit/>
                  </IconButton>
                </Link>
                <DeleteUserContainer userId={_id}/>
              </ListItemSecondaryAction>)
            }
          </ListItem>
          <Divider/>
          <ListItem>
            <ListItemText primary={created ? "Joined: " + (new Date(created)).toDateString() : ''}/>
          </ListItem>
        </List>
      </Paper>
    )
}

UserProfile.defaultProps = {
  profile: {
    _id:'',
    username:'',
    firstname:'',
    surname:'',
    email:'',
    admin:[]
  },
}