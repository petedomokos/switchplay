import { connect } from 'react-redux'
import { fetchUser } from '../../actions/UserActions'
import { user } from '../../Reducers'
import User  from '../User'
import { findIn } from '../../util/ArrayHelpers'

const mapStateToProps = (state, ownProps) => {
	//console.log('state', state)
	//id can be passed through, or else for params (may not be the signed in user)
	const userId = ownProps.userId  || ownProps.match.params.userId;
	const _user = state.user._id === userId ? state.user : 
		state.user.loadedUsers.find(us => us._id === userId);
	//User may or may not exist in store, and may be deep or shallow.
	//User component expects a deep user, ie it must have user.admin, user.groupsMemberOf, etc
	//it only gets those via fetchUser which reads the user in more fully from database
	//The HOC withRouter will check fro existence of the deep properties, 
	//and trigger fetchUser if necc, We cannot assume at this point that they exist
	//IF DEEP USER IS LOADED, WE DO NEED TO LOAD IN THOSE GROUPS FROM LOADEDGROUPS 
	//-> THE DEEP USER ONLY HAS IDS
	const allUsers = [state.user, ...state.user.loadedUsers];
	const { loadedGroups, loadedDatasets } = state.user;

	if(_user && _user.groupsMemberOf){
		_user.admin = _user.admin.map(user => findIn(allUsers, user));
		_user.administeredUsers = _user.administeredUsers.map(user => findIn(allUsers, user));
		_user.administeredGroups = _user.administeredGroups.map(g => findIn(loadedGroups, g));
		_user.administeredDatasets = _user.administeredDatasets.map(dset => findIn(loadedDatasets, dset));
		_user.groupsMemberOf = _user.groupsMemberOf.map(g => findIn(loadedGroups, g));
		_user.datasetsMemberOf = _user.datasetsMemberOf.map(dset => findIn(loadedDatasets, dset));
	}

	return{
		//url:ownProps.history.location.pathname,
		extraLoadArg:userId,
		user:_user,
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user
	}
}
const mapDispatchToProps = dispatch => ({
	//2nd load arg is userid here
	onLoad(propsToLoad, userId){
		dispatch(fetchUser(userId))
	}
})

//wrap all 4 sections in the same container for now.
const UserContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(User)

export default UserContainer

