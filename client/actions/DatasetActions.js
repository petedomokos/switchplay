import C from '../Constants'
//import { filterUniqueByProperty } from '../util/helpers/ArrayManipulators'
import { status, parseResponse, logError, 
	fetchStart, fetchEnd, fetchThenDispatch, resetStatus} from './CommonActions'

	
export const createDataset = dataset => dispatch => {
	fetchThenDispatch(dispatch, 
		'creating.dataset',
		{
			url: '/api/datasets/',
			method: 'POST',
			body:JSON.stringify(dataset),
			requireAuth:true,
			//this action will also set dialog.createUser = true
			nextAction: data => {
				return {type:C.CREATE_NEW_ADMINISTERED_DATASET, mesg:data.mesg, dataset:data.dataset }
			}
		})
}


//to fetch a dataset in full
export const fetchDataset = id => dispatch => {
	console.log('fetchDataset', id)
	fetchThenDispatch(dispatch, 
		'loading.dataset',
		{
			url: '/api/datasets/' +id, 
			requireAuth:true,
			nextAction: data => {
				return {type:C.LOAD_DATASET, dataset:data}
			}
		})
}

//for now, use  a PUT with body, but should change to get with params
//note - userId may not be the signed in user
export const fetchMultipleFullDatasets = (datasetIds, playerId) => dispatch => {
	console.log("fetchmultiple p", playerId)
	console.log("fetchmultiple dsets", datasetIds)
	fetchThenDispatch(dispatch, 
        'loading.datasets',
        {
            url: '/api/datasets/multiple',
			method:'PUT', 	
			requireAuth:true,
			body:JSON.stringify({ datasetIds:datasetIds, playerId:playerId }),
            nextAction: data => {return {type:C.LOAD_DEEP_DATASETS, datasets:data}}
        })
}


export const fetchDatasets = () => dispatch => {
    fetchThenDispatch(dispatch, 
        'loading.datasets',
        {
            url: '/api/datasets',
            requireAuth:true,
            nextAction: data => {return {type:C.LOAD_DATASETS, datasets:data}}
        })
}

export const deleteDataset = (id, history) => dispatch => {
	fetchThenDispatch(dispatch, 
		'deleting.dataset',
		{
			url: '/api/datasets/'+id,
			method: 'DELETE',
			requireAuth:true,
			nextAction: data => {
				history.push("/")
				return {type:C.DELETE_ADMINISTERED_DATASETP, id:id}
			}
		})
}

export const updateDataset = (id, formData, history) => dispatch => {
	fetchThenDispatch(dispatch, 
		'updating.dataset',
		{
			url: '/api/datasets/'+id,
			method: 'PUT',
			headers:{
	        	'Accept': 'application/json'
	      	},
			body:formData, //not stringify as its a formidable object
			requireAuth:true,
			nextAction: data => {
				console.log('update_administered_dataset', data)
				if(history){
					history.push("/dataset/"+id)
				}
				return {type:C.UPDATE_ADMINISTERED_DATASET, dataset:data}
			}
		})
}

/*
export const addPlayer = (player, datasetId) => dispatch => {
	//add to dataset in store first so UI not held up
	//warning - this will only save teh client side details of player, not th eplayer that is returned from server.
	//if later we need more details, we should re-save the player when returned from server too
	dispatch(
		{type:'ADD_PLAYER', datasetId:datasetId, player:player})
	//todo - error handler must warn and remove again if server error
	fetchThenDispatch(dispatch, 'updating.dataset.players', 
		{
			url: '/api/dataset/players/add',
			method:'PUT', 	
		 	requireAuth:true,
		 	body:JSON.stringify({playerId:player._id, datasetId:datasetId}),
		 	errorHandler:error =>{
				logError(error)
			 	alert("Server error: Player "+player._id+" was not added. Try again.")
			 	//remove player in store as it wasnt added at server
			 	dispatch({type:'REMOVE_PLAYER', datasetId:datasetId, player:player})
			}
		})
}

export const removePlayer = (player, datasetId) => dispatch => {
	//remove from dataset in store first so UI not held up
	dispatch(
		{type:'REMOVE_PLAYER', datasetId:datasetId, player:player})
	//todo - error handler must warn and add again if server error
	fetchThenDispatch(dispatch, 'updating.dataset.players', 
		{
			url: '/api/dataset/players/remove',
		 	method:'PUT', 	
		 	requireAuth:true,
		 	body:JSON.stringify({playerId:player._id, datasetId:datasetId}),
			errorHandler:error =>{
				logError(error)
			 	alert("Server error: Player "+player._id+" was not removed. Try again.")
			 	//add player back in store as it wasnt removed at server
			 	dispatch({type:'ADD_PLAYER', datasetId:datasetId, player:player})
			}
		})
}

export const addDataset = (dataset, datasetId) => dispatch => {
	console.log('actions addDataset dataset ', dataset)
	//save to server first. if succ, then save to store
	//for now, whole dataset is returned and updated in store
	fetchThenDispatch(dispatch, 'updating.dataset.datasets', 
		{
			url: '/api/dataset/'+datasetId+'/datasets/add',
		 	method:'PUT', 	
		 	requireAuth:true,
		 	processor: data => {
				return {
					type:C.SAVE_DATASET, dataset:data
				}
			},
		 	body:JSON.stringify(dataset),
			errorHandler:error =>{
				logError(error)
			}
		})
}
export const deleteDataset = (datasetId, datasetId) => dispatch => {
	console.log('actions deleteDataset dataset ', datasetId)
	//save to server first. if succ, then save to store
	//for now, whole dataset is returned and updated in store
	fetchThenDispatch(dispatch, 'updating.dataset.datasets', 
		{
			url: '/api/dataset/'+datasetId+'/dataset/'+datasetId,
		 	method:'DELETE', 	
		 	requireAuth:true,
		 	processor: data => {
				return {
					type:C.SAVE_DATASET, dataset:data
				}
			},
			errorHandler:error =>{
				logError(error)
			}
		})
}
export const updateDataset = (datasetId, dataset) => dispatch => {
	fetchThenDispatch(dispatch, 
		'updating.dataset',
		{
			url: '/api/dataset/'+datasetId +'/dataset/'+dataset._id,
			method: 'PUT',
			body:JSON.stringify(dataset), //not stringify as its a formidable object
			requireAuth:true,
			processor: data => {
				return {type:C.SAVE_DATASET, dataset:data}
			}
		})
}
//todo - consider removing this and just use updateDataset to add a point ?
export const addDatapoint = (datapoint, datasetId, datasetId) => dispatch => {
	//save to server first. if succ, then save to store
	console.log('actions..addDatapoint datapoint', datapoint)
	fetchThenDispatch(dispatch, 'updating.dataset.datapoints', 
		{
			url: '/api/dataset/'+datasetId+'/dataset/'+datasetId+'/datapoints/add',
		 	method:'PUT', 	
		 	requireAuth:true,
		 	processor: data => {
				return {
					type:C.SAVE_DATASET, dataset:data
				}
			},
		 	body:JSON.stringify(datapoint),
			errorHandler:error =>{
				logError(error)
			}
		})
}

*/