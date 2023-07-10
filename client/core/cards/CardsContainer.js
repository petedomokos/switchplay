import { connect } from 'react-redux'
import Cards  from './Cards'
import { createStack, updateStack } from '../../actions/UserActions'

const mapStateToProps = (state, ownProps) => {
	//console.log("JourneyContainer..........state.async", state.asyncProcesses)
	const { asyncProcesses, user, system } = state;
	const stacks = user?.stacks;

	return{
		user,
		//data:user.milestonesData,
		customActiveStack: system.activeStack,
		data: user?.stacks,
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
	save(stack, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		if(stack.id === "temp"){
			dispatch(createStack(stack, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter))
		}else{
			dispatch(updateStack(stack, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter))
		}
	},
})

//wrap all 4 sections in the same container for now.
const CardsContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Cards)

export default CardsContainer

