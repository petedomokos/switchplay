import { connect } from 'react-redux'
import { signout } from '../../actions/AuthActions'
import Menu from '../Menu'

const mapStateToProps = (state, ownProps) => {
	//pass signout and signingOut through to Menu from PageTemplateContainer
	return{
		isHidden:state.system.menusHidden,
		signingOut:state.asyncProcesses.signingOut,
		screenSize:state.system.screen.size
	}
}
const mapDispatchToProps = dispatch => ({
	onSignout(history){
		dispatch(signout(history))
	}
})

const MenuContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Menu)

export default MenuContainer