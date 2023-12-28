import { connect } from 'react-redux'

import { signin } from '../../actions/AuthActions'
import Signin from '../Signin'

const mapStateToProps = state => {
	return {
		signingIn:state.asyncProcesses.signingIn,
		serverErrorMesg:state.asyncProcesses.error.loading?.user?.message
	}
}
const mapDispatchToProps = dispatch => ({
	onSignin(user, history, from){
		dispatch(signin(user, history, from))
	}
})

const SigninContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Signin)

export default SigninContainer