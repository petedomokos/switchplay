import C from './Constants'
import _, { map } from 'lodash'
import * as cloneDeep from 'lodash/cloneDeep'
import { isIn, isNotIn, isSame, filterUniqueById, filterUniqueByProperty } from './util/ArrayHelpers'
import { InitialState } from './InitialState'
import { hydrateDatapoints, hydrateDataset, hydrateDatasets } from "./data/datasets";
import { hydrateUser, hydrateUsers } from './user/userHelpers';
//HELPERS

//STORE
export const user = (state=InitialState.user, act) =>{
	switch(act.type){
		//SIGNED IN USER
		case C.SIGN_IN:{
			const { _id, admin, administeredUsers, administeredGroups, groupsMemberOf, journeys } = act.user;
			
			//HYDRATION
			//note - we will need to re-hydrate when the deep versions are loaded too
			//1. datasets
			const administeredDatasets = hydrateDatasets(act.user.administeredDatasets);
			const datasetsMemberOf = hydrateDatasets(act.user.datasetsMemberOf);
			//2. users todo
			//3. groups todo
			
			return { 
				...state, 
				...hydrateUser(act.user),
				//we hydrate them here and in loaded, but this doesnt repeat w
				administeredDatasets,
				datasetsMemberOf,
				//temp- add playerid to journeys
				journeys:journeys.map(j => ({ ...j, playerId: j.playerId || _id })),
				//store the deeper objects here in one place
				loadedUsers:filterUniqueById([...hydrateUsers(admin), ...hydrateUsers(administeredUsers)]), //later iterations will have following etc
				loadedGroups:filterUniqueById([...administeredGroups, ...groupsMemberOf]),
				loadedDatasets:filterUniqueById([...administeredDatasets, ...datasetsMemberOf])
			}
		}
		case C.SIGN_OUT:{
			return InitialState.user;
		}
		case C.UPDATE_SIGNEDIN_USER:{
			const updatedUserPhotos = act.user.photos || [];
			const updatedUserJourneys = act.user.journeys || [];
			//note, photos and journeys arrays from server are always present but may not be complete, and may be empty
			const otherPhotos = state.photos.filter(p => !updatedUserPhotos.find(ph => ph._id === p._id));
			const mergedPhotos = [...otherPhotos, ...updatedUserPhotos];
			const otherJourneys = state.journeys.filter(j => !updatedUserJourneys.find(jo => jo._id === j._id));
			const mergedJourneys = [...otherJourneys, ...updatedUserJourneys];
			//this doesnt update administered users or groups, just basic details eg name, email,...
			//aswell as photos and journeys
			return { ...state, ...act.user, photos:mergedPhotos, journeys:mergedJourneys };
		}
		case C.CREATE_TABLE:{
			return {
				...state,
				tables:[...state.tables, act.table]
			};
		}
		case C.UPDATE_TABLE:{
			return {
				...state,
				tables:state.tables.map(t => t.id === act.table.id ? { ...t, ...act.table } : t)
			};
		}
		//this is generally called before new deck is persisted to server
		case C.CREATE_DECK:{
			return {
				...state,
				tables:state.tables.map(t => t.id !== act.tableId ? t : { ...t, decks:[...t.decks, act.deck.id] }),
				decks:[...state.decks, act.deck]
			};
		}
		case C.UPDATE_DECK:{
			return {
				...state,
				decks:state.decks.map(d => d.id === act.deck.id ? { ...d, ...act.deck } : d)
			};
		}
		case C.UPDATE_DECKS:{
			const { details:{ desc } } = act;
			let decks;
			if(desc === "item-title"){
				const { cardNr, itemNr, title } = act.details;
				decks = state.decks.map(d => ({ 
					...d, 
					cards:d.cards.map(c => c.cardNr !== cardNr ? c : ({
						...c,
						items:c.items.map(it => it.itemNr !== itemNr ? it : ({
							...it,
							title
						}))
					}))
				}))
			}else if(desc === "card-title"){
				const { cardNr, title } = act.details;
				decks = state.decks.map(d => ({ 
					...d, 
					cards:d.cards.map(c => c.cardNr !== cardNr ? c : ({ ...c, title }))
				}))
			}else{
				//section
				const { origSectionKey, section } = act.details;
				console.log("reducer orig sect", origSectionKey, section)
				console.log("state.decks before", state.decks.filter(d => d.title))
				decks = state.decks.map(d => {
					//if(d.title){
						//console.log("title", d.title) 
						//console.log("sections", d.sections)
					//}
					return {
						...d, 
						sections:d.sections.map(s => {
							/*if(d.title){
								console.log("testing s", s)
								console.log("key origKey", s.sectionKey, origSectionKey)
								console.log("shouldReplace?", s.sectionKey === origSectionKey)
								const newSection = s.key === origSectionKey ? section : s;
								console.log("newsection", newSection)
							}*/
							return s.key === origSectionKey ? section : s;
						})
					}
				})
				console.log("new decks", decks.filter(d => d.title))
			}
			return { ...state, decks };
		}
		case C.DELETE_DECK:{
			return {
				...state,
				decks:state.decks.filter(d => d.id !== act.deckId),
				tables:state.tables.map(t => t.id !== act.table.id ? t : ({ ...t, ...act.table }))
			};
		}
		case C.SAVE_JOURNEY:{
			//const { journey } = act;
			//temp - for now, we fake playerid here,a dn it is always userId
			const journey = { 
				...act.journey,
				//temp/legacy - our test journey has no playerId
				playerId:act.journey.playerId || state._id 
			}
			const currentJourney = state.journeys.find(j => j._id === journey._id);
			if(!currentJourney){
				//_id will be 'temp' here until saved on server
				return {
					...state,
					journeys:[journey, ...state.journeys],
				}
			}
			return {
				...state,
				journeys:state.journeys.map(j => j._id === journey._id ? journey : j)
			}
		}
		case C.SAVE_NEW_JOURNEY_ID:{
			//note - atm, we auto update homeJourney to be the latest new journey
			const { _id } = act;
			return {
				...state,
				journeys:state.journeys.map(j => j._id === "temp" ? { ...j, _id } : j),
				//if homeJoureny is temp, its this one so update with actual id
				homeJourney:state.homeJourney === "temp" ? _id : state.homeJourney
			}
		}
		//OTHER USERS AND GROUPS
		//CREATE
		case C.CREATE_NEW_ADMINISTERED_USER:{
			return { 
				...state, 
				administeredUsers:[...state.administeredUsers, act.user],
				loadedUsers:[...state.loadedUsers, act.user]
			}
		}
		case C.CREATE_NEW_ADMINISTERED_GROUP:{
			return { 
				...state, 
				administeredGroups:[...state.administeredGroups, act.group],
				loadedGroups:[...state.loadedGroups, act.group]
			}
		}
		case C.CREATE_NEW_ADMINISTERED_DATASET:{
			return { 
				...state, 
				administeredDatasets:[...state.administeredDatasets, act.dataset],
				loadedDatasets:[...state.loadedDatasets, act.dataset]
			}
		}
		//all datapoints must be from same dataset
		case C.CREATE_NEW_DATAPOINTS:{
			if(act.datapoints.length === 0) { return state; }
			//note - we can assume all are from same dataset
			const datasetToUpdate = state.loadedDatasets.find(dset => dset._id === act.datasetId);
			//add player info to datapoint so we dont have to wait for server to populate the d.player property
			const datapointsToAdd = act.datapoints.map(d => ({
				...d,
				//first check if the player is the signedin user, otherwise find the player in loadedUsers
				player:d.player === state._id ? state.player : state.loadedUsers.find(u => u._id === d.player)
			}))
			const hydratedDatapointsToAdd = hydrateDatapoints(datapointsToAdd, datasetToUpdate.rawMeasures, datasetToUpdate.derivedMeasures);
			//may have not loaded deep dataset 
			if(!datasetToUpdate?.datapoints) { return state; }
			const updatedDataset = {
				...datasetToUpdate,
				datapoints:[...datasetToUpdate.datapoints, ...hydratedDatapointsToAdd]
			};
			return { 
				...state, 
				loadedDatasets:filterUniqueById([updatedDataset, ...state.loadedDatasets])
			}
		}
		case C.CREATE_NEW_DATAPOINT:{
			//add player info to datapoint (we only really need firstname and surname)
			const datapointToAdd = {
				...act.datapoint,
				player:state.loadedUsers.find(u => u._id === act.datapoint.player)
			}
			const datasetToUpdate = state.loadedDatasets.find(dset => dset._id === act.datasetId);
			const updatedDataset = {
				...datasetToUpdate,
				datapoints:[...datasetToUpdate.datapoints, datapointToAdd]
			};
			return { 
				...state, 
				loadedDatasets:filterUniqueById([updatedDataset, ...state.loadedDatasets])
			}
		}
		//UPDATE (overwrite properties with any updated or new ones)

		case C.UPDATE_ADMINISTERED_USER:{
			//we only update in loadedUsers, as _id doesnt ever change
			const userToUpdate = state.loadedUsers.find(us => us._id === act.user._id);
			const updatedUser = { ...userToUpdate, ...act.user }
			//use filter to remove old version, and add updated version
			return {
				...state,
				loadedUsers:filterUniqueById([updatedUser, ...state.administeredUsers])
			}
		}

		case C.UPDATE_ADMINISTERED_GROUP:{
			//we only update in loadedUsers, as _id doesnt ever change
			const groupToUpdate = state.loadedGroups.find(g => g._id === act.group._id);
			const updatedGroup = { ...groupToUpdate, ...act.group };
			var updatedLoadedUsers = state.loadedUsers;
			//adding and removing players -> add/remove groupId from affected players
			if(!isSame(groupToUpdate.players, updatedGroup.players)){
				const playersAdded = updatedGroup.players.filter(player => !isIn(groupToUpdate.players, player)).map(p => p._id)
				const playersRemoved = groupToUpdate.players.filter(player => !isIn(updatedGroup.players, player)).map(p => p._id)
				updatedLoadedUsers = state.loadedUsers.map(user =>{
					//only add groupId to user if groupsMemberOf is loaded (ie deep version of user is loaded)
					if(!user.groupsMemberOf){
						return user;
					}
					if(playersAdded.includes(user._id)){
						//add groupId to user
						return { ...user, groupsMemberOf:[...user.groupsMemberOf, act.group]}
					}
					if(playersRemoved.includes(user._id)){
						//remove groupId from user
						return { ...user, groupsMemberOf:user.groupsMemberOf.filter(g => g._id !== act.group._id) }
					}
					//no change
					return user
				});
			}
			//use filter to remove old version, and add updated version
			return {
				...state,
				loadedGroups:filterUniqueById([updatedGroup, ...state.administeredGroups]),
				loadedUsers:updatedLoadedUsers
			}
		}

		case C.UPDATE_ADMINISTERED_DATASET:{
			const datasetToUpdate = state.loadedDatasets.find(dset => dset._id === act.dataset._id);
			const updatedDataset = { ...datasetToUpdate, ...act.dataset };
			//remove old version, and add updated version
			return {
				...state,
				loadedDatasets:filterUniqueById([updatedDataset, ...state.administeredDatasets])
			}
		}
		//DELETE
		//must remove from both administered and loaded arrays
		case C.DELETE_ADMINISTERED_USER:{
			//must also remove the userId from any users administeredGroups
			const updatedLoadedUsers = state.loadedUsers
				.filter(us => us._id !== act.user._id)
				.map(user =>{
					//if deep version of user is loaded and user was in the administered list
					if(user.administeredUsers && isIn(user.administeredUsers, act.user)){
						//remove groupId from list
						return { 
							...user, 
							administeredUsers:user.administeredUsers.filter(g => g._id !== act.user._id)
						}
					}
					return user;
				})

			return {
				...state,
				administeredUsers:state.administeredUsers.filter(us => us._id !== act.user._id),
				loadedUsers:updatedLoadedUsers
			}
		}
		case C.DELETE_ADMINISTERED_GROUP:{
			//must also remove the groupId from any users administeredGroups
			const updatedLoadedUsers = state.loadedUsers
				.map(user =>{
					//if deep version of user is loaded and group was in the administered list
					if(user.administeredGroups && isIn(user.administeredGroups, act.group)){
						//remove groupId from list
						return { 
							...user, 
							administeredGroups:user.administeredGroups.filter(g => g._id !== act.group._id)
						}
					}
					return user;
				})

			return {
				...state,
				administeredGroups:state.administeredGroups.filter(g => g._id !== act.group._id),
				loadedGroups:state.loadedGroups.filter(g => g._id !== act.group._id),
				loadedUsers:updatedLoadedUsers

			}
		}

		case C.DELETE_ADMINISTERED_DATASET:{
			//must also remove the datasetId from any users administeredDatasets
			const updatedLoadedUsers = state.loadedUsers
				.map(user =>{
					//if deep version of user is loaded and dataset was in the administered list
					if(user.administeredDatasets && isIn(user.administeredDatasets, act.dataset)){
						//remove datasetId from list
						return { 
							...user, 
							administeredDatasets:user.administeredDatasets.filter(dset => dset._id !== act.dataset._id)
						}
					}
					return user;
				})

			return {
				...state,
				administeredDatasets:state.administeredDatasets.filter(dset => dset._id !== act.dataset._id),
				loadedDatasets:state.loadedDatasets.filter(dset => dset._id !== act.dataset._id),
				loadedUsers:updatedLoadedUsers

			}
		}

		//LOAD EXISTING FROM SERVER
		
		
		//1. SINGLE DEEP LOADS -------------------------------------------------------------------------------------
		//Note 1 - this cannot be the signed in user - they are always loaded fully
		//Note 2 - this will overwrite/enhance any existing objects rather than replace
		case C.LOAD_USER:{
			const { admin, administeredUsers, administeredGroups, groupsMemberOf } = act.user;
			console.log("LOAD_USER", act.user)

			//hydration
			//note - we will need to re-hydrate when the deep versions are loaded too
			//1. datasets
			//no need to rehydrate if these have not updated
			const administeredDatasets = act.user.administeredDatasets ? 
				hydrateDatasets(act.user.administeredDatasets) :
				state.administeredDatasets;

			const datasetsMemberOf = act.user.datasetsMemberOf ?
				hydrateDatasets(act.user.datasetsMemberOf) :
				state.datasetsMemberOf;
			//2. users - todo
			//3. groupd - todo

			//TODO - sort these - do we need?
			//All teh following groups come in from server in shallow form, not just flat ids.
			//we save them to teh central group store, to be accessed when required by containers
			const mergedAdmin = admin.map(adminUser => {
				const existingVersion = state.loadedUsers.find(us => us._id === adminUser._id) || {};
				//override any properties in latest version from server, in case of database changes from elsewhere
				//but maintain any properties not sent from server ie deep properties
				return { ...existingVersion, ...adminUser }
			})
			const mergedAdministeredUsers = administeredUsers.map(administeredUser => {
				const existingVersion = state.loadedUsers.find(us => us._id === administeredUser._id) || {};
				//override any properties in latest version from server, in case of database changes from elsewhere
				//but maintain any properties not sent from server ie deep properties
				return { ...existingVersion, ...administeredUser }
			})
			const mergedAdministeredGroups = administeredGroups.map(adminGroup => {
				const existingVersion = state.loadedGroups.find(us => us._id === adminGroup._id) || {};
				//override any properties from server, but maintain any other properties
				return { ...existingVersion, ...adminGroup }
			})
			const mergedGroupsMemberOf = groupsMemberOf.map(groupMemberOf => {
				const existingVersion = state.loadedGroups.find(us => us._id === groupMemberOf._id) || {};
				//override any properties from server, but maintain any other properties
				return { ...existingVersion, ...groupMemberOf }
			})
			const mergedDatasetsMemberOf = datasetsMemberOf
				//.map(dset => hydrateDataset(dset))
				.map(dataset => {
					const existingVersion = state.loadedDatasets.find(dset => dset._id === dataset._id) || {};
					//override any properties from server, but maintain any other properties
					return { ...existingVersion, ...dataset }
				})

			const mergedAdministeredDatasets = administeredDatasets
				//.map(dset => hydrateDataset(dset))
				.map(dataset => {
					const existingVersion = state.loadedDatasets.find(us => us._id === dataset._id) || {};
					//override any properties from server, but maintain any other properties
					return { ...existingVersion, ...dataset }
				})

			//@TODO - put this in a hydrateUser function

			const user = hydrateUser(act.user);

			return { 
				...state,
				//replace items with hydrated versions
				administeredDatasets,
				administeredGroups,
				administeredUsers,
				//user is deep , so we overide any existing version
				loadedUsers:[user, ...state.loadedUsers],
				loadedDatasets:filterUniqueById([...mergedAdministeredDatasets, ...mergedDatasetsMemberOf, ...state.loadedDatasets]), //??????????????????????????????
				loadedGroups:filterUniqueById([...mergedAdministeredGroups, ...mergedGroupsMemberOf, ...state.loadedGroups]) //?????????????????????
			}
		}
		case C.LOAD_GROUP:{
			const { admin, players, datasets } = act.group;
			/*const mergedAdmin = admin.map(adminUser => {
				const existingVersion = state.loadedUsers.find(us => us._id === adminUser._id) || {};
				//override any properties in latest version from server, in case of database changes from elsewhere
				//but maintain any properties not sent from server ie deep properties
				return { ...existingVersion, ...adminUser }
			})*/
			const mergedPlayers = players.map(player => {
				const existingVersion = state.loadedUsers.find(us => us._id === player._id) || {};
				//override any properties in latest version from server, in case of database changes from elsewhere
				//but maintain any properties not sent from server ie deep properties
				return { ...existingVersion, ...player }
			})
			//no need to update signedin player as they will be deep loaded anyway
			const nonSignedInPlayers = mergedPlayers.filter(u => u._id !== state._id)
			return { 
				...state,
				//group is deep, so we will override any existing version
				loadedGroups:filterUniqueById([act.group, ...state.loadedGroups]),
				loadedUsers:filterUniqueById([/*...mergedAdmin, */ ...nonSignedInPlayers, ...state.loadedUsers])
			}
		}

		case C.LOAD_DATASET:{
			return { 
				...state,
				//dataset is deep, so we will override any existing version
				loadedDatasets:filterUniqueById([hydrateDataset(act.dataset), ...state.loadedDatasets]),
			}
		}
		//2. MULTIPLE SHALLOW LOADS -------------------------------------------------------------------------------------

		//FOR NOW, THIS GETS US ALL USERS, SO WE JUST SET LOADSCOMPLETE=TRUE THE FIRST TIME
		//IN FUTURE, WE WILL NEED TO KNOW HOW MANY USERS ARE AVAILABLE ON SERVER
		case C.LOAD_USERS:{
			//these user objects will be shallow, so we dont overwrite any 
			//existing deeper versions, so if user already exists, then it is not loaded
			const usersNotLoadedBefore = act.users
				.filter(us => us._id !== state._id)
				.filter(us => !state.loadedUsers.find(u => u._id === us._id))
			
			//for now, all users are sent first time
			return { 
				...state, 
				loadedUsers:[...state.loadedUsers, ...hydrateUsers(usersNotLoadedBefore)],
				loadsComplete:{ ...state.loadsComplete, users:'complete' }
			}
		}
		//FOR NOW, THIS GETS US ALL GROUPs, SO WE JUST SET LOADSCOMPLETE=TRUE THE FIRST TIME
		//IN FUTURE, WE WILL NEED TO KNOW HOW MANY GROUPS ARE AVAILABLE ON SERVER
		case C.LOAD_GROUPS:{
			//these user objects will be shallow, so we dont overwrite any 
			//existing deeper versions, so if user already exists, then it is not loaded
			const groupsNotLoadedBefore = act.groups
				.filter(grp => !state.loadedGroups.find(g => g._id === grp._id))

			return { 
				...state, 
				loadedGroups:[...state.loadedGroups, ...groupsNotLoadedBefore],
				loadsComplete:{ ...state.loadsComplete, groups:'complete' }
			}
		}
		default:{
			return state
		}

		//FOR NOW, THIS GETS US ALL DATASETs, SO WE JUST SET LOADSCOMPLETE=TRUE THE FIRST TIME
		//IN FUTURE, WE WILL NEED TO KNOW HOW MANY DATASETS ARE AVAILABLE ON SERVER
		case C.LOAD_DATASETS:{
			//these user objects will be shallow, so we dont overwrite any 
			//existing deeper versions, so if user already exists, then it is not loaded
			const datasetsNotLoadedBefore = act.datasets
				.filter(dataset => !state.loadedDatasets.find(dset => dset._id === dataset._id))
			//not sure if we need derivedmeasures for shallow datastes, probably not
			//const dsetsToAddWithDerivedMeasures = datasetsNotLoadedBefore
				//.map(dset => ({...dset, derivedMeasures:[]}))

			return { 
				...state, 
				loadedDatasets:[...state.loadedDatasets, ...datasetsNotLoadedBefore],
				loadsComplete:{ ...state.loadsComplete, datasets:'complete' }
			}
		}
		case C.LOAD_DEEP_DATASETS:{
			//start date
			const updatedDatasets = act.datasets
				.map(dset => {
					//merge new datapoints with any existing (eg from another previously viewed player)
					const datasetToUpdate = state.loadedDatasets.find(dset => dset._id === dset._id) || {};
					//these datapoints will already have been hydrated
					const updatedDatapoints = datasetToUpdate.datapoints ? [...datasetToUpdate.datapoints, dset.datapoints] : dset.datapoints;
					return hydrateDataset({ ...dset, datapoints:updatedDatapoints })
			    })

			return { 
				...state, 
				loadedDatasets:filterUniqueById([ ...updatedDatasets, ...state.loadedDatasets]),
				//loadsComplete:{ ...state.loadsComplete, datasets:'complete' }
			}
		}

	}
}
/*
//CANNOT CALL THIS USER
const otherUser = (state, act) =>{
	switch(act.type){
		case C.UPDATE_ADMINISTERED_USER:{
			
		}
		case C.LOAD_USER:{
			return {...state, ...act.user}
		}
		default:
			return state;
	}
}
*/
/*
const group = (state, act) =>{
	switch(act.type){
		case C.ADD_PLAYER:{
			
		}
		case C.REMOVE_PLAYER:{
			return {...state, ...act.group}
		}
		default:
			return state
	}
}
*/
/*
Need to remove during main actions, not fetchEnd
*/

export const asyncProcesses = (state={}, act) =>{
	const { type, path, value } = act
	switch(type){
		case C.ERROR:{
			let _state = cloneDeep(state)
			const errorPath = 'error.'+path
			_.set(_state, errorPath, value)
			return _state
		}
		case C.START:{
			let _state = cloneDeep(state)
			_.set(_state, path, true)
			return _state
		}
		case C.END:{
			let _state = cloneDeep(state)
			_.set(_state, path, false)
			return _state			
		}
		case C.SIGN_OUT:{
			return InitialState.asyncProcesses;
		}
		default:
			return state
	}
}

export const dialogs = (state={}, act) =>{
	const { type, path, value } = act
	switch(type){
		case C.SIGN_UP:{
			return { ...state, signup:true };
		}
		//create - user has created, so dialog must open for next steps
		case C.CREATE_NEW_ADMINISTERED_USER:{
			return { ...state, createUser:true };
		}
		case C.CREATE_NEW_ADMINISTERED_GROUP:{
			return { ...state, createGroup:true };
		}
		case C.CREATE_NEW_ADMINISTERED_DATASET:{
			return { ...state, createDataset:true };
		}
		
		//delete - user has confirmed delete and been redirected, so dialog must close
		case C.DELETE_ADMINISTERED_USER:{
			return { ...state, deleteUser:false };
		}
		case C.DELETE_ADMINISTERED_GROUP:{
			return { ...state, deleteGroup:false };
		}
		case C.DELETE_ADMINISTERED_DATASET:{
			return { ...state, deleteDataset:false };
		}
		
		case C.ERROR:{
		}
		case C.OPEN_DIALOG:{
			let _state = cloneDeep(state)
			_.set(_state, path, true)
			return _state
		}
		case C.CLOSE_DIALOG:{
			let _state = cloneDeep(state)
			_.set(_state, path, false)
			return _state			
		}
		case C.SIGN_OUT:{
			return InitialState.dialogs;
		}
		//automatically close dialog upon deletion
		/*
		case C.DELETE_GROUP:{
			let _state = cloneDeep(state)
			_.set(_state, "deleteGroup", false)
			return _state			
		}
		*/
		default:
			return state
	}
}

export const system = (state={}, act) => {
	const { type, screen } = act
	switch(type){
		/*case C.SIGN_OUT:{
			return InitialState.system;
		}*/
		case C.MOBILE_MENU:{
			return {
				...state,
				mobileMenu:act.shouldOpen
			}
		}
		case C.UPDATE_SCREEN:{
			return {
				...state,
				screen
			}
		}
		case C.HIDE_MENUS:{ return { ...state, menusHidden: true } }
		case C.SHOW_MENUS:{ return { ...state, menusHidden: false } }
		case C.SAVE_ADHOC_JOURNEY:{
			//@todo - abstract this as it is repeated in SAVE_ADHOC_JOURNEY
			return {
				...state,
				journey:{ ...act.journey, measures:mockMeasures },
			}
		}
		case C.SAVE_NEW_JOURNEY_ID:{
			const { _id } = act;
			//if temp, then it is this journey so update with its actual id
			return {
				...state,
				activeJourney:state.activeJourney === "temp" ? _id : state.activeJourney
			}
		}
		case C.SAVE_JOURNEY:{
			const { journey } = act;
			//newly saved jurney in store becomes active
			return {
				...state,
				activeJourney:journey._id
			}
		}
		case C.SET_ACTIVE_JOURNEY:{
			return {
				...state,
				activeJourney:act._id
			}
		}
		case C.CREATE_DECK:{
			return { ...state, selectedDeckId:act.deck.id };
		}
		case C.CREATE_TABLE:{
			return { ...state, selectedTableId:act.table.id };
		}
		default:
			return state
	}
}