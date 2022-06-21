import { connect } from 'react-redux'
import { fetchUser } from '../../actions/UserActions'
import { createDataset } from '../../actions/DatasetActions'
import { closeDialog } from '../../actions/CommonActions'
import CreateDataset from '../CreateDataset'
import auth from '../../auth/auth-helper'
import { getAvailableMeasures } from '../../data/measures'

const mapStateToProps = (state, ownProps) => {
	
	return({
		extraLoadArg:auth.isAuthenticated().user._id, //under a private route so user will be signed in
		user:state.user,
		//for now just store in file. todo - get from db, all main measures and also all ones created 
		//by this user. Whenever they cretae a new measure in teh process of creatng a dataset,
		//it can also be stored as a measure (or can just be got from administeredDatasets)
		availableMeasures:getAvailableMeasures(),
		//may need to load user first if page refreshed
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		creating:state.asyncProcesses.creating.dataset,
		error:state.asyncProcesses.error.creating.dataset,
		open:state.dialogs.createDataset
	})
}
const mapDispatchToProps = dispatch => ({
	//extraLoadAreg here is userId
	onLoad(propsToLoad, userId){
		if(propsToLoad.includes('user')){
			dispatch(fetchUser(userId))
		}
	},
	submit(dataset){
		dispatch(createDataset(dataset))
	},
	closeDialog(){
		dispatch(closeDialog('createDataset'))
	}
})

//wrap all 4 sections in the same container for now.
const CreateDatasetContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CreateDataset)

export default CreateDatasetContainer
