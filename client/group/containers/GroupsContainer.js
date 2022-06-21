import { connect } from 'react-redux'
import { fetchGroups } from '../../actions/GroupActions'
import Groups  from '../Groups'
import { findDeepGroup } from '../../util/ReduxHelpers';

const mapStateToProps = (state, ownProps) => { 
	const { loadedGroups, loadsComplete } = state.user;
	//remove users if specified via a prop from parent
	var requiredGroups = loadedGroups;
	if(ownProps.include){
		requiredGroups = loadedGroups.filter(g => ownProps.include.includes(g._id));
	}
	if(ownProps.exclude){
		requiredGroups = loadedGroups.filter(g => !ownProps.exclude.includes(g._id))
	}
	return{
		groups:requiredGroups,
		//A flag propToCheck for withLoader HOC to make sure all groups have been loaded
		groupLoadsComplete:loadsComplete.groups,
		loading:state.asyncProcesses.loading.groups,
		loadingError:state.asyncProcesses.error.loading.groups,
		...ownProps
	}
}
const mapDispatchToProps = dispatch => ({
	onLoad(){
		//alert('loading groups')
		dispatch(fetchGroups())
	}
})

//wrap all 4 sections in the same container for now.
const GroupsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Groups)

export default GroupsContainer

