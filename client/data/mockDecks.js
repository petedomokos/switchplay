import { createInitCards } from "./initDeck";
import { addWeeks } from "../util/TimeHelpers"

const seasonStartDate = new Date();// new Date("2024-03-01");
const cardTitles = ["Week 1", "Week 2", "Week 3", "Week 4"];

export const getMockDecks = user => {
    if(user?.userName?.includes("football")){ mockFootballDecks; }
    return mockAthleteDecks;
}

const mockFootballDecks = [];

const mockAthleteDecks = [
    {
        id:"athleteDeck0",
        frontCardNr:0, 
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general1" }],
        cards:createInitCards({ startDate:seasonStartDate, nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck1",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general2" }],
        cards:createInitCards({ startDate:addWeeks(4, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck2",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"general3" }],
        cards:createInitCards({ startDate:addWeeks(8, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck3",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific1-1" }],
        cards:createInitCards({ startDate:addWeeks(12, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck4",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific1-2" }],
        cards:createInitCards({ startDate:addWeeks(16, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck5",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific2-1" }],
        cards:createInitCards({ startDate:addWeeks(20, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck6",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"specific2-2" }],
        cards:createInitCards({ startDate:addWeeks(24, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck7",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"competition1" }],
        cards:createInitCards({ startDate:addWeeks(28, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    },
    {
        id:"athleteDeck8",
        frontCardNr:0,
        tags:[{ key:"playerId", value:"reneeRegis" }, { key:"phase", value:"competition2" }],
        cards:createInitCards({ startDate:addWeeks(32, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles })
    }
]