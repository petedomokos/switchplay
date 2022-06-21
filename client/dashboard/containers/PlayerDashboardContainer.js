import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchMultipleFullDatasets } from '../../actions/DatasetActions'
import { closeDialog } from '../../actions/CommonActions'
import PlayerDashboard from '../PlayerDashboard'
import { onlyUnique } from "../../util/ArrayHelpers"

const mapStateToProps = (state, ownProps) => {
    const { user, asyncProcesses} = state;
    const { loadedUsers, loadedDatasets } = user;
	//console.log("laodedDatasets", loadedDatasets)
    const { userId }  = ownProps.match.params;
    const userIsSignedIn = state.user._id === userId;
	//user may be the signed in user or could be another user - we assume loadUser will have been called before this point
	//WARNING - PLAYER CONTAINS USERS/GROUOS AND DATASETS THAT MAY NOT BE UPDATED - THESE ARE NOT REQUIRED HERE SO WE REDUCE THEM TO idS ONLY
    const requiredPlayer = userIsSignedIn ? state.user : loadedUsers.find(u => u._id === userId);
	//console.log("requiredPlayer", requiredPlayer)
	const player = {
		...requiredPlayer,
		//@TODO BUG we have to filter fro unqiuer as for some reason datasetsMemeberOf has copies of smae dataset
		datasetsMemberOf:requiredPlayer.datasetsMemberOf.map(dset => dset._id).filter(onlyUnique) //probably dont even need datasetsMemberOf at all here
		//todo - reduce other arrays same as above
	}
	//we know datasets wiull have been loaded into loadedDatasets when user was loaded
	//remove other players datapoints if they exist
	//dataset datapoints are needed for dashboard. ie full dataset. so remove any datasets that are not full
	const datasets = player.datasetsMemberOf.map(dsetId => loadedDatasets.find(ds => ds._id === dsetId))
	const fullyLoadedDatasets = datasets
		.filter(dset => dset.datapoints)
		.map(dset => ({...dset, datapoints:dset.datapoints.filter(d => d.player._id === player._id)}))
		//check this players ds have been loaded 
		.filter(dset => dset.datapoints.length !== 0) //this player defo has at least 1 d to be a member of it

	//some or all datasets may not be fully loaded ie datapoints may not have been loaded
	const allDatasetsFullyLoaded = datasets.length === fullyLoadedDatasets.length;

	return({
		//user will be loaded already from UserContainer
		player:player,
        datasets: fullyLoadedDatasets,
		//loader -extra arg is passed back to onLoad so we can decide which datasets still need loading
		//(this is temp - later we will make HOC more flexible so it can handle arrays
		// and can directly send back only the datasets that require full loading, if any)
		//we also pass userid so server will filter dataset datapoints for this user only
		//WARNING - WHEN WE IMPL THIS FILTER, it means a dataset will have datapoints but 
		//may not be the datapoints for this player.
		//soln? the user must have at least one d in teh dset, because teh dset is in datasetsMembeOf
		//so just filter dataset.datapoints (if it exists in client yet) for this user
		//and if its empty, then need to load
		extraLoadArg: { playerId: userId, datasets:datasets },
		allDatasetsFullyLoaded:allDatasetsFullyLoaded,
		loading:asyncProcesses.loading.datasets,
		loadingError:asyncProcesses.error.loading.datasets,
		//two possible dialogs could be open (1st is if the signed in user created another user)
		open:state.dialogs.createUser || state.dialogs.signup,
	})
}
const mapDispatchToProps = dispatch => ({
	//2nd arg extraLoadArg is the datasets so we can determine which ones need loading
	onLoad(propsToLoad, extraLoadArg){
		const { datasets, playerId } = extraLoadArg
		//we know this player must have at least one d in this dset, so if empty, need to load
		const datasetsToLoad = datasets
			.filter(dset => !dset.datapoints || dset.datapoints.length === 0)
			.map(dset => dset._id);
		dispatch(fetchMultipleFullDatasets(datasetsToLoad, playerId))
	},
	closeDialog(path){
		console.log('closing dialog', path)
		dispatch(closeDialog(path))
	}
})

//wrap all 4 sections in the same container for now.
const PlayerDashboardContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(PlayerDashboard)

export default withRouter(PlayerDashboardContainer)

