import { connect } from 'react-redux'
import CardsTable  from './CardsTable'
import { createTable, updateTable,  createDeck, updateDeck, deleteDeck } from '../../actions/UserActions'
import { hydrateJourneyData } from "../journey/hydrateJourney";
import { createEmptyJourney } from '../journey/constants'
import { fetchMultipleFullDatasets } from '../../actions/DatasetActions'

const mapStateToProps = (state, ownProps) => {
	//console.log("CardsTableContainer...user", state.user)
	const { asyncProcesses, user, system } = state;
	const { _id, username, firstname, surname, photo, photos, journeys=[], homeJourney, loadedDatasets, datasetsMemberOf } = state.user;

	const journeyId = state.system.activeJourney || homeJourney;
	const journeyData = journeys.find(j => j._id === journeyId) || journeys[0] || createEmptyJourney(state.user);

	const datasets = loadedDatasets;
	const fullyLoadedDatasets = datasets
		.filter(dset => dset.datapoints)
		.map(dset => ({
			...dset, datapoints:dset.datapoints.filter(d => d.player._id === journeyData.playerId)
		}))
	//console.log("fullyLD", fullyLoadedDatasets)
	const allDatasetsFullyLoaded = datasets.length === fullyLoadedDatasets.length;

	const hydratedJourneyData = hydrateJourneyData(journeyData, user, fullyLoadedDatasets);

	return{
		user,
		journeyData:hydratedJourneyData,
		//data:user.milestonesData,
		customActiveDeck: system.activeDeck,
		datasets:[],
		extraLoadArg: { playerId: _id, datasets:datasets },
		allDatasetsFullyLoaded,
		loading:state.asyncProcesses.loading.datasets,
		loadingError:state.asyncProcesses.error.loading.datasets,
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
	onLoad(propsToLoad, extraLoadArg){
		//console.log("onLoad",propsToLoad, extraLoadArg)
		const { datasets, playerId } = extraLoadArg
		//we know this player must have at least one d in this dset, so if empty, need to load
		const datasetsToLoad = datasets
			.filter(dset => !dset.datapoints || dset.datapoints.length === 0)
			.map(dset => dset._id);
		dispatch(fetchMultipleFullDatasets(datasetsToLoad, playerId))
	},
	createDeck(settings, tableId){
		dispatch(createDeck(settings, tableId))
	},
	updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
	deleteDeck(deckId, updatedTable, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(deleteDeck(deckId, updatedTable, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
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

