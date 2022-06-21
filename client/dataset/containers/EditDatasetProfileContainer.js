import { connect } from 'react-redux'
import { fetchDataset, updateDataset } from '../../actions/DatasetActions'
import EditDatasetProfile from '../EditDatasetProfile'
import { findShallowDataset } from '../../util/ReduxHelpers'
import auth from '../../auth/auth-helper'
import { findIn } from '../../util/ArrayHelpers'
import { getAvailableMeasures } from '../../data/measures'

const mapStateToProps = (state, ownProps) => {
	const { loadedUsers, loadedDatasets } = state.user;
	const allUsers = [...loadedUsers, state.user]
	//id can be passed through, or else for params (may not be the signed in dataset)
	const datasetId = ownProps.datasetId  || ownProps.match.params.datasetId
	const loadedDataset = loadedDatasets.find(dset => dset._id === datasetId);
	const dataset = {
		...loadedDataset,
		admin:loadedDataset ? loadedDataset.admin.map(user => findIn(allUsers, user)) : []
	}
	return{
		extraLoadArg:datasetId,
		signedInUserId: auth.isAuthenticated().user._id,
		dataset:dataset,
		availableMeasures:getAvailableMeasures(),
		loading:state.asyncProcesses.loading.dataset,
		loadingError:state.asyncProcesses.error.loading.dataset,
		updating:state.asyncProcesses.updating.dataset,
		updatingError:state.asyncProcesses.error.updating.dataset,
		history:ownProps.history
	}
}
const mapDispatchToProps = dispatch => ({
	//extra load arg is datasetId here
	onLoad(propsToLoad, datasetId){
		dispatch(fetchDataset(datasetId))
	},
	onUpdate(datasetId, formData, history){
		dispatch(updateDataset(datasetId, formData, history))
	}
})

//wrap all 4 sections in the same container for now.
const EditDatasetProfileContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(EditDatasetProfile)

export default EditDatasetProfileContainer

