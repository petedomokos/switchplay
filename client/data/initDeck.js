import * as d3 from 'd3';
import { addDays, addWeeks } from "../util/TimeHelpers"

const items = [
    { itemNr:1, status:0 }, { itemNr:2, status:0 }, { itemNr:3, status:0 }, { itemNr:4, status:0 }, { itemNr:5, status:0 },
]

export const createInitCard = (cardNr, options={}) => {
    const { date, startDate = new Date(), weeksPerCard=1, cardTitles=[] } = options;
    return {
        cardNr,
        title:cardTitles[cardNr] || `Level ${cardNr + 1}`,
        date:date || addWeeks(weeksPerCard * (cardNr + 1), startDate),
        items
    }
}
export const createInitCards = (options={}) => {
    const { nrCards=5 } = options;
    return d3.range(nrCards).map(i => createInitCard(i, options));
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