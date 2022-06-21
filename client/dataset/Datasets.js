import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import AddCircleIcon from '@material-ui/icons/AddCircle';
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

export default withLoader(function Datasets(props) {
  const { datasets, title, actionButtons, itemActions, emptyMesg } = props;
  const classes = useStyles()

  const addButton = (key) => 
    <Link to={"/datasets/new"} key={key}>
      <IconButton aria-label="add-dataset" color="primary">
        <AddCircleIcon/>
      </IconButton>
    </Link>
  const defaultActionButtons = [addButton]

  const defaultItemActions = {
    main:{
      itemLinkPath:dataset => "/dataset/" + dataset._id,
      ItemIcon:({}) => <ArrowForward/>
    }
  }

  return (
    <SimpleList
      title={title || 'Datasets'} 
      emptyMesg={emptyMesg || 'No datasets'}
      items={datasets} 
      primaryText={dataset => dataset.name}
      secondaryText={dataset => dataset.desc}
      itemActions={itemActions || defaultItemActions}
      actionButtons={actionButtons || defaultActionButtons} />
  )
}, ['datasetLoadsComplete'])