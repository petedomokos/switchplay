import * as d3 from 'd3';
import { tagInfoArray } from '../../data/tagInfoArray';

export const calcCardStatus = items => {
  if(items.filter(it => it.status !== 2).length === 0){ return 2; }
  if(items.filter(it => it.status !== 2).length <= 2) { return 1; }
  return 0;
}

const calcDeckStatus = cards => {
  if(cards.filter(c => c.status !== 2).length === 0){ return 2; }
  if(cards.filter(c => c.status !== 2).length <= 2) { return 1; }
  return 0;
}

const calcDeckCompletion = cards => {
  const allItems = cards
      .map(c => c.items)
      .reduce((a,b) => [...a, ...b], [])
      .filter(it => it.title);

  if(allItems.length === 0) { return 0; }

  const completedItems = allItems.filter(it => it.status === 2);
  return completedItems.length / allItems.length;
}

const getTagTitle = tag => {
  const values = tagInfoArray.find(tagInfoArray => tagInfoArray.key === tag.key)?.values;
  return values?.find(v => v.value === tag.value)?.title
}

export const embellishDeck = (deck, settings={}) => {
  const { allPlayerIdsSame, allPlayerIdsUnique, timeExtent, groupingTagKey } = settings;
  const cards = deck.cards.map(c => ({
    ...c,
    status:calcCardStatus(c.items)
  }));

  //first, add title to each tag from the tagInfoArray file
  const tags = deck.tags.map(t => ({ ...t, title:getTagTitle(t) }));
  const playerTag = tags.find(t => t.key === "playerId");
  const phaseTag = tags.find(t => t.key === "phase");
  const playerName = playerTag?.title
  const phaseTitle = phaseTag?.title;

  const getTitle = () => {
    //Both could be undefined
    
    if(allPlayerIdsSame){
      //we dont display player name
      return phaseTitle || deck.title || deck.id;
    }
    return playerName && phaseTitle ? `${playerName} (${phaseTitle})` : 
      playerName || phaseTitle || deck.title || deck.id;
  }

  const getPhotoURL = () => {
    if(allPlayerIdsSame){
      //we dont display player name
      return deck.photoURL || phaseTag?.value || ""
    }
    return deck.photoURL || playerTag?.value || ""; 
    //this will correspond to playerids in db, later we will wire it up 
    //rather than hardcode them in tagInfoArray
  }

  return {
    ...deck,
    title:getTitle(),
    photoURL:getPhotoURL(),
    date:d3.max(cards, d => d.date),
    cards,
    tags,
    status:calcDeckStatus(cards),
    completion:calcDeckCompletion(cards)
  }
}

export const embellishDecks = (decks, timeExtent, groupingTagKey) => decks.map(d => embellishDeck(d, timeExtent, groupingTagKey));