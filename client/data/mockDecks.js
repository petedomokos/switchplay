import { createInitCards } from "./initDeck";
import { addWeeks } from "../util/TimeHelpers"
import { hydrateDeckSections } from './sections';
import { tagInfoArray } from "./tagInfoArray";

const seasonStartDate = new Date();// new Date("2024-03-01");
const footballSeasonStartDate = new Date("2024/06/01");
const cardTitles = ["Week 1", "Week 2", "Week 3", "Week 4"];

const sections = hydrateDeckSections();
const initPurpose = ["",""];

const initTable = { 
    admin:[], archivedDecks:[], created:new Date(), decks:[], isArchived:false, layoutFormat:"list", tags:[], isMock:true
}

export const getMockTables = user => {
    if(user?.username === "damian"){ 
        return [{
            ...initTable,
            id:"mock-table",
            owner:user._id,
            decks: blankMockFootballDecks.map(d => d.id)
        }]
    }
    if(user?.username === "athlete"){ 
            return [{
            ...initTable,
            id:"mock-table",
            owner:user._id,
            decks: mockAthleteDecks.map(d => d.id)
        }]
    }
    return [];
}

export const getMockDecks = user => {
    if(user?.customer.key === "england"){
        return customer.decks;  
    }
    if(user?.username === "damian"){ 
        const cards = createInitCards({ startDate:footballSeasonStartDate, nrCards:5, weeksPerCard:1, cardTitles });
        return blankMockFootballDecks.map(d => ({ 
            ...d, 
            isMock:true, 
            sections, 
            cards,
            purpose:d.purpose || initPurpose,
            frontCardId:cards[0].id
        })); 
    }
    return [];
}

export const getMockAthleteDecks = () => {
    return mockAthleteDecks.map(d => ({ 
        ...d, 
        isMock:true, 
        sections, 
        purpose:d.purpose || initPurpose,
        frontCardId:d.cards[0].id, 
    }));
}


/*const blankMockFootballDecks = tagInfoArray
    .find(tagsInfo => tagsInfo.key === "playerId")
    .values
    .filter(playerIdTag => playerIdTag.playerType === "footballer")
    .map((playerIdTag) => ({
        id:`deck-${playerIdTag.value}`,
        tags:[{ key:"playerId", value:playerIdTag.value }],
    }))*/

const mockAthlete = { id:"reneeRegis", firstName:"Renee", surname:"Regis" }
const mockAthleteDecks = [
    {
        id:"athleteDeck0",
        phase:{ id:"general1", title:"General Cycle 1" },
        player:mockAthlete,
        cards:createInitCards({ startDate:seasonStartDate, nrCards:4, weeksPerCard:1, cardTitles }),
        purpose:[
            "I will get back to the base line expected fitness standards so I am ready to progress", 
            "I will do this by following a stricter diet plan, increasing total distance each week, and adding swimming sessions"
        ]
    },
    {
        id:"athleteDeck1",
        phase:{ id:"general2", title:"General Cycle 2" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(4, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck2",
        phase:{ id:"general3", title:"General Cycle 3" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(8, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck3",
        phase:{ id:"specific1-1", title:"Specific 1 Cycle 1" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(12, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck4",
        phase:{ id:"specific1-2", title:"Specific 1 Cycle 2" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(16, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck5",
        phase:{ id:"specific2-1", title:"Specific 2 Cycle 1" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(20, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck6",
        phase:{ id:"specific2-2", title:"Specific 2 Cycle 2" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(24, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck7",
        phase:{ id:"competition1", title:"Competition Cycle 1" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(28, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck8",
        phase:{ id:"competition2", title:"Competition Cycle 2" },
        player:mockAthlete,
        cards:createInitCards({ startDate:addWeeks(32, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    }
]

export const englandPlayers = [
    { id:"tedCurd", firstName:"Ted", surname:"Curd", pos:"GK" },
    { id:"zachAbbot", firstName:"Zach", surname:"Abbot", pos:"DEF" },
    { id:"joshAcheampong", firstName:"Josh", surname:"Acheampong", pos:"DEF" },
    { id:"joeJohnson", firstName:"Joe", surname:"Johnson", pos:"DEF" },
    { id:"jaydenMeghoma", firstName:"Jayden", surname:"Meghoma", pos:"DEF" },
    { id:"samuelAmoAmeyaw", firstName:"Samuel", surname:"Amo-Ameyaw", pos:"MID" },
    { id:"michaelGolding", firstName:"Michael", surname:"Golding", pos:"MID" },
    { id:"finleyMcAllister", firstName:"Finley", surname:"McAllister", pos:"MID" }, 
    { id:"chrisRigg", firstName:"Chris", surname:"Rigg", pos:"MID" },
    { id:"jaydenDanns", firstName:"Jayden", surname:"Danns", pos:"F" },
    { id:"jimmyJayMorgan", firstName:"Jimmy-Jay", surname:"Morgan", pos:"F" },
    { id:"zakLovelace", firstName:"Zak", surname:"Lovelace", pos:"F" },
    { id:"joelNDala", firstName:"Joel", surname:"NDala", pos:"F" },
    { id:"tomWatson", firstName:"Tom", surname:"Watson", pos:"F" },
    { id:"justinOboavwoduo", firstName:"Justin", surname:"Oboavwoduo", pos:"F" },
    { id:"archieStevens", firstName:"Archie", surname:"Stevens", pos:"F" },
    { id:"tomKing", firstName:"Tom", surname:"King", pos:"F" }
]

const customiseCards = (cards, p, i) => {
    //@todo - customise statuses
    return cards;
}
const customiseFrontCardId = (p,i) => 0;

export const getEnglandPlayersWithDecks = () => {
    const initCards = createInitCards({ startDate:footballSeasonStartDate, nrCards:5, weeksPerCard:1, cardTitles });
    //helper
    const getDecksForPlayer = (p,i) => {
        //for now, only 1 deck per player, with generic content but custom statuses
        return [{
            id:`deck-${p.id}`,
            cards:customiseCards(initCards, p, i),
            frontCardId:customiseFrontCardId(p,i),
            player:p,
        }]
    }

    return englandPlayers.map((p,i) => ({
        ...p,
        decks:getDecksForPlayer(p,i)
    }))
}
