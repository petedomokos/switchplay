import C from '../Constants'
import { status, parseResponse, logError, 
	fetchStart, fetchEnd, fetchThenDispatch} from './CommonActions'
import auth from '../auth/auth-helper'
import { signout } from './AuthActions.js';
import { transformJourneyForClient } from "./JourneyActions"
import { initDeck } from '../data/cards';

export const transformDeckForClient = serverDeck => {
	console.log("transformDeckForClient", serverDeck)
	const { created, updated, cards, ...clientDeck } = serverDeck;
	return {
		...clientDeck,
		created:new Date(created),
		updated:updated ? new Date(updated) : null,
		id:serverDeck._id,
		cards:JSON.parse(cards).map(c => ({
			...c,
			date:new Date(c.date),
			items:c.items.map(it => ({ ...it, status:it.status || 0 }))
		}))
	}
}

export const transformDeckForServer = clientDeck => {
	const { id, cards, ...serverDeck } = clientDeck;
	return {
		...serverDeck,
		cards:JSON.stringify(cards)
	}
}


export const transformUserForClient = serverUser => {
	//console.log("transformUserForClient", serverUser)
	const { journeys=[], photos=[], decks=[] } = serverUser;
	const hydratedPhotos = photos.map(p => ({ ...p, added: new Date(p.added) }))
	//@todo - check will we ever use this for updating journeys? I dont think we need it 
	const hydratedJourneys = journeys.map(j => transformJourneyForClient(j))
	return {
		...serverUser,
		photos:hydratedPhotos,
		journeys:hydratedJourneys,
		decks:decks.map(s => transformDeckForClient(s))
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
				//console.log("load user returned", data)
				const jwt = auth.isAuthenticated();
				//may be reloading the signed in user
				if(jwt.user._id === data._id){
					//need to replicate this logic on the signin page too somehow, or point it to here
					//first - 
					//console.log('siging in to store again', data.username)
					return { type:C.SIGN_IN, user:transformUserForClient(data) };
				}
				//console.log('loading another user into user', data.username)
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
			nextAction: data => { 
				return { 
					type:C.LOAD_USERS, users:data.map(user => transformUserForClient(user)) 
				} 
			}
		}) 
}

export const updateUser = (id, formData, history) => dispatch => {
	//setTimeout(() => {
		fetchThenDispatch(dispatch, 
			'updating.user',
			{
				url: '/api/users/'+id,
				method: 'PUT',
				headers:{
					'Accept': 'application/json',
				  },
				body:formData, //not stringify as its a formidable object
				requireAuth:true,
				nextAction: data => {
					if(history){
						history.push("/");
					}
					const jwt = auth.isAuthenticated();
					if(jwt.user._id === data._id){
						//we still call transform function even though it may not be all fields
						return { type:C.UPDATE_SIGNEDIN_USER, user:transformUserForClient(data)};
					}
					return { type:C.UPDATE_ADMINISTERED_USER, user:transformUserForClient(data) }
				}
			}
		)
	//}, 2000)
}

export const createDeck = settings => dispatch => {
	const jwt = auth.isAuthenticated();
	const deck = initDeck(jwt.user._id);
	console.log("createDeck", deck)
	//save to store with temp id so an icon is displayed to show its saving
	dispatch({ type:C.CREATE_DECK, deck:deck });
	//now try it with persistance too
	//also need to add a pos property to each deck in model

	const serverDeck = transformDeckForServer(deck);
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks`,
			method: 'POST',
			body:JSON.stringify(serverDeck),
			requireAuth:true,
			nextAction: data => {
				console.log("response data", data)
				return { type:C.UPDATE_NEW_DECK_ID, newDeckId: data._id }
			}
		}
	)
}

export const updateDecks = (decks, shouldPersist) => dispatch => {
	console.log("updateDecks", decks)
	//update in store
	dispatch({ type:C.UPDATE_DECKS, decks });

	if(!shouldPersist){ return; }

	const jwt = auth.isAuthenticated();
	if(!jwt.user) {
		console.log("no user signed in");
		return;
	}

	const serverDecks = decks.map(d => transformDeckForServer(d));
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks`,
			method: 'PUT',
			body:JSON.stringify(serverDecks),
			requireAuth:true
		}
	)
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