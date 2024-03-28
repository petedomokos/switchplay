import { connect } from 'react-redux'
import NonUserHome  from '../NonUserHomeOld'
import { createNonuser } from '../../actions/NonUserActions'
import { closeDialog, openDialog } from '../../actions/CommonActions'

const savingDialog = { 
	key:"saving", title:"Saving...", 
	text: "One sec please, we're just saving your details."
}
const savedRequestDemoDialog = { 
	key:"saved", title:"Saved", path:"saved_requestdemo",
	text: "Thanks, we will be in touch soon" , 
	buttons:[{ key:"continue", label:"Continue" }]
}
const savedSubscribeDialog = { 
	key:"saved", title:"Saved", path:"saved_subscribe",
	text: "Thanks, we will be in touch soon" , 
	buttons:[{ key:"continue", label:"Continue" }]
}
const errorDialog = { 
	key:"error", title:"Error", 
	text: "There seems to be a server or internet error. Please try again, or contact us" , 
	buttons:[{ key:"tryAgain", label:"Try Again" }, { key:"continue", label:"Go back" }]
}

const mapStateToProps = (state, ownProps) => {
	const { dialogs, asyncProcesses } = state;
	const { saving, success, error, loading } = asyncProcesses;
	return {
		screen:state.system.screen,
		dialog:saving?.requestdemo ? savingDialog : 
			(dialogs?.saved_requestdemo ? savedRequestDemoDialog : 
				(dialogs?.saved_subscribe ? savedSubscribeDialog :
					(error?.requestdemo ? errorDialog : null
			))),
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

