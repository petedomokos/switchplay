import { getGoals } from "../data/goals";
import { calcAge } from "../util/TimeHelpers";

const footballers = [
    "606b2f1f3eecde47d8864798", //Lewis on local
    "", //Samuel on heroku
];
const athletes = [];
const boxers = [];
const students = [];
const children = [];

function getPersonType(id){
    //return "footballer";
    if(footballers.includes(id)){ return "footballer"; }
    if(athletes.includes(id)){ return "athlete"; }
    if(boxers.includes(id)){ return "boxer"; }
    if(students.includes(id)){ return "student"; }
    if(children.includes(id)){ return "child"; }
    return "adult";
}

export const hydrateUser = user => {
    return {
        ...user,
        tables:user.tables || [],
        decks:user.decks || [],
        photo: user.photo ? { ...user.photo, added:new Date(user.photo.added)} : null,
        photos:user.photos ? user.photos.map(p => ({ ...p, added:new Date(p.added) })) : null,
        goals:getGoals(user._id), //legacy - can probably remove
        player:user.isPlayer ? createPlayer(user) : null,
        coach:user.isCoach ? createCoach(user) : null,
        //shallow users may not have these
        players:user.administeredUsers?.filter(u => u.isPlayer).map(u => createPlayer(u)),
        coaches:user.administeredUsers?.filter(u => u.isCoach).map(u => createCoach(u)),
        personType:getPersonType(user._id)
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
        photos,
        personType:getPersonType(user._id)
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