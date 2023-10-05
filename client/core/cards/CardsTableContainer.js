import { connect } from 'react-redux'
import CardsTable  from './CardsTable'
import { createTable, updateTable,  createDeck, updateDeck, deleteDeck } from '../../actions/UserActions'

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
	createDeck(settings, tableId){
		dispatch(createDeck(settings, tableId))
	},
	updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
	deleteDeck(deckId, updatedTable, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(deleteDeck(deckId, updatedTable, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
		//@todo - find a proper soln to having to send two requests instead of use of timeout
		//find out why it is causing an error to send both at same time
		//this second one doesnt update the store (ie 2ndflag is false)
		setTimeout(() => { dispatch(updateTable(updatedTable, true, false)); }, 3000)
	},
	createTable(settings){
		dispatch(createTable(settings))
	},
	updateTable(table, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateTable(table, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
})

//wrap all 4 sections in the same container for now.
const CardsTableContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(CardsTable)

export default CardsTableContainer

