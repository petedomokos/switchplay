import { connect } from 'react-redux'

import { signin } from '../../actions/AuthActions'
import Signin from '../Signin'

const mapStateToProps = state => ({
	signingIn:state.asyncProcesses.signingIn
})
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