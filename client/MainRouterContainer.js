import { connect } from 'react-redux'
import { fetchUser } from './actions/UserActions'
import { updateScreen } from './actions/CommonActions'
import MainRouter  from './MainRouter'

const mapStateToProps = (state, ownProps) => {
	return{
		userId:state.user._id,
		loadingUser:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user
	}
}
const mapDispatchToProps = dispatch => ({
	loadUser(userId){
		console.log('calling fetchUser signin in again..............')
		dispatch(fetchUser(userId))
	},
	updateScreen(screen){
		dispatch(updateScreen(screen))
	}
})

//wrap all 4 sections in the same container for now.
const MainRouterContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(MainRouter)

export default MainRouterContainer

