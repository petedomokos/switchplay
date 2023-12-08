import { onlyUnique, sortAscending } from "../../util/ArrayHelpers";
import { embellishDeck } from "./embellishDecks";
import * as d3 from 'd3';
import { tagInfoArray } from "../../data/tagInfoArray";

const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

const groupDecks = (decks, groupingTagKey, playerType) => {
  const tags = tagInfoArray
    .find(info => info.key === groupingTagKey)
    ?.values
    ?.filter(t => t.playerType === playerType) 
    || [];

  //remove decks that do not have a value specified for this key
  const filteredDecks = decks
  //must group by the value of the tag
    .filter(d => !!d.tags.find(t => t.key === groupingTagKey)?.value)

  if(filteredDecks.length === 0){ return []; }
  const sortedDecks = sortAscending(filteredDecks, d => d.date);

  const tagValuesToGroup = sortedDecks
    .map(d => d.tags.find(t => t.key === groupingTagKey))
    .filter(onlyUnique)
  
  return tagValuesToGroup.map(tag => {
      const { title, value } = tag;
      const id = `${groupingTagKey}-${value}`;
      return {
        id, 
        title,
        //we remove the secondary (eg "phase" tag) as they are used to create each card instead
        tags:[{ key:groupingTagKey, value }],
        decks: sortedDecks.filter(d => d.tags.find(t => t.key === groupingTagKey)?.value === value)
      }
  })
}


const getCurrentDeck = decks => {
  const now = new Date();
  return d3.least(decks.filter(d => d.date > now), d => d.date)
}

const getFrontCardId = cards => {
  const now = new Date();
  //const indexedDecks = decks.map((d,i) => ({ ...d, index:i }));
  return d3.least(cards.filter(d => d.date > now), d => d.date)?.id;
}

const createDeckOfDecks = (group, groupingTagKey) => {
  const { id, title, tags, decks } = group;
  const cardNamingKey = groupingTagKey === "playerId" ? "phase" : "playerId";
  const sortedDecks = sortAscending(decks, d => d.date);
  return {
    //add in deck stuff here
    id,
    title,
    tags,
    frontCardId: getFrontCardId(sortedDecks), //need the nr not the deck!
    isDeckOfDecks:true,
    //cards are the decks themselves
    cards:sortedDecks.map((d,i) => ({
      id:d.id,
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

const formatDecks = (decks, settings={}) => {
  const { timeframeKey, groupingTagKey, playerType } = settings;
  if(!groupingTagKey){ return decks; }
  const decksWithTag = decks.filter(d => !!d.tags?.find(t => t.key === groupingTagKey))
  //group decks by tags
  const groupedDecks = groupDecks(decksWithTag, groupingTagKey, playerType);
  return groupedDecks.map(group => timeframeKey === "singleDeck" ? 
    getCurrentDeck(group.decks)
    : 
    embellishDeck(createDeckOfDecks(group, groupingTagKey), timeframeKey, groupingTagKey));
}

const wrapUrl = (filename, fileType="png", folder) => folder ? `/${folder}/${filename}.${fileType}` : `/${filename}.${fileType}`;
const wrapPlayer = playerId => playerId ? wrapUrl(playerId, "png", "players") : "";
const wrapPhase = phaseKey => phaseKey ? wrapUrl(phaseKey, "png", "phases") : "";

//photo dimns are based on reneeRegis photoSize 260 by 335.48 
const getPhotoUrl = (deck, settings) => {
  const { allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTagKey } = settings;
  const playerId = deck.tags.find(t => t.key === "playerId")?.value;
  const phaseKey = deck.tags.find(t => t.key === "phase")?.value;

  //prioritise playerId over phaseKey
  if(!groupingTagKey){ 
    //playerId may be undefined or may be defined but same for all decks
    if(allPlayerIdsSame){ return wrapPhase(phaseKey) || deck.photoUrl || ""; }
    return wrapPlayer(playerId) || wrapPhase(phaseKey) || deck.photoUrl || ""; 
  }

  //decks are grouped, so its either a deck of decks (longTerm) or its a singleDeck eg the current deck
  if(timeframeKey === "longTerm"){
    //its a deck of decks, can assume grouped by playerId for now
    //@todo - impl later the option to group by any tagKey
    return wrapPlayer(playerId) || "";
  }
  //its a singleDeck of a grouped set of decks, so for now can assume each deck is a phase
  //@todo - impl the option to have different second keys
  return wrapPhase(phaseKey) || "";
}



export const tableLayout = (decks, nrCols=3, settings={}) => {
  const formattedDecks = formatDecks(decks, settings);
  //add table positions
  return formattedDecks.map((d,i) => ({
      ...d, 
      photoUrl:getPhotoUrl(d, settings),
      //@todo - impl layoutFormat grid
      colNr: /*layoutFormat === "grid" ? d.fixedColNr :*/ calcColNr(i, nrCols),
      rowNr: /*layoutFormat === "grid" ? d.fixedRowNr :*/ calcRowNr(i, nrCols),
      listPos:i,
  }))
}