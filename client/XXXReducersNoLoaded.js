import C from './Constants'
import _ from 'lodash'
import * as cloneDeep from 'lodash/cloneDeep'
import { isIn, isNotIn, isSameById, filterUniqueById, filterUniqueByProperty } from './util/ArrayHelpers'
import { InitialState } from './InitialState'
import { GroupOutlined } from '@material-ui/icons'
//HELPERS


//STORE
export const user = (state=InitialState.user, act) =>{
	switch(act.type){
		//SIGNED IN USER
		case C.SIGN_IN:{
			return act.user;
		}
		case C.SIGN_OUT:{
			return InitialState.user;
		}
		case C.UPDATE_SIGNEDIN_USER:{
			//this doesnt update administered users or groups, just basic details eg name, email,...
			return { ...state, ...act.user };
		}
		//OTHER USERS AND GROUPS
		//CREATE
		case C.CREATE_NEW_ADMINISTERED_USER:{
			return { 
				...state, 
				administeredUsers:[...state.administeredUsers, act.user._id]
			}
		}
		case C.CREATE_NEW_ADMINISTERED_GROUP:{
			return { 
				...state, 
				administeredGroups:[...state.administeredGroups, act.group._id]
			}
		}
		//UPDATE (overwrite properties with any updated or new ones)

		case C.UPDATE_ADMINISTERED_USER:{
			//we only update in loadedUsers, as _id doesnt ever change
			const userToUpdate = state.user.administeredUsers.find(us => us._id === act.user._id);
			const updatedUser = { ...userToUpdate, ...act.user }
			if(!isSameById(userToUpdate.admin, updatedUser.admin)){
				//user admin has changed
				//add/remove from/to user.administeredUsers for affected users
				//...todo
			}
			//use filter to remove old version, and add updated version
			return {
				...state,
				administeredUsers:filterUniqueById([updatedUser, ...state.administeredUsers])
			}
		}

		case C.UPDATE_ADMINISTERED_GROUP:{
			const groupToUpdate = state.administeredGroups.find(g => g._id === act.group._id);
			const updatedGroup = { ...groupToUpdate, ...act.group };
			const updatedAdministeredGroups = filterUniqueById([updatedGroup, ...state.administeredGroups])
			//also update in groupsMemeberOf if its there
			const updatedGroupsMemberOf = state.groupsMemberOf.find(g => g._id === act.group._id) ?
				filterUniqueById([updatedGroup, ...state.groupsMemberOf]) : state.groupsMemberOf;
			//if group admin changed, update user.administeredGroups for affected users
			if(!isSameById(groupToUpdate.admin, updatedGroup.admin)){
				//todo
			}
			//if players changed, update groupsMemberOf in affected players (users)
			//only if deep versions of users are stored, otherwise those groups wont exist on the user
			if(!isSame(groupToUpdate.players, updatedGroup.players)){
				const playersAdded = updatedGroup.players.filter(user => isNotIn(groupToUpdate, user))
				console.log('playersAdded', playersAdded)
				const playersRemoved = groupToUpdate.players.filter(userId => isNotIn(updatedGroup, user))
				console.log('playersRemoved', playersRemoved)
				var updatedAdmin = state.admin,
					updatedAdministeredUsers = state.administeredUsers,
					updatedOtherUsers = state.otherUsers;
				
				playersAdded.forEach(user =>{
					if(isIn(state.admin, user)){
						const _user = updatedAdmin.find(us => us._id === user._id);
						if(_user.groupsMemberOf)
							_user.players.push(user);
					}
					else if(isIn(state.administeredUsers, user)){
						updatedAdministeredUsers.find(us => us._id === user._id).players.push(user);
					}

				})
				const updatedLoadedUsers = state.loadedUsers.map(user =>{
					if(playersAdded.includes(user._id)){
						//add groupId to user
						return { ...user, groupsMemberOf:[...user.groupsMemberOf, act.group._id]}
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
		//DELETE
		//must remove from both administered and loaded arrays
		case C.DELETE_ADMINISTERED_USER:{
			//todo - also delete them from any other user's user.administeredGroups
			return {
				...state,
				administeredUsers:state.administeredUsers.filter(us => us._id !== act.user._id),
				loadedUsers:state.loadedUsers.filter(us => us._id !== act.user._id)
			}
		}
		case C.DELETE_ADMINISTERED_GROUP:{
			//todo - also delete them from any other user's user.administeredGroups
			return {
				...state,
				administeredGroups:state.administeredGroups.filter(g => g._id !== act.group._id),
				loadedGroups:state.loadedGroups.filter(g => g._id !== act.group._id)
			}
		}
		//LOAD EXISTING FROM SERVER 
		//Note 1 - this cannot be the signed in user - they are always loaded fully
		//Note 2 - this will overwrite/enhance any existing objects rather than replace
		case C.LOAD_USER:{
			const { admin, administeredUsers, administeredGroups, groupsMemberOf } = act.user;
			//find if there is any existing version to update
			const userToUpdate = state.loadedUsers.find(us => us._id === act.user._id) || {};
			const updatedUser = { 
				...userToUpdate, 
				...act.user,
				administeredUsers:administeredUsers.map(us => us._id),
				administeredGroups:administeredGroups.map(g => g._id),
				groupsMemberOf:groupsMemberOf.map(g => g._id)
			}
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
			return { 
				...state,
				//user is deep , so we overide any existing version
				loadedUsers:filterUniqueById([...mergedAdmin, ...mergedAdministeredUsers, updatedUser, ...state.loadedUsers]),
				loadedGroups:filterUniqueById([...mergedAdministeredGroups, ...mergedGroupsMemberOf, ...state.loadedGroups])
			}
		}
		case C.LOAD_GROUP:{
			const { admin, players } = act.group;
			//find if there is any existing version to update
			const groupToUpdate = state.loadedGroups.find(g => g._id === act.group._id) || {};
			const updatedGroup = { 
				...groupToUpdate, 
				...act.group,
				admin:admin.map(us => us._id),
				players:players.map(us => us._id)
			}
			console.log('updatedgroup being added to loadedgroups', updatedGroup)
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
			return { 
				...state,
				//group is deep, so we will override any existing version
				loadedGroups:filterUniqueById([updatedGroup, ...state.loadedGroups]),
				loadedUsers:filterUniqueById([/*...mergedAdmin, */ ...mergedPlayers, ...state.loadedUsers])
			}
		}
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
				loadedUsers:[...state.loadedUsers, ...usersNotLoadedBefore],
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
			console.log('default returniung state')
			return state
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
		//delete - user has confirmed delete and been redirected, so dialog must close
		case C.DELETE_ADMINISTERED_USER:{
			return { ...state, deleteUser:false };
		}
		case C.DELETE_ADMINISTERED_GROUP:{
			return { ...state, deleteGroup:false };
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