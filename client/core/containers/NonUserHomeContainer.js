import { connect } from 'react-redux'
import NonUserHome  from '../NonUserHomeOld'
import { createNonuser } from '../../actions/NonUserActions'
import { closeDialog, openDialog } from '../../actions/CommonActions'

const mapStateToProps = (state, ownProps) => {
	const { dialogs, asyncProcesses } = state;
	const { saving, success, error, loading } = asyncProcesses;
	return {
		screen:state.system.screen,
		dialog:null,
		demoForm:dialogs.demoForm
	}
}
const mapDispatchToProps = dispatch => ({
	subscribe(details){
		dispatch(createNonuser("subscribe", details))
	},
	closeDialog(path){
		dispatch(closeDialog(path))
	},
	closeDemoForm(){
		dispatch(closeDialog("demoForm"))
	},
	showDemoForm(){
		dispatch(openDialog("demoForm"))
	}
})

//wrap all 4 sections in the same container for now.
const NonUserHomeContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(NonUserHome)

export default NonUserHomeContainer

