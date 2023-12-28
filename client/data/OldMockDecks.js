import { createInitCards } from "./initDeck";
import { addWeeks } from "../util/TimeHelpers"
import { hydrateDeckSections } from './sections';

const seasonStartDate = new Date();// new Date("2024-03-01");
const footballSeasonStartDate = new Date("2024/06/01");
const cardTitles = ["Week 1", "Week 2", "Week 3", "Week 4"];

const sections = hydrateDeckSections();
const initPurpose = ["",""];

const initTable = { 
    admin:[], archivedDecks:[], created:new Date(), decks:[], isArchived:false, 
    layoutFormat:"list", tags:[], isMock:true
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
    //{ id:"tedCurd", firstName:"Ted", surname:"Curd", pos:"GK" },
    //{ id:"zachAbbot", firstName:"Zach", surname:"Abbot", pos:"DEF" },
    { id:"harrisonMurray-Campbell", firstName:"Harrison", surname:"Murray-Campbell", position:"DEF" },
    { id:"tristanRowe", firstName:"Tristan", surname:"Rowe", position:"DEF" },
    { id:"joshAcheampong", firstName:"Josh", surname:"Acheampong", pos:"DEF" },
    //{ id:"joeJohnson", firstName:"Joe", surname:"Johnson", pos:"DEF" },
    { id:"jaydenMeghoma", firstName:"Jayden", surname:"Meghoma", pos:"DEF" },
    { id:"samAmo-Ameyaw", firstName:"Samuel", surname:"Amo-Ameyaw", pos:"MID" },
    { id:"michaelGolding", firstName:"Michael", surname:"Golding", pos:"MID" },
    { id:"finleyMcAllister", firstName:"Finley", surname:"McAllister", pos:"MID" }, 
    { id:"chrisRigg", firstName:"Chris", surname:"Rigg", pos:"MID" },
    { id:"jaydenDanns", firstName:"Jayden", surname:"Danns", pos:"FOR" },
    { id:"jimmy-JayMorgan", firstName:"Jimmy-Jay", surname:"Morgan", pos:"FOR" },
    { id:"zakLovelace", firstName:"Zak", surname:"Lovelace", pos:"FOR" },
    { id:"joelNDala", firstName:"Joel", surname:"NDala", pos:"FOR" },
    { id:"tomWatson", firstName:"Tom", surname:"Watson", pos:"FOR" },
    { id:"justinOboavwoduo", firstName:"Justin", surname:"Oboavwoduo", pos:"FOR" },
    { id:"archieStevens", firstName:"Archie", surname:"Stevens", pos:"FOR" },
    //{ id:"tomKing", firstName:"Tom", surname:"King", pos:"For" }
]


const englandSections = [
    { nr:1, key:"section1", title: "Psych/Soc", initials: "PSO" },
    { nr:2, key:"section2", title: "Technical", initials: "TEC" },
    { nr:3, key:"section3", title: "Physical", initials: "PHY" },
    { nr:4, key:"section4", title: "Tactical", initials: "TAC" },
    { nr:5, key:"section5", title: "Review", initials: "REV" }
]

const englandCards = [
    {
        title:"Week 1",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 5 successful dribbles" },
            { title:"KPI: 7 Sprints and 6 high speed runs" },
            { title:"KPI:In space to receive 30% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
    {
        title:"Week 2",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 6 successful dribbles" },
            { title:"KPI: 8 Sprints and 6 high speed runs" },
            { title:"KPI: In space to receive 33% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
    {
        title:"Week 3",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 7 successful dribbles" },
            { title:"KPI: 9 Sprints and 7 high speed runs"  },
            { title:"KPI: In space to receive 35% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
    {
        title:"Week 4",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 8 successful dribbles" },
            { title:"KPI: 10 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 37% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
    {
        title:"Week 5",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 9 successful dribbles" },
            { title:"KPI:11 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 40% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
    {
        title:"Week 6",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 9 successful dribbles" },
            { title:"KPI: 11 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 40% of attacks" },
            { title:"Watch video and answer questions" },
        ]
    },
]

const playerItemStatuses = [
    //each row is one player for 6 cards, 5 items om each card
    //note -  weeks 4 + are 0 as they are in future 
    [[2,2,2,0,2], [2,2,2,0,2], [2,2,1,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,2], [2,2,1,2,2], [2,2,2,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,1,0,0,2], [0,1,0,0,2], [2,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,1], [2,2,2,2,2], [1,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,1,2], [1,2,2,0,2], [2,2,1,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[1,1,1,1,2], [2,1,2,0,1], [2,2,1,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,2], [0,1,2,2,0], [0,2,2,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,2], [2,2,2,2,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,1,2,1], [2,2,1,1,2], [2,2,1,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    [[2,2,1,2,2], [2,2,0,2,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    [[0,1,0,0,0], [2,1,0,0,1], [2,1,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,2], [1,2,2,1,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,1,2,1,1], [2,1,2,2,2], [2,2,2,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    [[2,2,2,0,2], [2,2,2,0,2], [2,2,2,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,1], [0,0,0,0,1], [0,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //15 up to here
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
]

const customiseCardsForActivity = (cards, activityType) => {
    //customise card titles, and item titles/contents for 3 items on each card, leaving 2 as per player
    if(activityType === "football"){
        return cards.map((c,i) => {
            const { title, items } = englandCards[i];
            return { 
                ...c, 
                title, 
                items:c.items.map((it,j) => ({ ...it, ...items[j] })) 
            }  
        });
    }
    return cards;
}

const customiseCardsForPlayer = (cards, player, i) => {
    //customise item statuses, and also add 2 individual items per player
    return cards.map((c,j) => ({
        ...c,
        items:c.items.map((it,k) => ({ ...it, status:playerItemStatuses[i][j][k] }))
    }))
}

const customiseFrontCardId = (cards, p,i) => cards[2].id;

export const getEnglandPlayersWithDecks = () => {
    //helper
    const getDecksForPlayer = (p,i) => {
        //for now, only 1 deck per player, with generic content but custom statuses
        const initCards = createInitCards({ startDate:footballSeasonStartDate, nrCards:5, weeksPerCard:1, cardTitles });
        const cards = customiseCardsForPlayer(customiseCardsForActivity(initCards, "football"), p, i);
        return [{
            id:`deck-${p.id}`,
            sections:englandSections,
            cards,
            frontCardId:customiseFrontCardId(cards, p,i),
            player:p,
        }]
    }

    return englandPlayers.map((p,i) => ({
        ...p,
        decks:getDecksForPlayer(p,i)
    }))
}

export const getPlayerDecks = players => {
    //helper
    const getDecksForPlayer = (p,i) => {
        //for now, only 1 deck per player, with generic content but custom statuses
        const initCards = createInitCards({ startDate:footballSeasonStartDate, nrCards:5, weeksPerCard:1, cardTitles });
        const cards = customiseCardsForPlayer(customiseCardsForActivity(initCards, "football"), p, i);
        return [{
            id:`deck-${p.id}`,
            sections:englandSections,
            cards,
            frontCardId:customiseFrontCardId(cards, p,i),
            player:p,
        }]
    }

    return players.map((p,i) => ({
        ...p,
        decks:getDecksForPlayer(p,i)
    }))
}
