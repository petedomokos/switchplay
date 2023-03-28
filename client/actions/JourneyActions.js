import C from '../Constants'
import { status, parseResponse, logError, fetchStart, fetchEnd, fetchThenDispatch} from './CommonActions'
import auth from '../auth/auth-helper'
import { addMonths } from '../util/TimeHelpers';

function dateIsValid(date) {
	return date instanceof Date && !isNaN(date);
}

const transformJourneyForServer = journey => {
	//console.log("transformJourneyForServer")
	const { playerId, coachId, media, name="", desc="" } = journey;
	//dont think we need to store anything on channels, or could just be the setting "monthly"
	//if we want to persist the users last zoom level. Or maybe just preserve the zoom level then?
	//for now, we dont anyway
	//completion paths are off for now, so again we dont persist 
	const contracts = journey.contracts.map(c => ({
		id:c.id,
		date:c.date,
		yPC:c.yPC
	}));
	
	//remove current profile
	const profiles = journey.profiles
		.filter(p => p.id !== "current")
		.map(p => ({
			id:p.id,
			title:p.title,
			desc:p.desc,
			media:p.media,
			created:p.created,
			date:p.date,
			yPC:p.yPC,
			customTargets:p.customTargets,
			customExpected:p.customExpected
		}));

	const aims = journey.aims.map(a => ({
		id:a.id,
		name:a.name,
		startDate:a.startDate,
		endDate:a.endDate,
		startYPC:a.startYPC,
		endYPC:a.endYPC,
		colour:a.colour,
		updated:Date.now
	}));
	const goals = journey.goals.map(g => ({
		id:g.id,
		aimId:g.aimId,
		name:g.name,
		targetDate:g.targetDate,
		yPC:g.yPC,
		measures:g.measures
	}));
	const links = journey.links.map(l => ({
		src:l.src,
		targ:l.targ
	}));

	//may be best to add measure info to measure instead of storing on goals
	const measures = journey.measures/*.map(m => {
		const targs = {};
		goals.forEach(g => {
			const goalMeasureInfo = g.measures.find(meas => meas.id === m.id);
			if(goalMeasureInfo){
				targs[g.id] = goalMeasureInfo.targ;
			}
		})
		return {
			...m,
			//targs
		}
	});
	*/

	return { 
		_id: journey._id !== "temp" ? journey._id : undefined,
		playerId,
		coachId,
		//why not keep playerId? see also JourneyContainer
		//and need to add playerId to journey model
		name,
		desc,
		media,
		contracts,
		profiles,
		aims,
		goals,
		links,
		measures,
		settings:journey.settings.map(s => ({ key: s.key, value:s.value })) || [],
		updated:Date.now
	}
}

export const transformJourneyForClient = journey => {
	console.log("transformJForClient", journey)
	//for legacy we put in [] defaults
	const { contracts, profiles, aims, goals, settings=[], updated, created } = journey;
	return {
		...journey,
		contracts:contracts? contracts.map(c => ({
			...c,
			date:new Date(c.date),
		})) : [],
		profiles:profiles? profiles.map(p => ({
			...p,
			date:new Date(p.date),
			yPC:+p.yPC
		})) : [],
		aims:aims.map(a => ({
			...a,
			startDate:new Date(a.startDate),
			endDate:new Date(a.endDate),
			startYPC:+a.startYPC,
			endYPC:+a.endYPC
		})),
		goals:goals.map(g => ({
			...g,
			targetDate:new Date(g.targetDate),
			yPC:+g.yPC,
			measures:g.measures.map(m => ({
				...m,
				targ:+m.targ
			})),
			created:new Date(g.created)
		})),
		settings,
		updated:new Date(updated),
		created:new Date(created)
	}
}

//higher-order action
export const saveJourneyToStore = journey => (
	{
		type: C.SAVE_JOURNEY,
		journey
	}
)

export const saveAdhocJourneyToStore = journey => (
	{
		type: C.SAVE_ADHOC_JOURNEY,
		journey
	}
)

export const saveJourney = (journey, shouldPersist=true, shouldUpdateStoreBefore=false, shouldUpdateStoreAfter=false)  => dispatch => {
	console.log("saveJourney.............", journey)
	//note - currently, the client store simply stores the server journey too
	const serverJourney = transformJourneyForServer(journey);
	console.log("save journey to server---------------", serverJourney)
	/*
	//atm, if no user logged in, we still have  auser object so just store journey in there as normal, but dont persist to server
	const jwt = auth.isAuthenticated();
	if(!jwt){
		console.log("save adhoc")
		dispatch(saveAdhocJourneyToStore(journey))
		return;
	}
	*/
	//1. save to store
	dispatch(saveJourneyToStore(serverJourney));
	if(!shouldPersist){ return; }
    //2. save to server
    //3. on response, undo if errors, add id (if new) or anything else from server to store
	//const serverJourney = transformJourneyForServer(journey);
	//console.log("saving serverJourney", serverJourney);
	const jwt = auth.isAuthenticated();
	//console.log("jwt", jwt)
	if(!jwt.user) { return; }
	const journeyIsNew = !serverJourney._id;
	if(journeyIsNew){
		console.log("SAVING A NEW JOURNEY!!!!!!!!!!!!!!")
		//alert("saving a new journey")
		return;
	}
	//console.log("id is", serverJourney._id)
	const url = '/api/users/'+jwt.user._id+'/journey' +(serverJourney._id ? "/"+serverJourney._id : "")
	fetchThenDispatch(dispatch, 
		'saving.journey',
		{
			//journey has id if its already been saved
			url,
			method: 'POST',
			body:JSON.stringify(serverJourney),
			requireAuth:true,
			//this action will also set dialog.createUser = true
			nextAction: data => {
				//console.log("saveJourney response", data)
				//console.log("auth?", !!jwt)
				//console.log("new journey?", journeyIsNew)
				if(jwt && journeyIsNew){
					//console.log("next: user is authenticated && journey is new")
					//in this case, we need the new user and the sign up mesg
					return { type:C.SAVE_NEW_JOURNEY_ID, mesg:data.mesg, userId:data.userId, _id:data.journey._id };
				}
				return { type:C.NO_ACTION };
			}
		})
}

export const setActive = journeyId => dispatch => {
	dispatch({
		type:C.SET_ACTIVE_JOURNEY,
		_id:journeyId
	});
}

//to fetch a user in full
export const fetchJourney = (userId, journeyId) => dispatch => {
	fetchThenDispatch(dispatch, 
		'loading.journey',
		{
			url: '/api/users/'+userId +'/journey/'+journeyId, 
			requireAuth:true,
			nextAction: data => {
                //@TODO - allow users to share journeys, but these are stored elsewhere and read-only
				//const jwt = auth.isAuthenticated();
				if(auth.isAuthenticated()){
                    //if(jwt.user._id === data._id){
                        //return { type:C.SAVE_OTHER_USERS_JOURNEY, mesg:data.mesg, userId:data.userID, journey:data.journey }
                    //}
					return { type:C.SAVE_JOURNEY, mesg:data.mesg, userId:data.userID, journey:transformJourneyForClient(data.journey) }
				}
			}
		}) 
}