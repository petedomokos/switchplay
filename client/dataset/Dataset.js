import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
//styles
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import EditIcon from '@material-ui/icons/Edit';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonAddIcon from '@material-ui/icons/AddCircle';
import ArrowForward from '@material-ui/icons/ArrowForward'
//children
import DatasetProfile from './DatasetProfile';
import DatapointsTable from './datapoints/DatapointsTable'
import { withLoader } from '../util/HOCs';
import auth from '../auth/auth-helper'

const useStyles = makeStyles(theme => ({
  root:{
    display:'flex',
    alignItems:'flex-start', //note - when removing this, it makes item stretch more
    flexDirection:'column'
  },
  dashboard:{
    margin:'50px'
  },
  datapointsTable:{
    [theme.breakpoints.down('md')]: {
      width:'90vw',
    },
    [theme.breakpoints.up('lg')]: {
      width:'600px',
    },
  }
}))

//component
function Dataset(props) {
  const { dataset, updateDatapoints, datapointsUpdating, datapointsUpdated, datapointUpdateError } = props;
  const { _id, name, desc, created, datapoints } = dataset;
  
  const classes = useStyles();
  const [showDatapoints, setShowDatapoints] =  useState(false);
  const [updatedDatapoints, setUpdatedDatapoints] = useState(datapoints);

  useEffect(() => {
    return () => {
      //todo - ask user if they wish to save if there is unsaved changes
      //reset
      //closeDialog();
    };
  }, []); // will only apply once, not resetting the dialog at teh end of every render eg re-renders

  /*

  //helper
  const datapointsHaveChanged = !isSameById(dataset.datapoints, updatedDatapoints);
  
  const onAddDatapoint= user =>{
    setUpdatedDatapoints(prevState => [...prevState, user])
  }

  const onRemoveDatapoint = user =>{
    setUpdatedDatapoints(prevState => prevState.filter(us => us._id !== user._id))
  }

  const onClickCancel = () =>{
    setShowDatapointsToAdd(false);
    setUpdatedDatapoints(dataset.datapoints);
  }

  const onClickSubmit = () =>{
      setShowDatapointsToAdd(false)
      //we use form data as that is required for updateDataset request
      let formData = new FormData();
      formData.append('datapoints', updatedDatapoints.map(us => us._id))
      //we dont pass history as we dont need to redirect
      updateDatapoints(dataset._id, formData)
      //note - we will open dialog that saves saving, then saved, then disappears by itself (unless error)
  }
  const addButton = (key) => 
      <IconButton aria-label="add-datapoint" color="primary" key={key}
        onClick={() => setShowDatapointsToAdd(true)}>
        <EditIcon/>
      </IconButton>

  const cancelButton = (key) => 
      <Button aria-label="add-datapoint" color="secondary" key={key}
        onClick={onClickCancel}>
        Cancel
      </Button>

  const saveButton = (key) => 
      <Button aria-label="add-datapoint" color="secondary" key={key}
        onClick={onClickSubmit}>
        Save changes
      </Button>
  var adminActionButtons = [];
  if(!showDatapointsToAdd){
    adminActionButtons.push(addButton);
  }else{
    adminActionButtons.push(cancelButton);
  }
  if(datapointsHaveChanged){
    adminActionButtons =  [saveButton, cancelButton];
  }
 
  const nonAdminActionButtons = [];
  const jwt = auth.isAuthenticated();
  
  //dataset.admin has been loaded up in DatasetContainer so not just id
  const actionButtons = jwt && dataset.admin.find(user => user._id === jwt.user._id) ? 
    adminActionButtons : nonAdminActionButtons;

  const addDatapointItemActions = {
    main:{
      onItemClick:onAddDatapoint,
      ItemIcon:({}) => <AddCircleIcon/>
    }
  }
  //we want buttons to switch from the main froward arrow (for datapoint link)
  //when not editing, to the delete idon when editing.
  //using main and other gives a positional difference to make it obvious
  const removeDatapointItemActions = {
    main:{
      itemLinkPath:(item) =>'/user/'+item._id, 
      ItemIcon:showDatapointsToAdd ? () => null : ArrowForward
    },
    other:[{
      onClick:showDatapointsToAdd ? onRemoveDatapoint : () => {},
      ItemIcon: showDatapointsToAdd ? DeleteIcon : () => null
    }]
  }

  */

  const addButton = (key) => 
  <Link to={"/datapoints/new"} key={key}>
    <IconButton aria-label="add-datapoint" color="primary">
      <AddCircleIcon/>
    </IconButton>
  </Link>
  const datapointActionButtons = [addButton]

  return (
    <div className={classes.root} >
      <DatasetProfile profile={dataset} />
      <div className={classes.datapointsTable}>
          <DatapointsTable 
            title={'Datapoints'} 
            emptyMesg={'No datapoints'}
            items={updatedDatapoints}
            primaryText={d => d.player.firstname+ ' ' +d.player.surname}
            secondaryText={d => d.date}
            actionButtons={datapointActionButtons} />
      </div>
      <div className={classes.dashboard}>
      </div>
    </div>
  )
}
const Loading = <div>Dataset is loading</div>
//must load dataset if we dont have the deep version eg has datapoints property
export default withLoader(Dataset, ['dataset.datapoints'], {alwaysRender:false, LoadingPlaceholder:Loading});
