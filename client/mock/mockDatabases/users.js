import { getMockAthleteDecks, getPlayerDecks } from "../mockContent/mockDecks";
import { englandDatasets } from "./mockDatasets";
import { groups } from "./groups"
import { customers } from "./customers"

const generalUserProperties = {
    created:"2023/01/01",
    updated:"2023/01/01",
    isMock:true,
    admin:[], administeredUsers:[], administeredGroups:[], groupsMemberOf:[], journeys:[],
    administeredDatasets:[], datasetsMemberOf:[], loadedDatasets:[]
}

const generalTableProperties = {
    created:"2023/01/01",
    updated:"2023/01/01"
}

//@todo - add customers, groups etc into users object same as it is stored in db,
//then populate these properties in the saqem way in teh getMockUser function
const users = [
    {
        _id:"rg",
        username:"rgdemo",
        firstName:"Ryan",
        surname:"Garry",
    },
    {
        _id:"rregis",
        username:"rregisdemo",
        firstName:"Renee",
        surname:"Regis",
    }
]

export const userIdIsMock = userId => {
    return !!users.find(u => u._id === userId);
}

export const getMockUserById = id => {
    const user = users.find(u => u._id === id);
    return getMockUser(user?.username);
}

export const getMockUser = username => {
    const user = users.find(u => u.username === username);
    if(username === "rgdemo"){
        const decks = getPlayerDecks(groups.england.u18Men).map(d => ({
            ...d,
            kpis:d.kpis.map(kpi => ({ ...kpi, key:`${kpi.datasetKey}-${kpi.measureKey}`}))
        }));
        //console.log("decks........", decks)
        const tables = [{ _id:"rgdemo-table", ...generalTableProperties, decks: decks.map(d => d._id) }];
        //const tables = decks.map(d => d.id);
        return {
            ...generalUserProperties,
            ...user,
            //note - customer has been populated with info, but not players, as the players are populated in groups instead
            customer:customers.find(c => c._id === "england"),
            //tables and decks are created on client, based on the players in the group
            tables,
            decks,
            //note - groups has been populated with players, as would be the case on server
            groupsMemberOf:[groups.england.u18Men],
            datasetsMemberOf:englandDatasets,
            loadedDatasets:englandDatasets
        }
    }
    if(username === "rregisdemo"){
        const group = groups.teamReneeRegis.main;
        const decks = getMockAthleteDecks(group);
        const tables = [{ _id:"rrdemo-table", ...generalTableProperties, decks: decks.map(d => d._id) }];

        return {
            ...generalUserProperties,
            ...user,
            customer:customers.find(c => c._id === "teamReneeRegis"),
            tables,
            decks,
            groupsMemberOf:[group],
        }
    }
    return null;
}