import { addDays, addWeeks } from "../util/TimeHelpers"

const items = [
    { itemNr:1, status:0 }, { itemNr:2, status:0 }, { itemNr:3, status:0 }, { itemNr:4, status:0 }, { itemNr:5, status:0 },
]
export const initDeck = (userId, settings={}) => {    
    const now = new Date();
    return {
        owner:userId,
        id:`temp-${Date.now()}`,
        title:"",
        frontCardNr:0,
        ...settings,
        cards:[
            {
                cardNr:0,
                title:"Level 1",
                date:addWeeks(1, now),
                items
            },
            {
                cardNr:1,
                title:"Level 2",
                date:addWeeks(2, now),
                items
            },
            {
                cardNr:2,
                title:"Level 3",
                date:addWeeks(3, now),
                items
            },
            {
                cardNr:3,
                title:"Level 4",
                date:addWeeks(4, now),
                items
            },
            {
                cardNr:4,
                title:"Level 5",
                date:addWeeks(5, now),
                items
            }
        ]
    }
}