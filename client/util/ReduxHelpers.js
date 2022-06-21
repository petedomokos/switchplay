export const findShallowUser = (state, id) =>{
	if(state.user._id){
		//step 1 - check the signed in user
		if(state.user._id === id){
			//user is signed in - just return full user in this case
			return state.user;
		}
		//step 2 - check the signedin user's administeredUsers
		const administered = state.user.administeredUsers.find(user => user._id === id);
		if(administered){
			return administered;
		}
	}
	//steps 3 and 4 could have users even id not signed in user.
	//step 3 - check other shallowUsers
	const otherShallow = state.other.shallowUsers.find(user => user._id === id);
	if(otherShallow){
		return otherShallow;
	}
	//step 4 - look in deepUsers (as deep is also fine for shallow)
	const deep = findDeepUser(state, id);
	if(deep){
		return deep;
	}
	//step 5 - user is not currently stored in client - needs to be loaded
	return undefined;
}

/*
For when only deep will suffice, returning undefined otherwise
*/
export const findDeepUser = (state, id) =>{
	//step 1 - check the signed in user
	if(state.user._id && state.user._id === id){
		return state.user;
	}else{
		//step 2 - only other place it could be is other deep users
		return state.other.deepUsers.find(user => user._id === id);
	}
}

/*
For when deep is preferable, but shallow will suffice if no deep
*/
export const findDeepOrShallowUser = (state,id) => {
	return findDeepUser(state, id) || findShallowUser(state, id);
}

/*
For when all we need is the shallow version, eg for lists
It is possible that deep exists but not shallow, in that case
it just loads the deep instead
*/
export const findShallowGroup = (state, id) => {
	if(state.user._id){
		//step 1 - check the signedin user's administeredUsers
		const administered = state.user.administeredGroups.find(group => group._id === id);
		if(administered){
			return administered;
		}
		//step 2 - check the signedin user's memberOf groups
		const memberOf = state.user.groupsMemberOf.find(group => group._id === id);
		if(memberOf){
			return memberOf;
		}
	}
	//steps 3 and 4 could have groups even if not signed in user.
	//step 3 - check other shallowGroups
	const otherShallow = state.other.shallowGroups.find(group => group._id === id);
	if(otherShallow){
		return otherShallow;
	}
	//step 4 - look in deepGroups (as deep is also fine for shallow)
	const deep = findDeepGroup(state, id);
	if(deep){
		return deep;
	}
	//step 5 - user is not currently stored in client - needs to be loaded
	return undefined;
}
/*
For when only deep will suffice, returning undefined otherwise
*/
export const findDeepGroup = (state, id) => {
	//step 1 - only place that deep groups are kept it is other.deepGroups
	//(even the signedin users deep versions are kept here)
	return state.other.deepGroups.find(group => group._id === id);
}

/*
For when deep is preferable, but shallow will suffice if no deep
*/
export const findDeepOrShallowGroup = (state,id) => {
	return findDeepGroup(state, id) || findShallowGroup(state, id);
}
