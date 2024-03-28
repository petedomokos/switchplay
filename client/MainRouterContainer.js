import { connect } from 'react-redux'
import { fetchUser } from './actions/UserActions'
import { updateScreen, openDialog, closeDialog, setMobileMenu } from './actions/CommonActions'
import { signout } from './actions/AuthActions'
import { createNonuser } from './actions/NonUserActions'
import MainRouter  from './MainRouter'

const mapStateToProps = (state, ownProps) => {
	return{
		userId:state.user._id,
		loadingUser:state.asyncProcesses.loading.user,
		loadingError:state.asyncProcesses.error.loading.user,
		screen:state.system.screen,
		demoForm:state.dialogs.demoForm,
		mobileMenu:state.system.mobileMenu
	}
}
const mapDispatchToProps = dispatch => ({
	requestDemo(details){
		dispatch(createNonuser("requestdemo", details))
	},
	loadUser(userId){
		dispatch(fetchUser(userId))
	},
	updateScreen(screen){
		dispatch(updateScreen(screen))
	},
	onSignout(history){
		dispatch(signout(history))
	},
	showDemoForm(){
		dispatch(openDialog("demoForm"))
	},
	closeDemoForm(){
		dispatch(closeDialog("demoForm"))
	},
	setMobileMenu(shouldOpen){
		dispatch(setMobileMenu(shouldOpen))
	}
})

//wrap all 4 sections in the same container for now.
const MainRouterContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(MainRouter)

export default MainRouterContainer

