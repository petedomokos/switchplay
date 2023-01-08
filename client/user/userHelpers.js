import { getGoals } from "../data/goals";

export const hydrateUser = user => {
    return {
        ...user,
        photos:[{label:"main"}], //@todo - user should have this already
        goals:getGoals(user._id), //legacy - can probably remove
        player:user.isPlayer ? createPlayer(user) : null,
        coach:user.isCoach ? createCoach(user) : null,
        //shallow users may not have these
        players:user.administeredUsers?.filter(u => u.isPlayer).map(u => createPlayer(u)),
        coaches:user.administeredUsers?.filter(u => u.isCoach).map(u => createCoach(u))
    }
}

export const hydrateUsers = users => users.map(u => hydrateUser(u));

function createPlayer(user){
    const { _id, firstname, surname, position, dob, groupsMemberOf } = user;
    return {
        _id, firstname, surname, position,
        age:calcAge(dob),
        group:groupsMemberOf[0], //for now, assume max 1 group per player
        photos:[{label:"main"}] //@todo - user should have this already
    }
}

function createCoach(user){
    const { _id, firstname, surname, administeredGroups } = user;
    return {
        _id, firstname, surname,
        group:administeredGroups[0], //for now, assume max 1 group per coach
        photos:[{label:"main"}] //@todo - user should have this already
    }
}

//@todo
function calcAge(dob){
    return 21;

}