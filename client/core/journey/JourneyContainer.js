import { connect } from 'react-redux'
import Journey  from './Journey'
import { saveJourney, setActive } from '../../actions/JourneyActions'
import { closeDialog } from '../../actions/CommonActions'

const mapStateToProps = (state, ownProps) => {
	console.log('JourneyContainer', state)
    //const { journeyId }  = ownProps.match.params;state,
	const { journeys=[], homeJourney } = state.user;
	let data;
	if(state.system.activeJourney){
		data = journeys.find(j => j._id === state.system.activeJourney);
	}
	else if(homeJourney){
		data = journeys.find(j => j._id === homeJourney);
	}
	else{
		data = journeys[0] //may be undefined
	}
	return{
		//@todo - use activeJourney instead of homeJourney. It defaults to homeJourney on home page but user can overide.
		data,
		availableJourneys:journeys,
		screen:state.system.screen,
        width:state.system.screen.width,
        height:state.system.screen.height - 90,
        //temp put the ? until backend is implemented - will eventually do same as users - we just send a summary at first
		//journey:state.user.journeys?.find(j => j.id === journeyId),
		loading:state.asyncProcesses.loading.journey,
		loadingError:state.asyncProcesses.error.loading.journey,
        //dialogOpen:...???
	}
}
const mapDispatchToProps = dispatch => ({
    save(journey, shouldPersist){
		//console.log('save', journey)
		dispatch(saveJourney(journey, shouldPersist))
	},
	setActive(journeyId){
		dispatch(setActive(journeyId))
	},
	closeDialog(path){
		//console.log('closing dialog', path)
		dispatch(closeDialog(path))
	}
})

//wrap all 4 sections in the same container for now.
const JourneyContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Journey)

export default JourneyContainer

