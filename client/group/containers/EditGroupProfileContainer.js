import { connect } from 'react-redux'
import { fetchGroup, updateGroup } from '../../actions/GroupActions'
import EditGroupProfile from '../EditGroupProfile'
import { findShallowGroup } from '../../util/ReduxHelpers'

const mapStateToProps = (state, ownProps) => {
	//id can be passed through, or else for params (may not be the signed in group)
	const groupId = ownProps.groupId  || ownProps.match.params.groupId
	return{
		extraLoadArg:groupId,
		signedInUserId: auth.isAuthenticated().user._id,
		group:state.user.loadedGroups.find(g => g._id === groupId),
		loading:state.asyncProcesses.loading.group,
		loadingError:state.asyncProcesses.error.loading.group,
		updating:state.asyncProcesses.updating.group,
		updatingError:state.asyncProcesses.error.updating.group,
		history:ownProps.history
	}
}
const mapDispatchToProps = dispatch => ({
	//extra load arg is groupId here
	onLoad(propsToLoad, groupId){
		alert('loading group')
		dispatch(fetchGroup(groupId))
	},
	onUpdate(groupId, formData, history){
		dispatch(updateGroup(groupId, formData, history))
	}
})

//wrap all 4 sections in the same container for now.
const EditGroupProfileContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(EditGroupProfile)

export default EditGroupProfileContainer

