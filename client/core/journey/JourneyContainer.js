import { connect } from 'react-redux'
import Journey  from './Journey'
import { saveJourney, setActive } from '../../actions/JourneyActions'
import { closeDialog } from '../../actions/CommonActions'
import { fetchMultipleFullDatasets } from '../../actions/DatasetActions'
import { hydrateJourneyData } from "./hydrateJourney";


const mockJourneyMeasures = [
	{ id:"mock1", name:"Puts Per Round", desc: "nr of puts in a round" },
	{ id:"mock2", name:"Drive 1", desc: "nr D1s to Fairway" },
	{ id:"mock3", name:"Drive 2", desc: "nr D2s to Fairway" }
]


const mockDatasets = [
  { 
    _id: "606b6aef720202523cc3589d", 
    name:"Press ups", 
    measures:[
      { 
        _id:"606b6aef720202523cc3589e", 
        name:"Reps", 
        unit:"reps", 
        fullNameShort:"Press-ups", 
        fullNameLong:"Nr of Press-ups in 1 Min",
        bands:[ { min:"0", max:"60" } ],
        standards:[ { name:"minimum", value:"0" }],
      }
    ],
    datapoints:[
      { 
        isTarget:false,
        player: "", 
        date:"2021-03-31T18:26:00.000+00:00",
        values:[
          { 
            measure:"606b6aef720202523cc3589e", 
            value:"38" ,
            key:"reps"
          }
        ]
      }
      //add target datapoints here when a future profile card kpi targets
      //only need to create it when we actually have a target set ie on teh lng run, this 
      // will be when user has dragged a kpi bar to vary it. For now, it is when we set it manually here
      // if there is no target kpi for specific date, then the future profile card defaults to the latest datapoint BEFORE the 
      // card date, whether this be a target, ot if no target, then teh latest actual datapoint.
      //also consider, if it is an actaul datapoint, we may want to use teh best score rather than the latest,
      // or the median avg of the previous 3.
    ]
  }
]

const mockProfiles = [
	{
	  	date:new Date("2022-09-16"),
	  	id:"mock1", _id:"mock1", kpiStats:[], yPC:50,
	},
	{
	  	date:new Date("2022-10-16"),
	  	id:"mock2", _id:"mock2", kpiStats:[], yPC:50,
	},
	{
	  	date:new Date("2023-01-16"),
		id:"mock3", _id:"mock3", kpiStats:[], yPC:50,
	},
	{
		date:new Date("2023-02-16"),
		id:"mock4", _id:"mock4", kpiStats:[], yPC:50,
	}
]

const emptyJourney = user => ({ 
	_id:"temp", contracts:[], profiles:[], aims:[], goals:[], links:[],
	measures:[], kpis:[], 
	playerId:user.isPlayer ? user._id : null,
	coachId:user.isCoach && !user.isPlayer ? user._id : null,
	groupId: null //todo - this can be an option for a coach
})

const mapStateToProps = (state, ownProps) => {
	//console.log("Container.................", state)
    //const { journeyId }  = ownProps.match.params;state,
	//for now, assume player is user, but need to attach playerId/coachId or groupId to each journey
	const { journeys=[], homeJourney, loadedDatasets, datasetsMemberOf } = state.user;
	const journeyId = state.system.activeJourney || homeJourney;
	const _data = journeys.find(j => j._id === journeyId) || journeys[0] || emptyJourney(state.user);
	//console.log("JourneyContainer data", _data)
	//add mock profiles the first time only (note - these must be turnd off before we enabled server-side persitance again)
	const mocksAdded = !!_data.profiles.find(p => p.id.includes("mock"));
	const data = mocksAdded ? _data : { ..._data, profiles:[..._data.profiles, ...mockProfiles] };
	//const data = _data;
	//const data = { ..._data, profiles:[] }

	const datasets = datasetsMemberOf.map(dataset => loadedDatasets.find(ds => ds._id === dataset._id))
	const fullyLoadedDatasets = datasets
		.filter(dset => dset.datapoints)
		.map(dset => ({ ...dset, datapoints:dset.datapoints.filter(d => d.player._id === data.playerId) }))
		//check this players ds have been loaded 
		//.filter(dset => dset.datapoints.length !== 0) //this player defo has at least 1 d to be a member of it
	//console.log("fullyLoadedDatasets", fullyLoadedDatasets)
	//some or all datasets may not be fully loaded ie datapoints may not have been loaded
	const allDatasetsFullyLoaded = datasets.length === fullyLoadedDatasets.length;
	//console.log("areDatsetsLoaded??????????????????????", allDatasetsFullyLoaded)
	
	const hydratedData = hydrateJourneyData(data, state.user, fullyLoadedDatasets);
	//console.log("hydratedData", hydratedData)



	return{
		//@todo - use activeJourney instead of homeJourney. It defaults to homeJourney on home page but user can overide.
		data:hydratedData,
		datasets:fullyLoadedDatasets,
		extraLoadArg: { playerId: state.user._id, datasets:datasets },
		allDatasetsFullyLoaded,
		loading:state.asyncProcesses.loading.datasets,
		loadingError:state.asyncProcesses.error.loading.datasets,
		availableJourneys:journeys,
		screen:state.system.screen,
        width:state.system.screen.width,
        height:state.system.screen.height - 90,
        //temp put the ? until backend is implemented - will eventually do same as users - we just send a summary at first
		//journey:state.user.journeys?.find(j => j.id === journeyId),
		//loading:state.asyncProcesses.loading.journey,
		//loadingError:state.asyncProcesses.error.loading.journey,
        //dialogOpen:...???
	}
}
const mapDispatchToProps = dispatch => ({
	onLoad(propsToLoad, extraLoadArg){
		const { datasets, playerId } = extraLoadArg
		//we know this player must have at least one d in this dset, so if empty, need to load
		const datasetsToLoad = datasets
			.filter(dset => !dset.datapoints || dset.datapoints.length === 0)
			.map(dset => dset._id);
		dispatch(fetchMultipleFullDatasets(datasetsToLoad, playerId))
	},
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
	},
})

//wrap all 4 sections in the same container for now.
const JourneyContainer = connect(
	mapStateToProps,
	mapDispatchToProps
	)(Journey)

export default JourneyContainer

