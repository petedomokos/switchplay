import { onlyUnique, sortAscending } from "../../util/ArrayHelpers";
import { embellishDeck } from "./embellishDecks";
import * as d3 from 'd3';

const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

const groupDecks = (decks, groupingTag) => {
  console.log("groupDecks...........", decks);
  const sortedDecks = sortAscending(decks, d => d.date);

  const tagIdsToGroup = sortedDecks
    .filter(d => !!d[groupingTag])
    .map(d => d[groupingTag].id)
    .filter(onlyUnique);

  console.log("tagIdsToGroup", tagIdsToGroup)
  
  if(tagIdsToGroup.length === 0){ return []; }
  
  return tagIdsToGroup.map(tagId => {
      //wlog, we use first deck to get the groupingTag
      const firstDeckInGroup = sortedDecks.find(d => d[groupingTag].id === tagId);
      return {
        id:`${groupingTag}-${tagId}`,
        groupingTagObj:firstDeckInGroup[groupingTag],
        decks: sortedDecks.filter(d => d[groupingTag].id === tagId)
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

const createDeckOfDecks = (group, groupingTag) => {
  console.log("createDoD", group)
  const { id, groupingTagObj, decks } = group;
  const cardNamingTag = groupingTag === "player" ? "phase" : "player";
  const sortedDecks = sortAscending(decks, d => d.date);
  return {
    //add in deck stuff here
    id,
    title:groupingTagObj.title,
    frontCardId: getFrontCardId(sortedDecks), //need the nr not the deck!
    isDeckOfDecks:true,
    //if grouped by player, then deck title is the player. Else its the phase.
    player:groupingTag === "player" ? groupingTagObj : null,
    phase:groupingTag === "phase" ? groupingTagObj : null,
    hasPhoto:true,
    sections:[],
    kpis:[],
    //cards are the decks themselves
    cards:sortedDecks.map((d,i) => ({
      id:d.id,
      cardNr:i,
      date:d.date,
      //...d,
      purpose:d.purpose,
      title:d[cardNamingTag]?.title || "",
      items:d.cards.map(c => ({
        itemNr:c.cardNr,
        title:c.title,
        status:c.status //this is already calculated in the embellishDecks call in CardTable
      })),
    }))
  }
}

const formatDecks = (decks, settings={}) => {
  const { timeframeKey, groupingTag } = settings;
  //console.log("formatDecks..... tKey", timeframeKey)
  //console.log("formatDecks..... gkey", groupingTag)
  if(!groupingTag){ return decks; }
  //group decks by tags
  const groupedDecks = groupDecks(decks, groupingTag);
  //console.log("groupedDecks", groupedDecks)
  //error is above line - as all decks are reneeregis, the grouping tag should put them altogether
  return groupedDecks.map(group => timeframeKey === "singleDeck" ? 
    getCurrentDeck(group.decks)
    : 
    embellishDeck(createDeckOfDecks(group, groupingTag), timeframeKey, groupingTag));
}

const wrapUrl = (filename, fileType="png", folder) => folder ? `/${folder}/${filename}.${fileType}` : `/${filename}.${fileType}`;
const wrapPlayer = playerId => playerId ? wrapUrl(playerId, "png", "players") : "";
const wrapPhase = phaseKey => phaseKey ? wrapUrl(phaseKey, "png", "phases") : "";

//photo dimns are based on reneeRegis photoSize 260 by 335.48 
const getPhotoUrl = (deck, settings) => {
  if(!deck.hasPhoto){ return false; }
  const { allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTag } = settings;
  //if deck of decks, we weant it to be of the groupingTagid
  const playerId = deck.player?.id;
  const phaseId = deck.phase?.id;

  //prioritise playerId over phaseKey
  if(!groupingTag){ 
    //playerId may be undefined or may be defined but same for all decks
    if(allPlayerIdsSame){ return wrapPhase(phaseId) || deck.photoUrl || ""; }
    return wrapPlayer(playerId) || wrapPhase(phaseId) || deck.photoUrl || ""; 
  }
  //its either grouped by player or phase, and this determines the photo we need
  return groupingTag === "player" ? wrapPlayer(playerId) : wrapPhase(phaseId);
}

export const tableLayout = (decks, nrCols=3, settings={}) => {
  const formattedDecks = formatDecks(decks, settings);
  console.log("formattedDecks", formattedDecks)
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