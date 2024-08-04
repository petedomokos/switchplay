import * as d3 from 'd3';
import C from '../Constants'
import { status, parseResponse, logError, 
	fetchStart, fetchEnd, fetchThenDispatch} from './CommonActions'
import auth from '../auth/auth-helper'
import { signout } from './AuthActions.js';
import { transformJourneyForClient } from "./JourneyActions"
import { initDeck } from '../data/initDeck';
import { hydrateDeckSections } from '../data/sections';
import uuid from 'react-uuid';
import { addWeeks } from '../util/TimeHelpers';
import { userIdIsMock, getMockUserById } from '../mock/mockDatabases/users';
import { sortAscending } from '../util/ArrayHelpers';
import { addHardcodedDataToUser } from "../data/hardcodedData/users";
import { createPlayerFromUser } from '../util/userHelpers';

export const transformGroupForClient = group => ({
	...group,
	kpis:group.kpis.map(kpi => ({ ...kpi, key:`${kpi.datasetKey}-${kpi.measureKey}`}))
})

export const transformTableForClient = serverTable => {
	//console.log("transformTableForClient", serverTable)
	const { created, updated, ...clientTable } = serverTable;
	return {
		...clientTable,
		created:new Date(created),
		updated:updated ? new Date(updated) : null,
		id:serverTable._id,
	}
}

export const transformDeckForClient = (serverDeck, userPlayer) => {
	console.log("tDFC.............", serverDeck)
	console.log("userPlayer", userPlayer)
	const { created, updated, cards, purpose=[], sections, tags, frontCardId, player, ...rest } = serverDeck;
	//ensure prupose has at least two paragraphs
	const hydratedPurpose = purpose.length === 0 ? ["",""] : purpose.length === 1 ? [purpose[0], ""] : purpose;
	const hydratedDeckSections = hydrateDeckSections(sections ? JSON.parse(sections) : undefined);
	//console.log("hydratedDeckSections", hydratedDeckSections)
	//legcy - until they are newly saved, we will have some cardNrs that start from 0
	const parsedCards = JSON.parse(cards).map(c => ({
		...c,
		startDate:null, //legacy - can remove later
		cardNr:null,
		id:c.id || uuid(), //legacy - add uuid - can remove this func call later
		date:new Date(c.date),
		items:c.items.map(it => ({ 
			...it, 
			status:it.status || 0, 
			id:it.id || uuid(),
			//legacy additions
			title:it.title || "",
			steps:it.steps || [],
			stats:it.stats || [],
			attachments:it.attachments || [],
			people:it.people || [userPlayer],
		})),
		kpis:c.kpis || []
	}))

	const sortedCards = sortAscending(parsedCards, d => d.date).map((c,i) => ({ ...c, cardNr:i }))
	console.log("parsed and sorted Cards", sortedCards)
	const now = new Date();
	const earliestCardDate = sortedCards[0]?.date; //d3.min(parsedCards, c => c.date);

	//legacy code to ensure all decks have startDate - can remove after next update into db
	const customStartDate = serverDeck.customStartDate ? new Date(serverDeck.customStartDate) : null;
	const startDate = customStartDate && customStartDate < earliestCardDate ? 
		customStartDate : addWeeks(-1, (earliestCardDate || now))

	return {
		...rest,
		startDate,
		frontCardId, //shouldnt be needed beyond this point?
		created:new Date(created),
		updated:updated ? new Date(updated) : null,
		id:serverDeck._id,
		purpose:hydratedPurpose,
		tags:tags?.map(tag => JSON.parse(tag)) || [],
		sections:hydratedDeckSections,
		cards:sortedCards,
		//if player is nt the user, it will have been populated on the server
		player:typeof player ===  "string" ? userPlayer : player
	}
}

export const transformDeckForServer = clientDeck => {
	const { id, cards, sections, tags=[], player, group, ...rest } = clientDeck;
	//console.log("transDFS.....clientDeck", clientDeck)
	return {
		...rest,
		//frontCardId is either a specific card, none (all cards placed) or current, which defaults to current card,
		cards:JSON.stringify(cards),
		sections:JSON.stringify(sections),
		tags:tags.map(tag => JSON.stringify(tag)),
		player:player ? player._id : null,
		group:group ? group._id : null
	}
}
 
//getMock functions below
export const transformUserForClient = serverUser => {
	console.log("transformUserForClient", serverUser)
	const { journeys=[], photos=[], decks=[], tables=[], groups=[] } = serverUser;
	const hydratedPhotos = photos.map(p => ({ ...p, added: new Date(p.added) }))
	//@todo - check will we ever use this for updating journeys? I dont think we need it 
	const hydratedJourneys = journeys.map(j => transformJourneyForClient(j));
	return {
		...serverUser,
		photos:hydratedPhotos,
		journeys:hydratedJourneys,
		tables:tables.map(t => transformTableForClient(t)),
		decks:decks.map(d => transformDeckForClient(d, createPlayerFromUser(serverUser))),
		groups:groups.map(g => tranformGroupForClient(g))
	}
}


export const createUser = user => dispatch => {
	console.log("createUser...........")
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
	console.log("fetchuser.....................", id)
	//mock users
	const mockUser = getMockUserById(id);
	if(mockUser){
		console.log("mock user..................")
		dispatch({ type:C.SIGN_IN, user:transformUserForClient(mockUser) });
		return;
	}
	//normal users
	fetchThenDispatch(dispatch, 
		'loading.user',
		{
			url: '/api/users/'+id,
			requireAuth:true,
			nextAction: data => {
				const jwt = auth.isAuthenticated();
				//may be reloading the signed in user
				console.log("user returned from server", data)
				const transformedUser = transformUserForClient(data);
				console.log("transformeduser", transformedUser)
				const user = addHardcodedDataToUser(transformedUser);
				console.log("userwithhardcodeddata", user)
				return {
					type:jwt.user._id === data._id ? C.SIGN_IN : C.LOAD_USER, 
					user 
				};
			}
		}) 
}

export const fetchUsers = () => dispatch => {
	console.log("fetchUsers.............")
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
		console.log("updateUser............")
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

export const createTable = (settings={}) => dispatch => {
	const jwt = auth.isAuthenticated();
	if(!jwt.user || jwt.user.isMock) { return; }
	
	const table = { owner: jwt.user._id, ...settings };

	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/tables`,
			method: 'POST',
			body:JSON.stringify(table),
			requireAuth:true,
			nextAction: data => {
				return { type:C.CREATE_TABLE, table:data }
			}
		}
	)
}

export const updateTable = (table, shouldPersist=true, shouldUpdateStore=true) => dispatch => {
	//update in store
	dispatch({ type:C.UPDATE_TABLE, table });

	if(!shouldPersist || table.isMock){ return; }

	const jwt = auth.isAuthenticated();
	if(!jwt.user || jwt.user.isMock) { return; }

	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/tables`,
			method: 'PUT',
			body:JSON.stringify({ table }),
			requireAuth:true
		}
	)
}

export const createDeck = (user, options, tableId) => dispatch => {
	const jwt = auth.isAuthenticated();
	if(jwt?.user.isMock){ return; }
	//@todo - move this to server
	console.log("createDeck user", user)

	const deck = options?.copy || initDeck(user, options);
	//@todo - keep a copy of the player in case it is not populated on server eg if player is the user
	//@todo - populate player on server unless player is the user
	const userPlayer = options.player?._id === jwt.user._id ? options.player : null;
	console.log("userPlayer", userPlayer)
	console.log("createDeck", deck)
	const serverDeck = transformDeckForServer(deck);
	console.log("serverDeck", serverDeck)
	const requestBody = { deck:serverDeck, tableId }
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks`,
			method: 'POST',
			body:JSON.stringify(requestBody),
			requireAuth:true,
			nextAction: data => {
				console.log("deck returned from server", data)
				const d = transformDeckForClient(data, userPlayer);
				console.log("d", d)
				return { type:C.CREATE_DECK, deck:d, tableId }
				//return { type:C.CREATE_DECK, deck: transformDeckForClient(data), tableId }
			}
		}
	)
}

export const updateDeck = (deck, shouldPersist=true) => dispatch => {
	//update in store
	dispatch({ type:C.UPDATE_DECK, deck });

	if(!shouldPersist || deck.isMock){ return; }

	const jwt = auth.isAuthenticated();
	if(!jwt.user || jwt?.user.isMock) { return;}

	const serverDeck = transformDeckForServer(deck);
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks`,
			method: 'PUT',
			body:JSON.stringify(serverDeck),
			requireAuth:true
		}
	)
}

export const updateDecks = (details, shouldPersist=true) => dispatch => {
	const { desc } = details;
	//update in store
	dispatch({ type:C.UPDATE_DECKS, details });

	if(!shouldPersist){ return; }

	const jwt = auth.isAuthenticated();
	if(!jwt.user || jwt.user.isMock) { return; }

	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks/update`,
			method: 'PUT',
			body:JSON.stringify(details),
			requireAuth:true
		}
	)
}

export const deleteDeck = (deckId, table, shouldPersist=true) => dispatch => {
	//update in store
	dispatch({ type:C.DELETE_DECK, deckId, table });

	if(!shouldPersist){ return; }

	const jwt = auth.isAuthenticated();
	if(!jwt.user || jwt.user.isMock) { return; }

	//work out why thus isnt callintg remove
	//then put updateTble back in too, and see if they both work
	fetchThenDispatch(dispatch, 
		'updating.user',
		{
			url: `/api/users/${jwt.user._id}/decks`,
			method: 'DELETE',
			body:JSON.stringify({ deckId, table }),
			requireAuth:true,
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