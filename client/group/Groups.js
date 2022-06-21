import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import {Link} from 'react-router-dom'
import SimpleList from '../util/SimpleList'
import { withLoader } from '../util/HOCs';
import { filterUniqueById } from '../util/ArrayHelpers';
import { user } from '../Reducers';
import ArrowForward from '@material-ui/icons/ArrowForward'


const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    //padding: theme.spacing(1),
    //margin: theme.spacing(5)
  })
}))

export default withLoader(function Groups(props) {
  const { groups, title, actionButtons, itemActions, emptyMesg } = props;
  const classes = useStyles()

  const addButton = (key) => 
    <Link to={"/groups/new"} key={key}>
      <IconButton aria-label="add-group" color="primary">
        <GroupAddIcon/>
      </IconButton>
    </Link>
  const defaultActionButtons = [addButton]

  const defaultItemActions = {
    main:{
      itemLinkPath:group => '/group/'+group._id,
      ItemIcon:({}) => <ArrowForward/>
    }
  }

  return (
    <SimpleList
      title={title || 'Groups'} 
      emptyMesg={emptyMesg || 'No groups'}
      items={groups} 
      primaryText={group => group.name}
      itemActions={itemActions || defaultItemActions}
      actionButtons={actionButtons || defaultActionButtons} />
  )
}, ['groupLoadsComplete'])