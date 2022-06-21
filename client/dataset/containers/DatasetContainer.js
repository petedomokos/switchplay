import { connect } from 'react-redux'
import { fetchDataset, updateDataset } from '../../actions/DatasetActions'
import Dataset  from '../Dataset'
import { findIn } from '../../util/ArrayHelpers'

const mapStateToProps = (state, ownProps) => {
	//id can be passed through, or else for params (may not be the signed in dataset)
	const datasetId = ownProps.datasetId  || ownProps.match.params.datasetId
	let dataset = state.user.loadedDatasets.find(g => g._id === datasetId)
	//Dataset may or may not exist in store, and may be deep or shallow.
	//Dataset component expects a deep dataset, ie it must have dataset.admin, dataset.players, etc
	//it only gets those via fetchDataset which reads the dataset in more fully from database
	//The HOC withRouter will check for existence of the deep properties, 
	//and trigger fetchDataset if necc, We cannot assume at this point that they exist
	//IF DEEP GROUP IS LOADED, WE DO NEED TO LOAD IN THOSE DEEP PROPERTIES FROM LOADEDGROUPS 
	//-> THE DEEP USER ONLY HAS IDS
	const allUsers = [state.user, ...state.user.loadedUsers];

	if(dataset && dataset.players){
		//user is deep version so need to replace id-refs with objects
		dataset.admin = dataset.admin.map(dset => findIn(allUsers, dset));
		dataset.players = dataset.players.map(dset => findIn(allUsers, dset));
	}
	return{
		extraLoadArg:datasetId,
		dataset:dataset,
		loading:state.asyncProcesses.loading.dataset,
		loadingError:state.asyncProcesses.error.loading.dataset,
		playersUpdating:state.asyncProcesses.updating.dataset,
		playerUpdateError:state.asyncProcesses.error.updating.dataset,
		playersUpdated:state.asyncProcesses.success.updating.dataset,
	}
}
const mapDispatchToProps = dispatch => ({
	//2nd load arg is datasetid here
	onLoad(propsToLoad, datasetId){
		dispatch(fetchDataset(datasetId))
	},
	updatePlayers(datasetId, formData){
		dispatch(updateDataset(datasetId, formData))
	}
})

//wrap all 4 sections in the same container for now.
const DatasetContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Dataset)

export default DatasetContainer

