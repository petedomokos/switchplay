import { connect } from 'react-redux'
import Journey  from './Journey'
import { saveJourney, setActive, updateProfile } from '../../actions/JourneyActions'
import { closeDialog, hideMenus, showMenus } from '../../actions/CommonActions'
import { fetchMultipleFullDatasets } from '../../actions/DatasetActions'
import { createDatapoints } from '../../actions/DatapointActions'
import { updateUser } from '../../actions/UserActions'
import { hydrateJourneyData } from "./hydrateJourney";
import { createEmptyJourney } from './constants'

const mapStateToProps = (state, ownProps) => {
	//console.log("JourneyContainer..........state.async", state.asyncProcesses)
	const { asyncProcesses } = state;
    //const { journeyId }  = ownProps.match.params;state,
	//for now, assume player is user, but need to attach playerId/coachId or groupId to each journey
	const { _id, username, firstname, surname, photo, photos, journeys=[], homeJourney, loadedDatasets, datasetsMemberOf } = state.user;
	const user = { _id, username, firstname, surname, photos, photo };
	//console.log("JourneyContainer photos", photos)
	//console.log("journeys", journeys)
	const journeyId = state.system.activeJourney || homeJourney;
	//console.log("JourneyCont journeyId", journeyId)
	const _data = journeys.find(j => j._id === journeyId) || journeys[0] || createEmptyJourney(state.user);
	//console.log("JourneyContainer data", _data)
	//add mock profiles the first time only (note - these must be turnd off before we enabled server-side persitance again)
	//const mocksAdded = !!_data.profiles.find(p => p.id.includes("mock"));
	//const data = mocksAdded ? _data : { ..._data, profiles:[..._data.profiles, ...mockProfiles] };
	const data = _data;
	//const data = { ..._data, profiles:[] }
	//@todo - put this back once datasetsMemberOf is up to date in the way it works when datasets are created.
	//for now, just use all loadedDatasets (datapoints have alreayd been filtered in controller)
	const datasets = loadedDatasets;//temp -  datasetsMemberOf.map(dataset => loadedDatasets.find(ds => ds._id === dataset._id))
	console.log("JC...datasets", datasets)
	//console.log("data", data)
	//next - bug - teh new datapoint is not being hydrated after saving, so therefore has no player object with _id etc
	const fullyLoadedDatasets = datasets
		.filter(dset => dset.datapoints)
		.map(dset => ({
			...dset, datapoints:dset.datapoints.filter(d => d.player._id === data.playerId)
		}))
		//check this players ds have been loaded 
		//.filter(dset => dset.datapoints.length !== 0) //this player defo has at least 1 d to be a member of it
	// console.log("fullyLoadedDatasets", fullyLoadedDatasets)
	//some or all datasets may not be fully loaded ie datapoints may not have been loaded
	const allDatasetsFullyLoaded = datasets.length === fullyLoadedDatasets.length;
	//console.log("areDatsetsLoaded??????????????????????", allDatasetsFullyLoaded)
	const hydratedData = hydrateJourneyData(data, state.user, fullyLoadedDatasets);

	return{
		user,
		//@todo - use activeJourney instead of homeJourney. It defaults to homeJourney on home page but user can overide.
		data:hydratedData,
		datasets:fullyLoadedDatasets,
		extraLoadArg: { playerId: state.user._id, datasets:datasets },
		allDatasetsFullyLoaded,
		loading:state.asyncProcesses.loading.datasets,
		loadingError:state.asyncProcesses.error.loading.datasets,
		availableJourneys:journeys,
		//screen:state.system.screen,
        //width:state.system.screen.width,
        //height:state.system.screen.height - 90,
		screen:window._screen,
        width:window._screen.width,
        height:window._screen.height - 90,
		asyncProcesses
        //temp put the ? until backend is implemented - will eventually do same as users - we just send a summary at first
		//journey:state.user.journeys?.find(j => j.id === journeyId),
		//loading:state.asyncProcesses.loading.journey,
		//loadingError:state.asyncProcesses.error.loading.journey,
        //dialogOpen:...???
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
    save(journey, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter){
		dispatch(saveJourney(journey, shouldPersist, shouldUpdateStoreBefore, shouldUpdateStoreAfter))
	},
	saveDatapoint(datasetId, datapoint){
		dispatch(createDatapoints(datasetId, [datapoint]))
	},
	savePhoto(userId, formData){
		dispatch(updateUser(userId, formData))
	},
	setActive(journeyId){
		dispatch(setActive(journeyId))
	},
	takeOverScreen(){
		dispatch(hideMenus());
	},
	releaseScreen(){
		dispatch(showMenus());
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

