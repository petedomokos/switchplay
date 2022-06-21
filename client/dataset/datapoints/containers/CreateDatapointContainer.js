import { connect } from 'react-redux'
import { fetchUser, fetchUsers } from '../../../actions/UserActions'
import { fetchDataset } from '../../../actions/DatasetActions'
import { createDatapoint } from '../../../actions/DatapointActions'
import { closeDialog } from '../../../actions/CommonActions'
import CreateDatapoint from '../CreateDatapoint'
import auth from '../../../auth/auth-helper'
import { findIn } from "../../../util/ArrayHelpers"

const mapStateToProps = (state, ownProps) => {
	const userId = auth.isAuthenticated().user._id;
	const { loadedDatasets, loadedUsers } = state.user;
	const allUsers = [state.user, ...loadedUsers]

	return({
		extraLoadArg:userId, //under a private route so user will be signed in
		userId:userId,
		//user can add datapoint to only a dataset that they administer
		datasets:state.user.administeredDatasets.map(dsetId => findIn(loadedDatasets, dsetId)),
		//user can add datapoint to themselves or to any other user
		players:allUsers,
		//may need to load user first if page refreshed
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		creating:state.asyncProcesses.creating.datapoint,
		error:state.asyncProcesses.error.creating.datapoint,
		open:state.dialogs.createDatapoint,
		userLoadsComplete:state.user.loadsComplete.users, //for now, we just load all users at this stage
		loadingUsers:state.asyncProcesses.loading.dataset,
		usersLoadingError:state.asyncProcesses.error.loading.dataset,
		loadingDataset:state.asyncProcesses.loading.dataset,
		datasetLoadingError:state.asyncProcesses.error.loading.dataset,
	})
}
const mapDispatchToProps = dispatch => ({
	//extraLoadAreg here is userId
	onLoad(propsToLoad, userId){
		if(propsToLoad.includes('datasets')){
			dispatch(fetchUser(userId))
		}
	},
	loadUsers(){
		//for now we just load all users.
		dispatch(fetchUsers())
	},
	loadDataset(datasetId){
		dispatch(fetchDataset(datasetId))
	},
	submit(datasetId, datapoint){
		console.log("create d dset id", datasetId)
		dispatch(createDatapoint(datasetId, datapoint))
	},
	closeDialog(){
		dispatch(closeDialog('createDatapoint'))
	}
})

//wrap all 4 sections in the same container for now.
const CreateDatapointContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CreateDatapoint)

export default CreateDatapointContainer
