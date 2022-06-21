import { connect } from 'react-redux'
import { createUser } from '../../actions/UserActions'
import { closeDialog } from '../../actions/CommonActions'
import CreateUser from '../CreateUser'

const mapStateToProps = (state, ownProps) => {
	return({
		user:state.user,
		creating:state.asyncProcesses.creating.user,
		error:state.asyncProcesses.error.creating.user,
		//two possible dialogs could be open (1st is if the signed in user created another user)
		open:state.dialogs.createUser || state.dialogs.signup,
	})
}
const mapDispatchToProps = dispatch => ({
	submit(user){
		dispatch(createUser(user))
	},
	closeDialog(path){
		console.log('closing dialog', path)
		dispatch(closeDialog(path))
	}
})

//wrap all 4 sections in the same container for now.
const CreateUserContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CreateUser)

export default CreateUserContainer

