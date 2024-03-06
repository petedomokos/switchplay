import C from '../Constants'
import { status, parseResponse, logError, fetchStart, fetchEnd, fetchThenDispatch} from './CommonActions'
import auth from '../auth/auth-helper'
import { transformUserForClient } from "./UserActions"
import { getMockUser } from "../mock/mockDatabases/users"

export const signin = (user, history, redirectTo) => dispatch =>{
	const mockUser = getMockUser(user.emailOrUsername);
	if(mockUser){
		console.log("mockUser", mockUser)
		const userCredentials = {
			email:mockUser.email, 
			_id:mockUser._id, 
			isSystemAdmin:false, 
			isPlayer:mockUser.isPlayer,
			isMock:true
		}
		const jwt = { user:userCredentials, token:"mock-token" }

		auth.authenticate(jwt, () => {
			history.push(redirectTo || "/")
		})
		dispatch({ type:C.SIGN_IN, user:transformUserForClient(mockUser) });
		return;
	}
	console.log("not mock user")
	fetchThenDispatch(dispatch, 
		'loading.user',
		{
			url: '/auth/signin/',
			method:'POST',
			body: JSON.stringify(user),
			nextAction: data => {
				//console.log("signin next action....", data)
				//save to session storage
				//we will store anything here which is to do with site settings or authentication ( as opposed to data, whihc is in the redux store )
				const userCredentials = {email:data.user.email, _id:data.user._id, isSystemAdmin:data.user.isSystemAdmin, isPlayer:data.user.isPlayer}
				const jwt = {...data, user:userCredentials}
				auth.authenticate(jwt, () => {
				  	history.push(redirectTo || "/")
		        })
		        //save to store
		        return {
					type:C.SIGN_IN, user:transformUserForClient(data.user)
				}
			}
		})
}

export const signout = history => dispatch =>{
	fetchThenDispatch(dispatch, 
		'signingOut',
		{
			url: '/auth/signout/',
			headers:{},
			nextAction: data => {
      			//delete jwt
				auth.clearJWT()
				//return to home
				history.push('/')
				//clear user in store
				return {type:C.SIGN_OUT}
			}
		})
}