import { connect } from 'react-redux'
import AboutPage  from '../AboutPage'
import { createNonuser } from '../../actions/NonUserActions'

const mapStateToProps = (state, ownProps) => {
	return{
	}
}
const mapDispatchToProps = dispatch => ({
	subscribe(user){
		dispatch(createNonuser("subscribe", user))
	}
})

//wrap all 4 sections in the same container for now.
const AboutPageContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(AboutPage)

export default AboutPageContainer

