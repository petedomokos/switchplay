import { connect } from 'react-redux'
import Cards  from './Cards'

const mapStateToProps = (state, ownProps) => {
	//console.log("JourneyContainer..........state.async", state.asyncProcesses)
	const { asyncProcesses, user } = state;

	return{
		user,
		//data:user.milestonesData,
		datasets:[],
		//screen:state.system.screen,
        //width:state.system.screen.width,
        //height:state.system.screen.height - 90,
		screen:window._screen,
        //width:window._screen.width,
        //height:window._screen.height - 90,
		asyncProcesses
	}
}

const mapDispatchToProps = dispatch => ({
})

//wrap all 4 sections in the same container for now.
const CardsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Cards)

export default CardsContainer

