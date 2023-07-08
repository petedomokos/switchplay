import { addDays, addWeeks } from "../../util/TimeHelpers"

const now = new Date();
export const mockCards = [
    {
        id:"1",
        title:"Level 1",
        date:addWeeks(1, now)
    },
    {
        id:"2",
        title:"Level 2",
        date:addWeeks(2, now)
    },
    {
        id:"3",
        title:"Level 3",
        date:addWeeks(3, now)
    },
    {
        id:"4",
        title:"Level 4",
        date:addWeeks(4, now)
    },
    {
        id:"5",
        title:"Level 5",
        date:addWeeks(5, now)
    }
]