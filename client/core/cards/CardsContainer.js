import { connect } from 'react-redux'
import Cards  from './Cards'
import { createStack, updateStack } from '../../actions/UserActions'

const mapStateToProps = (state, ownProps) => {
	//console.log("JourneyContainer..........state.async", state.asyncProcesses)
	const { asyncProcesses, user, system } = state;
	//console.log("CardsContainer decks", user.decks);
	//console.log("active", system.activeStack)

	return{
		user,
		//data:user.milestonesData,
		customActiveStack: system.activeStack,
		data: user?.decks,
		datasets:[],
		//screen:state.system.screen,
        //width:state.system.screen.width,
        //height:state.system.screen.height - 90,
		screen:window._screen,
        //width:window._screen.width,
        //height:window._screen.height - 90,
		asyncProcesses,
	}
}

const mapDispatchToProps = dispatch => ({
	save(deck, shouldCreate, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		//console.log("save", deck, shouldCreate)
		//only create new deck if a signed in user has saved the deck (ie made a change)
		if(shouldCreate){
			dispatch(createStack(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter))
		}else{
			dispatch(updateStack(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter))
		}
	},
})

//wrap all 4 sections in the same container for now.
const CardsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Cards)

export default CardsContainer

