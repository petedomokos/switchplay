import { connect } from 'react-redux'
import { fetchUser, updateUser } from '../../actions/UserActions'
import EditUserProfile from '../EditUserProfile'
import { findShallowUser, findUser } from '../../util/ReduxHelpers'
import auth from '../../auth/auth-helper'

const mapStateToProps = (state, ownProps) => {
	//console.log('state', state)
	//id can be passed through, or else for params (may not be the signed in user)
	const userId = ownProps.userId  || ownProps.match.params.userId
	return{
		extraLoadArg:userId,
		//jwt exists as this is under a private route
		signedInUserId: auth.isAuthenticated().user._id,
		//we get the user even if not in administeredGroups, so we can distinguish
		//between no permission or group doesnt exist
		user:state.user._id === userId ? state.user : 
			state.user.loadedUsers.find(us => us._id === userId),
			
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		updating:state.asyncProcesses.updating.user,
		updatingError:state.asyncProcesses.error.updating.user,
		history:ownProps.history
	}
}
const mapDispatchToProps = dispatch => ({
	//extra load arg is userId here
	onLoad(propsToLoad, userId){
		dispatch(fetchUser(userId))
	},
	onUpdate(userId, formData, history){
		dispatch(updateUser(userId, formData, history))
	}
})

//wrap all 4 sections in the same container for now.
const EditUserProfileContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(EditUserProfile)

export default EditUserProfileContainer

