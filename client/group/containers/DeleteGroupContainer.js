import { connect } from 'react-redux'
import { openDialog, closeDialog } from '../../actions/CommonActions'
import { fetchGroup, deleteGroup } from '../../actions/GroupActions'
import DeleteGroup from '../DeleteGroup'


const mapStateToProps = (state, ownProps) => {
	//console.log('state', state)
	return{
		//id can be passed in if group is deleting a different group that they have admin rights to
		//or otherwise its the logged in group from store
		groupId:ownProps.groupId,
		deleting:state.asyncProcesses.deleting.group,
		open:state.dialogs.deleteGroup,
		error:state.asyncProcesses.error.deleting.group,
	}
}
const mapDispatchToProps = dispatch => ({
	openDialog(){
		dispatch(openDialog('deleteGroup'))
	},
	deleteAccount(groupId, history){
		console.log('deleting...')
		dispatch(deleteGroupAccount(groupId, history))
	},
	closeDialog(){
		dispatch(closeDialog('deleteGroup'))
	}
})

//wrap all 4 sections in the same container for now.
const DeleteGroupContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(DeleteGroup)

export default DeleteGroupContainer

