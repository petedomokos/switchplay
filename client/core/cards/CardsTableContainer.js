import { connect } from 'react-redux'
import CardsTable  from './CardsTable'
import { createDeck, updateDeck } from '../../actions/UserActions'

const mapStateToProps = (state, ownProps) => {
	//console.log("CardsTableContainer...user", state.user)
	const { asyncProcesses, user, system } = state;

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
	createDeck(settings){
		dispatch(createDeck(settings))
	},
	updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		console.log("update deck", deck)
		dispatch(updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
})

//wrap all 4 sections in the same container for now.
const CardsTableContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CardsTable)

export default CardsTableContainer

