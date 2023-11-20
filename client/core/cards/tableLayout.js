import { sortAscending } from "../../util/ArrayHelpers";
import { embellishDeck } from "./embellishDecks";
import * as d3 from 'd3';
import { tagInfoArray } from "../../data/tagInfoArray";

const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

const groupDecks = (decks, groupingTagKey) => {
  const tags = tagInfoArray.find(info => info.key === groupingTagKey)?.values || [];
  //remove decks that do not have a value specified for this key
  const filteredDecks = decks.filter(d => !!d.tags.find(t => t.key === groupingTagKey));
  if(filteredDecks.length === 0){ return []; }
  const sortedDecks = sortAscending(filteredDecks, d => d.date);
  
  return tags.map(tag => {
      const { title, value } = tag;
      const id = `${groupingTagKey}-${value}`;
      return {
        id, 
        title,
        //we remove the secondary (eg "phase" tag) as they are used to create each card instead
        tags:[{ key:groupingTagKey, value }],
        decks: sortedDecks
      }
  })
}


const getCurrentDeck = decks => {
  const now = new Date();
  return d3.least(decks.filter(d => d.date > now), d => d.date)
}

const getFrontCardNr = decks => {
  const now = new Date();
  const indexedDecks = decks.map((d,i) => ({ ...d, index:i }));
  return d3.least(indexedDecks.filter(d => d.date > now), d => d.date)?.index || 0
}

const createDeckOfDecks = (group, groupingTagKey) => {
  const { id, title, tags, decks } = group;
  const cardNamingKey = groupingTagKey === "playerId" ? "phase" : "playerId";
  const sortedDecks = sortAscending(decks, d => d.date);
  //console.log("sortedDecks", sortedDecks)
  return {
    //add in deck stuff here
    id,
    title,
    tags,
    frontCardNr: getFrontCardNr(decks), //need the nr not the deck!
    //need photoLink...
    //cards are the decks themselves
    cards:sortedDecks.map((d,i) => ({
      cardNr:i,
      date:d.date,
      //...d,
      purpose:d.purpose,
      title:d.tags.find(t => t.key === cardNamingKey)?.title,
      items:d.cards.map(c => ({
        itemNr:c.cardNr,
        title:c.title,
        status:c.status //this is already calculated in the embellishDecks call in CardTable
      }))
    }))
  }
}

const formatDecks = (decks, timeExtent, groupingTagKey) => {
  if(!groupingTagKey){ return decks; }
  const decksWithTag = decks.filter(d => !!d.tags?.find(t => t.key === groupingTagKey))
  //group decks by tags
  const groupedDecks = groupDecks(decksWithTag, groupingTagKey);
  return groupedDecks.map(group => timeExtent === "singleDeck" ? 
    getCurrentDeck(group.decks) 
    : 
    embellishDeck(createDeckOfDecks(group, groupingTagKey), timeExtent, groupingTagKey));
}



export const tableLayout = (decks, nrCols=3, settings={}) => {
  const { allPlayerIdsSame, allPlayerIdsUnique, timeExtent, groupingTagKey } = settings;
  const formattedDecks = formatDecks(decks, timeExtent, groupingTagKey);
  //add table positions
  return formattedDecks.map((d,i) => ({
      ...d, 
      //@todo - impl layoutFormat grid
      colNr: /*layoutFormat === "grid" ? d.fixedColNr :*/ calcColNr(i, nrCols),
      rowNr: /*layoutFormat === "grid" ? d.fixedRowNr :*/ calcRowNr(i, nrCols),
      listPos:i,
  }))
}