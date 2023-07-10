import { addDays, addWeeks } from "../util/TimeHelpers"

const items = [
    { itemNr:0, status:0 }, { itemNr:1, status:0 }, { itemNr:2, status:0 }, { itemNr:3, status:0 }, { itemNr:4, status:0 },
]
export const initStack = (userId) => {    
    const now = new Date();
    return {
        owner:userId,
        id:"temp",
        title:"",
        cards:[
            {
                cardNr:0,
                id:"1",
                title:"Level 1",
                date:addWeeks(1, now),
                items
            },
            {
                cardNr:1,
                id:"2",
                title:"Level 2",
                date:addWeeks(2, now),
                items
            },
            {
                cardNr:2,
                id:"3",
                title:"Level 3",
                date:addWeeks(3, now),
                items
            },
            {
                cardNr:3,
                id:"4",
                title:"Level 4",
                date:addWeeks(4, now),
                items
            },
            {
                cardNr:4,
                id:"5",
                title:"Level 5",
                date:addWeeks(5, now),
                items
            }
        ]
    }
}