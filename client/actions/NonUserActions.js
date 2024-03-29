import C from '../Constants'
import { status, parseResponse, logError, fetchStart, fetchEnd, fetchThenDispatch } from './CommonActions'
import { hideDemoForm } from '../core/websiteHelpers'
export const createNonuser = (requestType, details, redirectTo) => dispatch =>{
    //console.log("createNonuser", requestType, details)
	dispatch({ type:C.OPEN_DIALOG, path:`saving_${requestType}` })
	const requestDetails = { 
		...details, 
		subscribed:requestType === "subscribe",
		requestedDemo:requestType === "requestdemo"
	}
	fetchThenDispatch(dispatch, 
		`saving.${requestType}`,
		{
			url: `/api/${requestType}`,
			method:'POST',
			body: JSON.stringify(requestDetails),
			nextAction: () => {
		        dispatch({ type:C.OPEN_DIALOG, path:`saved_${requestType}` })
				return { type:C.CLOSE_DIALOG, path:`saving_${requestType}` }
			}
		})
}