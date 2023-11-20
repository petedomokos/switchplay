import * as d3 from 'd3';
import { addDays, addWeeks } from "../util/TimeHelpers"
import uuid from 'react-uuid';

const items = [
    { itemNr:1, status:0, id:uuid() }, 
    { itemNr:2, status:0, id:uuid() }, 
    { itemNr:3, status:0, id:uuid() }, 
    { itemNr:4, status:0, id:uuid() }, 
    { itemNr:5, status:0, id:uuid() }
]

/*
*/
export const createInitCard = (options={}) => {
    const { cardNr, date, startDate = new Date(), prevDate, weeksPerCard=1, cardTitles=[] } = options;
    const calcDate = () => {
        if(prevDate){ return addWeeks(weeksPerCard, prevDate); }
        if(cardNr){ return addWeeks(weeksPerCard * (cardNr + 1), startDate) }
        return addWeeks(weeksPerCard, new Date());
    }
    return {
        id:uuid(),
        title:cardNr ? (cardTitles[cardNr] || `Level ${cardNr + 1}`) : "Enter Title...",
        //next - finaih this so it doesnt need a cardNr... or always pass a cardNr
        date:date || calcDate(),
        items
    }
}

export const createInitCards = (options={}) => {
    const { nrCards=5 } = options;
    return d3.range(nrCards).map(i => createInitCard({ ...options, cardNr:i }));
}

export const initDeck = (userId, settings={}) => {    
    return {
        startDate:new Date(),
        owner:userId,
        id:`temp-${Date.now()}`,
        title:"",
        ...settings,
        cards:createInitCards()
    }
}