import C from '../Constants'
import auth from '../auth/auth-helper'

//HELPER METHODS
export const status = resp =>{
	if (resp.status != 200)
		return Promise.reject(new Error(resp.statusText))
	return Promise.resolve(resp)
}
export const parseResponse = resp => {
	return resp.json()
}
export const logError = (dispatch, err, path) =>{
	console.error("There is an action error!!!", err)
	dispatch({type:C.ERROR, value:err, path:path})
}
//higher-order actions
export const fetchStart = path => (
	{
		type: C.START,
		path:path
	}
)
export const fetchEnd = path => (
	{
		type: C.END,
		path:path
	}
)
//async
/**
*	fetches data from server and dispatched it to the store, 
*   Warning - server must return an action object.
*
*   Fetch Defaults: method GET, content-type json, no authentication
*/
export const fetchThenDispatch = (dispatch, asyncProcessesPath, options) => {
	dispatch(fetchStart(asyncProcessesPath))

	const { method, url, headers, body, requireAuth, nextAction, errorHandler } = options
	const handleError = errorHandler ? errorHandler : logError
	const formatNextAction = nextAction ? nextAction : function(data){return {type:C.NO_ACTION}}
	const requiredHeaders = headers ? headers : {
		'Accept': 'application/json', 
     	'Content-Type': 'application/json'
	} 
	if(requireAuth){
		const jwt = auth.isAuthenticated()
		requiredHeaders['Authorization'] ='Bearer '+jwt.token
	}
	const fetchSettings = {
		method: method ? method : 'GET',
		headers: requiredHeaders,
		body:body //maybe undefined
	}
	//console.log('making fetch req to url', url)
	fetch(url, fetchSettings)
	  .then(status)
	  .then(parseResponse)
	  .then(data => { dispatch(formatNextAction(data)) })
	  .then(data => { dispatch(fetchEnd(asyncProcessesPath)) })
	  .catch(err => logError(dispatch, err, asyncProcessesPath))
}

export const resetStatus = path => (
	{
		type:C.RESET_STATUS,
		path:path
	}
)

export const openDialog = path => {
	return {
		type:C.OPEN_DIALOG,
		path:path
	}
}

export const closeDialog = path => {
	return {
		type:C.CLOSE_DIALOG,
		path:path
	}
}

export const updateScreen = screen => {
	return {
		type:C.UPDATE_SCREEN,
		screen
	}
}