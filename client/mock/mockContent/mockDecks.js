import { createMockCards } from "./mockCards";
import { addWeeks } from "../../util/TimeHelpers"

const now = new Date();
const seasonStartDate = now;// new Date("2024-03-01");
const footballSeasonStartDate = new Date("2024/06/24");
const cardTitles = ["Week 1", "Week 2", "Week 3", "Week 4"];

const initPurpose = ["",""];

export const getMockAthleteDecks = group => {
    return mockAthleteDecks.map(d => ({ 
        ...d, 
        isMock:true, 
        sections:JSON.stringify([]), 
        cards:JSON.stringify(d.cards),
        purpose:d.purpose || initPurpose,
        frontCardId:d.cards[0].id, 
        //mock athlete group only has one player
        player:group.players[0],
        hasPhoto:false
    }));
}

const mockAthlete = { id:"reneeRegis", firstName:"Renee", surname:"Regis" }
const mockAthleteDecks = [
    {
        _id:"athleteDeck0",
        phase:{ id:"general1", title:"General Cycle 1" },
        player:mockAthlete,
        cards:createMockCards({ startDate:seasonStartDate, nrCards:4, weeksPerCard:1, cardTitles }),
        purpose:[
            "I will get back to the base line expected fitness standards so I am ready to progress", 
            "I will do this by following a stricter diet plan, increasing total distance each week, and adding swimming sessions"
        ]
    },
    {
        _id:"athleteDeck1",
        phase:{ id:"general2", title:"General Cycle 2" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(4, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck2",
        phase:{ id:"general3", title:"General Cycle 3" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(8, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck3",
        phase:{ id:"specific1-1", title:"Specific 1 Cycle 1" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(12, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck4",
        phase:{ id:"specific1-2", title:"Specific 1 Cycle 2" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(16, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck5",
        phase:{ id:"specific2-1", title:"Specific 2 Cycle 1" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(20, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck6",
        phase:{ id:"specific2-2", title:"Specific 2 Cycle 2" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(24, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck7",
        phase:{ id:"competition1", title:"Competition Cycle 1" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(28, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    },
    {
        _id:"athleteDeck8",
        phase:{ id:"competition2", title:"Competition Cycle 2" },
        player:mockAthlete,
        cards:createMockCards({ startDate:addWeeks(32, seasonStartDate), nrCards:4, weeksPerCard:1, cardTitles }),
    }
]

const englandSections = [
    { key:"section1", title: "Psych Social", initials: "PSO" },
    { key:"section2", title: "Technical", initials: "TEC" },
    { key:"section3", title: "Physical", initials: "PHY" },
    { key:"section4", title: "Tactical", initials: "TAC" },
    { key:"section5", title: "Review", initials: "REV" }
]

const englandCards = [
    {
        title:"Week 1",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 5 successful dribbles" },
            { title:"KPI: 7 Sprints and 6 high speed runs" },
            { title:"KPI:In space to receive 30% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
        ]
    },
    {
        title:"Week 2",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 6 successful dribbles" },
            { title:"KPI: 8 Sprints and 6 high speed runs" },
            { title:"KPI: In space to receive 33% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
        ]
    },
    {
        title:"Week 3",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 7 successful dribbles" },
            { title:"KPI: 9 Sprints and 7 high speed runs"  },
            { title:"KPI: In space to receive 35% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
        ]
    },
    {
        title:"Week 4",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 8 successful dribbles" },
            { title:"KPI: 10 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 37% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
        ]
    },
    {
        title:"Week 5",
        items:[
            { title:"Meet with Steve about staying calm on the ball" },
            { title:"KPI: 9 successful dribbles" },
            { title:"KPI:11 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 40% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
        ]
    },
    {
        title:"Week 6",
        items:[
            { title:"Task from Steve and questionnaire" },
            { title:"KPI: 9 successful dribbles" },
            { title:"KPI: 11 Sprints and 8 high speed runs"  },
            { title:"KPI: In space to receive 40% of attacks" },
            { title:"Watch video and answer questions", attachments: [{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }] },
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
    //playerA (Sam ago-a)
    [[2,0,2,1,2], [1,0,2,0,2], [2,2,1,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //playerB (michael Golding)
    [[1,2,1,1,2], [2,2,2,0,1], [2,2,1,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //playerC
    [[2,2,2,2,2], [0,1,2,2,0], [0,2,2,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //playerD
    [[2,2,2,2,2], [2,2,2,2,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //playerE
    [[2,2,1,2,1], [2,2,1,1,2], [2,2,1,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    //playerF
    [[2,2,1,2,2], [2,2,0,2,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    [[0,1,0,0,0], [2,1,0,0,1], [2,1,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,2,2,2,2], [1,2,2,1,2], [2,2,2,2,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[2,1,2,1,1], [2,1,2,2,2], [2,2,2,2,1], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]], 
    [[2,2,2,0,2], [2,2,2,0,2], [2,2,2,1,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    [[0,0,0,0,1], [0,0,0,0,1], [0,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]],
    //15 up to here
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
    [[0,0,0,0,1], [0,0,0,0,1], [0,0,0,0,2], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]]
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

//@todo - add personal kpis here
const getPlayerKpis = p => [];

const playerPurpose = [
    "I will become a much more effective attacking player, contributing to chances and goals in every game", 
    "I will do this by making better dribbling choices, and also working on my fitness so I can do more sprints"
]

export const getPlayerDecks = group => {
    //helper
    const getDeckForPlayer = (p,i) => {
        //for now, only 1 deck per player, with generic content but custom statuses
        const initCards = createMockCards({ startDate:footballSeasonStartDate, nrCards:5, weeksPerCard:1, cardTitles });
        const cards = customiseCardsForPlayer(customiseCardsForActivity(initCards, "football"), p, i);

        //[{ key:"att-1", type: "video", link: "https://www.youtube.com/watch?v=6L89Uexdbwg" }]
        return {
            _id:`deck-${p._id}`,
            sections:JSON.stringify(englandSections),
            cards:JSON.stringify(cards),
            frontCardId:customiseFrontCardId(cards, p,i),
            kpis:[ ...group.kpis, ...getPlayerKpis(p) ]
                .map(kpi => ({ 
                    ...kpi, 
                    customDeckStartValue:p.kpiStartValues?.find(obj => 
                        obj.datasetKey === kpi.datasetKey && obj.measureKey === kpi.measureKey)?.value
                })),
            player:p,
            purpose:playerPurpose,
            settings:group.deckSettings,
            hasPhoto:true
        }
    }

    //1 deck per player for now
    return group.players.map((p,i) => getDeckForPlayer(p,i))
}