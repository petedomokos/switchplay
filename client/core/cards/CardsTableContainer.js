import { connect } from 'react-redux'
import CardsTable  from './CardsTable'
import { createTable, updateTable,  createDeck, updateDeck, updateDecks, deleteDeck } from '../../actions/UserActions'
import { hydrateJourneyData } from "../journey/hydrateJourney";
import { createEmptyJourney } from '../journey/constants'
import { fetchMultipleFullDatasets } from '../../actions/DatasetActions'
import { hideMenus, showMenus } from "../../actions/CommonActions"

const mapStateToProps = (state, ownProps) => {
	const { asyncProcesses, user, system } = state;
	const { _id, username, firstname, surname, photo, photos, journeys=[], homeJourney, loadedDatasets, datasetsMemberOf } = user;

	//const journeyId = system.activeJourney || homeJourney;
	//const journeyData = journeys.find(j => j._id === journeyId) || journeys[0] || createEmptyJourney(user);

	const datasets = loadedDatasets;
	const fullyLoadedDatasets = datasets
		.filter(dset => dset.datapoints)
		
	const allDatasetsFullyLoaded = datasets.length === fullyLoadedDatasets.length;
	console.log("screen", window._screen)
    alert(`width ${window._screen.width} height ${window._screen.height}`)

	//const hydratedJourneyData = user.isMock ? [] : hydrateJourneyData(journeyData, user, fullyLoadedDatasets);

	return{
		user,
		//journeyData:hydratedJourneyData,
		//data:user.milestonesData,
		customActiveDeck: system.activeDeck,
		datasets:fullyLoadedDatasets,
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
	hideMenus(){ dispatch(hideMenus()) },
	showMenus(){ dispatch(showMenus()) },
	createDeck(user, options, tableId){
		dispatch(createDeck(user, options, tableId))
	},
	updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateDeck(deck, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
	},
	updateDecks(details, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(updateDecks(details, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter));
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

