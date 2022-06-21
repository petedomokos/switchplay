import React, {useState, useEffect} from 'react'
import { makeStyles } from '@material-ui/core/styles'
import {Link} from 'react-router-dom'
import SimpleList from '../util/SimpleList'
import { withLoader } from '../util/HOCs';
import IconButton from '@material-ui/core/IconButton'
import PersonAddIcon from '@material-ui/icons/PersonAdd';

const useStyles = makeStyles(theme => ({
}))

export default withLoader(function Users(props) {
  const { users, /*administeredUsers,*/ title, actionButtons, emptyMesg } = props;
  const classes = useStyles()

  const addButton = (key) => 
    <Link to={"/users/new"} key={key}>
      <IconButton aria-label="add-player" color="primary">
        <PersonAddIcon/>
      </IconButton>
    </Link>
  const defaultActionButtons = [addButton]

  //todo - sort so administreed users first //remeber its just id now

  return (
    <SimpleList 
      title={title || 'Players'} 
      emptyMesg={emptyMesg || 'No users'}
      items={users} 
      primaryText={user => user.firstname + ' ' +user.surname}
      linkPath={user => {return '/user/'+user._id} } 
      actionButtons={actionButtons || defaultActionButtons}/>
  )
}, ['userLoadsComplete'])
