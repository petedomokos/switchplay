import { connect } from 'react-redux'
import UserHome  from '../UserHome'

const mapStateToProps = (state, ownProps) => {
	//console.log('UserHomeContainer', state)
	return{
		screen:state.system.screen,
		user:state.user,
		loading:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user
	}
}
const mapDispatchToProps = dispatch => ({
})

//wrap all 4 sections in the same container for now.
const UserHomeContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(UserHome)

export default UserHomeContainer

