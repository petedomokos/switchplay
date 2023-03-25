import { getGoals } from "../data/goals";
import { calcAge } from "../util/TimeHelpers";

export const hydrateUser = user => {
    return {
        ...user,
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
    const { _id, firstname, surname, position, /*dob,*/ groupsMemberOf, photos } = user;
    //@todo - remove this temp mock dob 
    const dob = user.dob || "2005/02/19";
    return {
        _id, firstname, surname, position,
        dob,
        age:calcAge(dob),
        group:groupsMemberOf[0], //for now, assume max 1 group per player
        photos
    }
}

function createCoach(user){
    const { _id, firstname, surname, administeredGroups, photos } = user;
    return {
        _id, firstname, surname,
        group:administeredGroups[0], //for now, assume max 1 group per coach
        photos
    }
}