import React, { useState, useEffect } from 'react'
import { Route } from 'react-router-dom'
//styles
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton'
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/Delete';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import ArrowForward from '@material-ui/icons/ArrowForward'
//children
import GroupProfile from './GroupProfile';
import UsersContainer from '../user/containers/UsersContainer'
import DatasetsContainer from '../dataset/containers/DatasetsContainer'
import { withLoader } from '../util/HOCs';
import SimpleList from '../util/SimpleList';
import { isSameById } from '../util/ArrayHelpers';
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
  lists:{
    marginTop:`${theme.spacing(4)}px`,
    alignSelf:'stretch',
    display:'flex',
    justifyContent:'space-around',
    flexWrap:'wrap'
  },
  list:{
    [theme.breakpoints.down('md')]: {
      flex:'90vw 0 0',
    },
    [theme.breakpoints.up('lg')]: {
      flex:'400px 0 0',
    },
  },
  currentItemsList:{
    height:'400px',
  },
  availableItemsList:{
    height:'500px',
  }
}))

//component
function Group(props) {
  const { group, updateGroup, updating, updated, updateError } = props;
  const classes = useStyles();
  const [showPlayersToAdd, setShowPlayersToAdd] =  useState(false);
  const [updatedPlayers, setUpdatedPlayers] = useState(group.players);
  const [showDatasetsToAdd, setShowDatasetsToAdd] =  useState(false);
  const [updatedDatasets, setUpdatedDatasets] = useState(group.datasets);

  useEffect(() => {
    return () => {
      //todo - ask user if they wish to save if there is unsaved changes
      //reset
      //closeDialog();
    };
  }, []); // will only apply once, not resetting the dialog at teh end of every render eg re-renders


  //PLAYERS-----------------------------------------------------------------------------------------------

  //helper
  const playersHaveChanged = !isSameById(group.players, updatedPlayers);
  
  const onAddPlayer = user =>{
    setUpdatedPlayers(prevState => [...prevState, user])
  }

  const onRemovePlayer = user =>{
    console.log("remove!!!!!!!!!!!!!!!!!!!!!!!!!!", user)
    setUpdatedPlayers(prevState => prevState.filter(us => us._id !== user._id))
  }

  const onClickCancel = () =>{
    setShowPlayersToAdd(false);
    setUpdatedPlayers(group.players);
  }

  const onClickSubmit = () =>{
      setShowPlayersToAdd(false)
      //we use form data as that is required for updateGroup request
      let formData = new FormData();
      formData.append('players', updatedPlayers.map(us => us._id))
      //we dont pass history as we dont need to redirect
      updateGroup(group._id, formData)
      //note - we will open dialog that saves saving, then saved, then disappears by itself (unless error)
  }
  //group player list buttons
  const editButton = (key) => 
      <IconButton aria-label="add-player" color="primary" key={key}
        onClick={() => setShowPlayersToAdd(true)}>
        <PersonAddIcon/>
      </IconButton>

  const cancelButton = (key) => 
      <Button aria-label="add-player" color="secondary" key={key}
        onClick={onClickCancel}>
        Cancel
      </Button>

  const saveButton = (key) => 
      <Button aria-label="add-player" color="secondary" key={key}
        onClick={onClickSubmit}>
        Save changes
      </Button>
  
  var adminActionButtons = [];
  if(!showPlayersToAdd){
    adminActionButtons.push(editButton);
  }else{
    adminActionButtons.push(cancelButton);
  }
  if(playersHaveChanged){
    adminActionButtons =  [saveButton, cancelButton];
  }
 
  const nonAdminActionButtons = [];
  const jwt = auth.isAuthenticated();
  
  //group.admin has been loaded up in GroupContainer so not just id
  const actionButtons = jwt && group.admin.find(user => user._id === jwt.user._id) ? 
    adminActionButtons : nonAdminActionButtons;
  

  //player item buttons

  const addPlayerItemActions = {
    main:{
      onItemClick:onAddPlayer,
      ItemIcon:({}) => <AddCircleIcon/>
    }
  }
  //we want buttons to switch from the main froward arrow (for player link)
  //when not editing, to the delete idon when editing.
  //using main and other gives a positional difference to make it obvious
  console.log("onRemovePlayer", onRemovePlayer)
  const removePlayerItemActions = {
    main:{
      itemLinkPath:(item) =>'/user/'+item._id, 
      ItemIcon:showPlayersToAdd ? () => null : ArrowForward
    },
    other:[{
      onItemClick:showPlayersToAdd ? onRemovePlayer : () => {},
      ItemIcon: showPlayersToAdd ? DeleteIcon : () => null
    }]
  }

  //we exclude players that are in the new version of group from players to add list, even before saved
  //note that all group players are also put into loadedusers list in store when group is loaded
  //although these will be reloaded anyway if users havent all been loaded yet (as currently set up)

  //DATASETS ----------------------------------------------------------------------------------------------
  //helper
  const datasetsHaveChanged = !isSameById(group.datasets, updatedDatasets);

  const onAddDataset = dataset =>{
    setUpdatedDatasets(prevState => [...prevState, dataset])
  }
  const onRemoveDataset = dataset =>{
    setUpdatedDatasets(prevState => prevState.filter(dset => dset._id !== dataset._id))
  }
  const onClickCancelDatasets = () =>{
    setShowDatasetsToAdd(false);
    setUpdatedDatasets(group.datasets);
  }
  const onClickSubmitDatasets = () =>{
    setShowDatasetsToAdd(false)
    //we use form data as that is required for updateGroup request
    let formData = new FormData();
    formData.append('datasets', updatedDatasets.map(dset => dset._id))
    //we dont pass history as we dont need to redirect
    updateGroup(group._id, formData)
    //note - we will open dialog that saves saving, then saved, then disappears by itself (unless error)
  }
  //dataset list buttons
  const editDatasetsButton = (key) => 
    <IconButton aria-label="add-player" color="primary" key={key}
      onClick={() => setShowDatasetsToAdd(true)}>
      < AddCircleIcon/>
    </IconButton>

  const cancelDatasetsButton = (key) => 
      <Button aria-label="add-player" color="secondary" key={key}
        onClick={onClickCancelDatasets}>
        Cancel
      </Button>

  const saveDatasetsButton = (key) => 
      <Button aria-label="add-player" color="secondary" key={key}
        onClick={onClickSubmitDatasets}>
        Save changes
      </Button>
  
  var adminDatasetActionButtons = [];
  if(!showDatasetsToAdd){
    adminDatasetActionButtons.push(editDatasetsButton);
  }else{
    adminDatasetActionButtons.push(cancelDatasetsButton);
  }
  if(datasetsHaveChanged){
    adminDatasetActionButtons =  [saveDatasetsButton, cancelDatasetsButton];
  }
 
  const nonAdminDatasetActionButtons = [];
  //group.admin has been loaded up in GroupContainer so not just id
  const datasetActionButtons = jwt && group.admin.find(user => user._id === jwt.user._id) ? 
    adminDatasetActionButtons : nonAdminDatasetActionButtons;


  const addDatasetItemActions = {
    main:{
      onItemClick:onAddDataset,
      ItemIcon:({}) => <AddCircleIcon/>
    }
  }

  //we want buttons to switch from the main froward arrow (for dataset link)
  //when not editing, to the delete idon when editing.
  //using main and other gives a positional difference to make it obvious
  const removeDatasetItemActions = {
    main:{
      itemLinkPath:(item) =>'/dataset/'+item._id, 
      ItemIcon:showDatasetsToAdd ? () => null : ArrowForward
    },
    other:[{
      onItemClick:showDatasetsToAdd ? onRemoveDataset : () => {},
      ItemIcon: showDatasetsToAdd ? DeleteIcon : () => null
    }]
  }
  console.log('updatedDatasets', updatedDatasets)
  return (
    <div className={classes.root} >
      <GroupProfile profile={group} />
      <div className={classes.lists}>
          <div className={classes.list}>
              <div className={classes.currentItemsList}>
                  <SimpleList 
                    title='Players in group' 
                    emptyMesg='No players yet' 
                    items={updatedPlayers}
                    itemActions={removePlayerItemActions}
                    actionButtons={actionButtons}
                    primaryText={user => user.firstname + ' ' +user.surname} />
              </div>
              {showPlayersToAdd && <div className={classes.availableItemsList}>
                <UsersContainer
                  title='Players to add'
                  emptyMesg='No players left to add'
                  exclude={updatedPlayers.map(us => us._id)}
                  itemActions={addPlayerItemActions}
                  actionButtons={[]} />
              </div>}
          </div>

          <div className={classes.list} >
              <div className={classes.currentItemsList}>
                  <SimpleList 
                    title='Datasets in group' 
                    emptyMesg='No datasets yet' 
                    items={updatedDatasets}
                    itemActions={removeDatasetItemActions}
                    actionButtons={datasetActionButtons}
                    primaryText={dset => dset.name}
                    secondaryText={dset => dset.desc} />
              </div>

              {showDatasetsToAdd && <div className={classes.availableItemsList}>
                <DatasetsContainer
                  title='Datasets to add'
                  emptyMesg='No datasets left to add'
                  exclude={updatedDatasets.map(us => us._id)}
                  itemActions={addDatasetItemActions}
                  actionButtons={[]} />
              </div>}
          </div>


      </div>
      <div className={classes.dashboard}>
        This groups profile, players, datasets and data
      </div>
    </div>
  )
}
const Loading = <div>Group is loading</div>
//must load user if we dont have the deep version eg has players property
export default withLoader(Group, ['group.players'], {alwaysRender:false, LoadingPlaceholder:Loading});
