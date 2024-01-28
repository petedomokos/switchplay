import { connect } from 'react-redux'
import NonUserHome  from '../NonUserHomeOld'

const mapStateToProps = (state, ownProps) => {
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
const NonUserHomeContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(NonUserHome)

export default NonUserHomeContainer

