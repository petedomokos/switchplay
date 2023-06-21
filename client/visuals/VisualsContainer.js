import { connect } from 'react-redux'
import { closeDialog } from '../actions/CommonActions'
import Visuals from './Visuals';

const mapStateToProps = (state, ownProps) => {
	return({
		screen:state.system.screen
	})
}
const mapDispatchToProps = dispatch => ({
	/*submit(data, importType, info={}){
		if(importType === "datapoints"){
			console.log("submitting datapoints.....",info.datasetId, data)
			dispatch(createDatapoints(info.datasetId, data));
		}
	},*/
	closeDialog(path){
		//console.log('closing dialog', path)
		dispatch(closeDialog(path))
	}
})

//wrap all 4 sections in the same container for now.
const VisualsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Visuals)

export default VisualsContainer

