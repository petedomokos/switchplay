import C from '../Constants'
import { status, parseResponse, logError, fetchStart, fetchEnd, fetchThenDispatch } from './CommonActions'
import { hideDemoForm } from '../core/websiteHelpers'
export const createNonuser = (requestType, details, redirectTo) => dispatch =>{
    console.log("createNonuser", requestType, details)
	fetchThenDispatch(dispatch, 
		`saving.${requestType}`,
		{
			url: `/api/${requestType}`,
			method:'POST',
			body: JSON.stringify(details),
			nextAction: () => {
				hideDemoForm(false);
		        return { type:C.OPEN_DIALOG, path:`saved_${requestType}` }
			}
		})
}