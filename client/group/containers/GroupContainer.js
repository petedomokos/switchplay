import { connect } from 'react-redux'
import { fetchGroup, updateGroup } from '../../actions/GroupActions'
import Group  from '../Group'
import { findIn } from '../../util/ArrayHelpers'

const mapStateToProps = (state, ownProps) => {
	console.log('state', state)
	//id can be passed through, or else for params (may not be the signed in group)
	const groupId = ownProps.groupId  || ownProps.match.params.groupId
	console.log('groupId', groupId)
	const _group = state.user.loadedGroups.find(g => g._id === groupId)
	//Group may or may not exist in store, and may be deep or shallow.
	//Group component expects a deep group, ie it must have group.admin, group.players, etc
	//it only gets those via fetchGroup which reads the group in more fully from database
	//The HOC withRouter will check for existence of the deep properties, 
	//and trigger fetchGroup if necc, We cannot assume at this point that they exist
	//IF DEEP GROUP IS LOADED, WE DO NEED TO LOAD IN THOSE DEEP PROPERTIES FROM LOADEDGROUPS 
	//-> THE DEEP USER ONLY HAS IDS
	const allUsers = [state.user, ...state.user.loadedUsers];

	if(_group && _group.players){
		//user is deep version so need to replace id-refs with objects
		_group.admin = _group.admin.map(user => findIn(allUsers, user));
		_group.players = _group.players.map(user => findIn(allUsers, user));
		_group.datasets = _group.datasets.map(dset => findIn(state.user.loadedDatasets, dset));
	}
	return{
		extraLoadArg:groupId,
		group:_group,
		loading:state.asyncProcesses.loading.group,
		loadingError:state.asyncProcesses.error.loading.group,
		updating:state.asyncProcesses.updating.group,
		updateError:state.asyncProcesses.error.updating.group,
		updated:state.asyncProcesses.success.updating.group,
	}
}
const mapDispatchToProps = dispatch => ({
	//2nd load arg is groupid here
	onLoad(propsToLoad, groupId){
		//alert('loading group')
		dispatch(fetchGroup(groupId))
	},
	updateGroup(groupId, formData){
		dispatch(updateGroup(groupId, formData))
	}
})

//wrap all 4 sections in the same container for now.
const GroupContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Group)

export default GroupContainer

