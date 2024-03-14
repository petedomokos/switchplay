import { connect } from 'react-redux'
import { fetchUser } from './actions/UserActions'
import { updateScreen } from './actions/CommonActions'
import { signout } from './actions/AuthActions'
import MainRouter  from './MainRouter'

const mapStateToProps = (state, ownProps) => {
	return{
		userId:state.user._id,
		loadingUser:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		screen:state.system.screen,
	}
}
const mapDispatchToProps = dispatch => ({
	loadUser(userId){
		dispatch(fetchUser(userId))
	},
	updateScreen(screen){
		dispatch(updateScreen(screen))
	},
	onSignout(history){
		dispatch(signout(history))
	}
})

//wrap all 4 sections in the same container for now.
const MainRouterContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(MainRouter)

export default MainRouterContainer

