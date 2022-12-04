import { connect } from 'react-redux'
import Journey  from './Journey'
import { saveJourney, setActive } from '../../actions/JourneyActions'
import { closeDialog } from '../../actions/CommonActions'
import { getKpis } from "../../data/userKpis"

const mockPlayer = {
	name:"Lewis Campbell",
	firstName:"Lewis",
	surname:"Campbell",
	position:"Forward",
	age:21
}

const mapStateToProps = (state, ownProps) => {
	//console.log("Container.................", state)
    //const { journeyId }  = ownProps.match.params;state,
	const { journeys=[], homeJourney } = state.user;
	const journeyId = state.system.activeJourney || homeJourney;
	const data = journeys.find(j => j._id === journeyId) || journeys[0];
	// console.log("JourneyContainer", data)

	const player = mockPlayer; //@todo - use state.user if its a player that is signed in, or activePlayer if its a coach 
	//todo - if its a different user to the signedin user (eg a coach looking at a player). then may need to load the user
	const userInfo = {
		//for now assume its same player as signed in
		firstName:player.firstName,
		surname:player.surname,
		position:player.position,
		age:21,
		photos:[{label:"main"}]
	}
	//todo - store kpis in db
	const userKpis = getKpis(data?.userId);

	return{
		//@todo - use activeJourney instead of homeJourney. It defaults to homeJourney on home page but user can overide.
		data,
		userKpis,
		userInfo,
		datasets:undefined,//state.user?.datasetsMemberOf || undefined,
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

