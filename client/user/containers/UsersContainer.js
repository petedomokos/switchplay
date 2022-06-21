import { connect } from 'react-redux'
import { fetchUsers } from '../../actions/UserActions'
import Users  from '../Users'

const mapStateToProps = (state, ownProps) => {

	const { loadedUsers, loadsComplete } = state.user;
	//add the signed in user, who is not stored in loadedUsers
	const allUsers = [...loadedUsers, state.user];
	//remove users if specified via a prop from parent
	var requiredUsers = allUsers;
	if(ownProps.include){
		requiredUsers = allUsers.filter(us => ownProps.include.includes(us._id));
	}
	if(ownProps.exclude){
		requiredUsers = allUsers.filter(us => !ownProps.exclude.includes(us._id))
	}
	return{
		users:requiredUsers,
		//A flag propToCheck for withLoader HOC to make sure all users have been loaded
        userLoadsComplete:loadsComplete.users, //for now, we just load all users at this stage
		loading:state.asyncProcesses.loading.users,
		loadingError:state.asyncProcesses.error.loading.users,
		...ownProps //do we need this for our custom props or are they passed through automatically?
	}
}
const mapDispatchToProps = dispatch => ({
	onLoad(){
		//alert('loading users')
		dispatch(fetchUsers())
	}
})

//wrap all 4 sections in the same container for now.
const UsersContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Users)

export default UsersContainer

