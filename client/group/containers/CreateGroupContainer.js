import { connect } from 'react-redux'
import { fetchUser } from '../../actions/UserActions'
import { createGroup } from '../../actions/GroupActions'
import { closeDialog } from '../../actions/CommonActions'
import CreateGroup from '../CreateGroup'
import auth from '../../auth/auth-helper'

const mapStateToProps = (state, ownProps) => {
	return({
		extraLoadArg:auth.isAuthenticated().user._id, //under a private route so user will be signed in
		user:state.user,
		//may need to load user first if page refreshed
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		creating:state.asyncProcesses.creating.group,
		error:state.asyncProcesses.error.creating.group,
		open:state.dialogs.createGroup
	})
}
const mapDispatchToProps = dispatch => ({
	//extraLoadAreg here is userId
	onLoad(propsToLoad, userId){
		dispatch(fetchUser(userId))
	},
	submit(group){
		dispatch(createGroup(group))
	},
	closeDialog(){
		dispatch(closeDialog('createGroup'))
	}
})

//wrap all 4 sections in the same container for now.
const CreateGroupContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CreateGroup)

export default CreateGroupContainer
