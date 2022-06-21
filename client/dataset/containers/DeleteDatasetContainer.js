import { connect } from 'react-redux'
import { openDialog, closeDialog } from '../../actions/CommonActions'
import { fetchDataset, deleteDataset } from '../../actions/DatasetActions'
import DeleteDataset from '../DeleteDataset'


const mapStateToProps = (state, ownProps) => {
	//console.log('state', state)
	return{
		//id can be passed in if dataset is deleting a different dataset that they have admin rights to
		//or otherwise its the logged in dataset from store
		datasetId:ownProps.datasetId,
		deleting:state.asyncProcesses.deleting.dataset,
		open:state.dialogs.deleteDataset,
		error:state.asyncProcesses.error.deleting.dataset,
	}
}
const mapDispatchToProps = dispatch => ({
	openDialog(){
		dispatch(openDialog('deleteDataset'))
	},
	deleteAccount(datasetId, history){
		console.log('deleting...')
		dispatch(deleteDatasetAccount(datasetId, history))
	},
	closeDialog(){
		dispatch(closeDialog('deleteDataset'))
	}
})

//wrap all 4 sections in the same container for now.
const DeleteDatasetContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(DeleteDataset)

export default DeleteDatasetContainer

