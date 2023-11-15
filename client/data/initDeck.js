import * as d3 from 'd3';
import { addDays, addWeeks } from "../util/TimeHelpers"

const items = [
    { itemNr:1, status:0 }, { itemNr:2, status:0 }, { itemNr:3, status:0 }, { itemNr:4, status:0 }, { itemNr:5, status:0 },
]
export const createInitCards = (options={}) => {
    const { startDate = new Date(), nrCards=5, weeksPerCard=1, cardTitles=[] } = options;

    const NR_CARDS = 5
    return d3.range(NR_CARDS).map(i => ({
    //return d3.range(nrCards).map(i => ({
        cardNr:i,
        title:cardTitles[i] || `Level ${i + 1}`,
        date:addWeeks(weeksPerCard * (i + 1), startDate),
        items
    }))
}

export const initDeck = (userId, settings={}) => {    
    return {
        owner:userId,
        id:`temp-${Date.now()}`,
        title:"",
        frontCardNr:0,
        ...settings,
        cards:createInitCards()
    }
}