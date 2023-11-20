import { createInitCards } from "./initDeck";
import { addWeeks } from "../util/TimeHelpers"
import { hydrateDeckSections } from './sections';

const seasonStartDate = new Date();// new Date("2024-03-01");
const cardTitles = ["Week 1", "Week 2", "Week 3", "Week 4"];

const sections = hydrateDeckSections();
const initPurpose = ["",""];

const initTable = { 
    admin:[], archivedDecks:[], created:new Date(), decks:[], isArchived:false, layoutFormat:"list", tags:[], isMock:true
}

export const getMockTables = user => {
    if(user?.username === "footballer"){ 
        return [{
            ...initTable,
            id:"mock-table",
            owner:user._id,
            decks: mockFootballDecks.map(d => d.id)
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
    if(user?.username === "footballer"){ 
        return mockFootballDecks.map(d => ({ 
            ...d, 
            isMock:true, 
            sections, 
            purpose:d.purpose || initPurpose,
            frontCardId:d.cards.find(c => c.cardNr === 0).id, 
        })); 
    }
    if(user?.username === "athlete"){ 
        return mockAthleteDecks.map(d => ({ 
            ...d, 
            isMock:true, 
            sections, 
            purpose:d.purpose || initPurpose,
            frontCardId:d.cards.find(c => c.cardNr === 0).id, 
        }));
    }
    return [];
}

const mockFootballDecks = [];

const mockAthleteDecks = [
    {
        id:"athleteDeck0",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general1" }],
        cards:createInitCards({ startDate:seasonStartDate, nrCards:4, weeksPerCard:1, cardTitles }),
        purpose:[
            "I will get back to the base line expected fitness standards so I am ready to progress", 
            "I will do this by following a stricter diet plan, increasing total distance each week, and adding swimming sessions"
        ]
    },
    {
        id:"athleteDeck1",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general2" }],
        cards:createInitCards({ startDate:addWeeks(4, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck2",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general3" }],
        cards:createInitCards({ startDate:addWeeks(8, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck3",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific1-1" }],
        cards:createInitCards({ startDate:addWeeks(12, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck4",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific1-2" }],
        cards:createInitCards({ startDate:addWeeks(16, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck5",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific2-1" }],
        cards:createInitCards({ startDate:addWeeks(20, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck6",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific2-2" }],
        cards:createInitCards({ startDate:addWeeks(24, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck7",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"competition1" }],
        cards:createInitCards({ startDate:addWeeks(28, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        id:"athleteDeck8",
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"competition2" }],
        cards:createInitCards({ startDate:addWeeks(32, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    }
]