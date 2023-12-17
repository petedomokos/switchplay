import { getMockAthleteDecks, getEnglandPlayersWithDecks } from "./mockDecks";

const customersInfo = {
    england:{
        key:"england",
        name:"England",
        settings:[],
        tableLogoTransform:`translate(-622px, -342px) scale(0.055)`,
        //logo dimns - 1280 * 720
    },
    charlton:{

    },
    reneeRegis:{
        key:"reneeRegis",
        name:"ReneeRegis",
        settings:[],
        tableLogoTransform:`translate(-105px, -148px) scale(0.13)`,
    }
}

//@todo - store customerId on user in db instead
export const getCustomer = (userId) => {
    console.log("getCustomer...userId", userId)
    if(userId === "6557a1a868fa650ce46239f3"){
        const decks = getMockAthleteDecks();
        const tables = [{
            key:"reneeRegisSeason23_24",
            title:"Renee Regis Season 23/24",
            kpis:[],
            settings:[],
            decks:decks.map(d => d.id)
        }]
        return { customerInfo:customersInfo.reneeRegis, tables, decks }
    }
    //default to england
    const decks = getEnglandPlayersWithDecks()
        .map(p => p.decks)
        .reduce((p1Decks, p2Decks) => [...p1Decks, ...p2Decks], []);
    
    console.log("decks", decks)
    const tables = [{
        key:"menUnder18s",
        title:"Under 18s (Men)",
        kpis:[],
        settings:[],
        decks:decks.map(d => d.id)
    }]
    return { customerInfo:customersInfo.england, tables, decks }
}