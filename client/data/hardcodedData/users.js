import { customers } from "./customers";
import { groups } from "./groups";

export function addHardcodedDataToUser(user){
    const dataToAdd = hardcodedUserData[user._id];
    //console.log("dataToAdd", dataToAdd)
    if(dataToAdd){ 
        console.log("adding hardcoded data...")
        const { customerId } = dataToAdd;
        //@todo - add in the various bits into the right places
        const userWithHardcodedData = { 
            ...user, 
            customer:customers.find(c => c._id === customerId),
            //note - we are not using groupsMemberOf on user in db atm
            groupsMemberOf: groups[customerId].filter(g => g.players.includes(user._id))
        };
        return userWithHardcodedData;
    }
    return user;
}

const tysonHardcodedData = {
    customerId:"switchplay",
    //add table stuff, decks stuff, cards stuuf, everything like that
}
const peterHardcodedData ={
    customerId:"switchplay",
}

const hardcodedUserData = {
    //tyson local db
    "606b2f1f3eecde47d8864798": tysonHardcodedData,
    //tyson remote
    "Tyson": tysonHardcodedData,
    //Peter local db
    "643d79844aa4af07d60f394c": peterHardcodedData,
    //Peter remote 
    "pd": peterHardcodedData
}

