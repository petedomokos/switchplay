import C from '../Constants'
import { status, parseResponse, logError, 
	fetchStart, fetchEnd, fetchThenDispatch} from './CommonActions'
import auth from '../auth/auth-helper'
import { signout } from './AuthActions.js';
import { transformJourneyForClient } from "./JourneyActions"

export const transformUserForClient = serverUser => {
	const { journeys } = serverUser;
	return {
		...serverUser,
		journeys:journeys.map(j => transformJourneyForClient(j))
	}
}


export const createUser = user => dispatch => {
	fetchThenDispatch(dispatch, 
		'creating.user',
		{
			url: '/api/users/',
			method: 'POST',
			body:JSON.stringify(user),
			requireAuth:true,
			//this action will also set dialog.createUser = true
			nextAction: data => {
				if(auth.isAuthenticated()){
					//in this case, we need the new user and the sign up mesg
					return { type:C.CREATE_NEW_ADMINISTERED_USER, mesg:data.mesg, user:transformUserForClient(data.user) }
				}else{
					//in this case, server will send a mesg
					return { type:C.SIGN_UP, mesg:data.mesg }
				}
			}
		})
}

//to fetch a user in full
export const fetchUser = id => dispatch => {
	fetchThenDispatch(dispatch, 
		'loading.user',
		{
			url: '/api/users/'+id, 
			requireAuth:true,
			nextAction: data => {
				const jwt = auth.isAuthenticated();
				//may be reloading the signed in user
				if(jwt.user._id === data._id){
					console.log('siging in to store again', data.username)
					return { type:C.SIGN_IN, user:transformUserForClient(data) };
				}
				console.log('loading another user into user', data.username)
				return { type:C.LOAD_USER, user:transformUserForClient(data) };
			}
		}) 
}

export const fetchUsers = () => dispatch => {
	fetchThenDispatch(dispatch, 
		'loading.users',
		{
			url: '/api/users', 
			requireAuth:true,
			nextAction: data => { return { type:C.LOAD_USERS, users:data } }
		}) 
}

export const updateUser = (id, formData, history) => dispatch => {
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: '/api/users/'+id,
			method: 'PUT',
			headers:{
	        	'Accept': 'application/json'
	      	},
			body:formData, //not stringify as its a formidable object
			requireAuth:true,
			nextAction: data => {
				history.push("/")
				const jwt = auth.isAuthenticated();
				if(jwt.user._id === data._id){
					return { type:C.UPDATE_SIGNEDIN_USER, user:data };
				}
				return { type:C.UPDATE_ADMINISTERED_USER, user:data }
			}
		})
}
export const deleteUserAccount = (id, history) => dispatch => {
	fetchThenDispatch(dispatch, 
		'deleting.user',
		{
			url: '/api/users/'+id,
			method: 'DELETE',
			requireAuth:true,
			//todo - only signout if user being deleted was signed in
			nextAction: data => {
				history.push('/')
				const jwt = auth.isAuthenticated();
				if(jwt.user._id === data._id){
					return { type:C.SIGN_OUT };
				}
				return { type:C.DELETE_ADMINISTERED_USER, user:data }
			}
		})
}