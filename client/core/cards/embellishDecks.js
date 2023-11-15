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

export const embellishDeck = (deck, timeExtent, groupingTagKey) => {
  const cards = deck.cards.map(c => ({
    ...c,
    status:calcCardStatus(c.items)
  }));

  //first, add title to each tag from the tagInfoArray file
  const tags = deck.tags.map(t => ({ ...t, title:getTagTitle(t) }));
  //then use that to assign the correct title to deck
  const primaryTitle = tags.find(t => t.key === groupingTagKey)?.title;
  const secondaryTitleKey = groupingTagKey === "playerId" ? "phase" : "playerId";
  //in all-decks view, the second grouping is not relevant as all are put into a single deck to represent all decks
  const secondaryTitle = timeExtent === "all-decks" ? "" : tags.find(t => t.key === secondaryTitleKey)?.title;
  const fullTitle = secondaryTitle ? `${primaryTitle} (${secondaryTitle})` : primaryTitle;

  return {
    ...deck,
    title:fullTitle,
    primaryTitle,
    secondaryTitle,
    date:d3.max(cards, d => d.date),
    cards,
    tags,
    status:calcDeckStatus(cards),
    completion:calcDeckCompletion(cards)
  }
}

export const embellishDecks = (decks, timeExtent, groupingTagKey) => decks.map(d => embellishDeck(d, timeExtent, groupingTagKey));