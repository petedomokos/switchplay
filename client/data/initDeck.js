import * as d3 from 'd3';
import { addDays, addWeeks } from "../util/TimeHelpers"
import uuid from 'react-uuid';
import { DECK_SETTINGS } from '../core/cards/constants';

const items = [
    { itemNr:1, status:0, id:uuid() }, 
    { itemNr:2, status:0, id:uuid() }, 
    { itemNr:3, status:0, id:uuid() }, 
    { itemNr:4, status:0, id:uuid() }, 
    { itemNr:5, status:0, id:uuid() }
]

const createItems = options => {
    const { player } = options;
    return items.map((it, i) => ({
        ...it,
        //@todo - for people, add other optins eg all players in group, or player AND coach
        people:[player],
        steps:[],
        stats:[],
        attachments:[]
    }))
}

/*
*/
export const createInitCard = (deckSettings, options={}) => {
    const { cardNr, date, startDate = new Date(), prevDate, weeksPerCard=1, player, userId } = options;
    const calcDate = () => {
        if(prevDate){ return addWeeks(weeksPerCard, prevDate); }
        if(cardNr){ return addWeeks(weeksPerCard * (cardNr + 1), startDate) }
        return addWeeks(weeksPerCard, new Date());
    }
    const cardTitleSettingsObj = deckSettings.find(set => set.key === "defaultCardTitle");
    const cardTitleSettingsValue = cardTitleSettingsObj.value;
    const cardTitleSetting = cardTitleSettingsObj.options.find(opt => opt.value === cardTitleSettingsValue);

    return {
        id:uuid(),
        title:cardTitleSetting.getTitle(cardNr), //cardNr ? (cardTitles[cardNr] || `Level ${cardNr + 1}`) : "Enter Title...",
        //next - finaih this so it doesnt need a cardNr... or always pass a cardNr
        date:date || calcDate(),
        items:createItems(options)
    }
}

export const createInitCards = (deckSettings, options={}) => {
    console.log("createInitCards set", deckSettings)
    const nrOfCards = deckSettings.find(set => set.key === "numberOfCards").value;
    console.log("createInitCards nrCards", nrOfCards)
    return d3.range(nrOfCards).map(i => createInitCard(deckSettings, { ...options, cardNr:i }));
}

export const initDeck = (user, options={}) => {  
    console.log("initDeck..........user", user)
    const { player } = options;  
    const settings = user.groupsMemberOf[0]?.deckSettings || DECK_SETTINGS;
    return {
        startDate:new Date(),
        owner:user._id,
        editors:player && player._id !== user._id ? [user._id, player._id] : [user._id],
        id:`temp-${Date.now()}`,
        title:"",
        ...options,
        //@todo - allow options to determine which group's settings to use
        settings,
        cards:createInitCards(settings, { player, userId:user._id })
    }
}