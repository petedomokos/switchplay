import { connect } from 'react-redux'
import CardsTable  from './CardsTable'
import { createDeck, updateDecks } from '../../actions/UserActions'

const mapStateToProps = (state, ownProps) => {
	console.log("CardsTableContainer...user", state.user)
	const { asyncProcesses, user, system } = state;
	//console.log("CardsTableContainer decks", user.decks);

	return{
		user,
		//data:user.milestonesData,
		customActiveDeck: system.activeDeck,
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
	save(decks, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateDecks(decks, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
	createDeck(settings){
		console.log("settings....", settings)
		dispatch(createDeck(settings))
	}
})

//wrap all 4 sections in the same container for now.
const CardsTableContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CardsTable)

export default CardsTableContainer

