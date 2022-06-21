import { connect } from 'react-redux'
import { openDialog, closeDialog } from '../../actions/CommonActions'
import { fetchUser, deleteUserAccount } from '../../actions/UserActions'
import DeleteUser from '../DeleteUser'


const mapStateToProps = (state, ownProps) => {
	//console.log('state', state)
	return{
		//id can be passed in if user is deleting a different user that they have admin rights to
		//or otherwise its the logged in user from store
		userId:ownProps.userId || state.user._id,
		deleting:state.asyncProcesses.deleting.user,
		open:state.dialogs.deleteUser,
		error:state.asyncProcesses.error.deleting.user,
	}
}
const mapDispatchToProps = dispatch => ({
	openDialog(){
		dispatch(openDialog('deleteUser'))
	},
	deleteAccount(userId, history){
		console.log('deleting...')
		dispatch(deleteUserAccount(userId, history))
	},
	closeDialog(){
		dispatch(closeDialog('deleteUser'))
	}
})

//wrap all 4 sections in the same container for now.
const DeleteUserContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(DeleteUser)

export default DeleteUserContainer

