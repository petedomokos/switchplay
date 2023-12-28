import * as d3 from 'd3';

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

export const embellishDeck = (deck, settings={}) => {
  console.log("embellishDeck", deck)
  const { allPlayerIdsSame, allPlayerIdsUnique, timeframeKey, groupingTag } = settings;
  //console.log("timeframeKey gTag",timeframeKey, groupingTag)
  const cards = deck.cards.map(c => ({
    ...c,
    status:calcCardStatus(c.items)
  }));

  const playerName = deck.player ? `${deck.player.firstName} ${deck.player.surname}` : "";
  const phaseTitle = deck.phase?.title || "";

  console.log("playerName allidssame", playerName, allPlayerIdsSame)


  const getTitle = () => {
    console.log("getTitle", playerName)
    //Both could be undefined
    
    if(allPlayerIdsSame){
      //we dont display player name
      return phaseTitle || deck.title || deck.id;
    }
    return playerName && phaseTitle ? `${playerName} (${phaseTitle})` : 
      playerName || phaseTitle || deck.title || deck.id;
  }

  const tit = getTitle();
  console.log("tit", tit)

  return {
    ...deck,
    title:getTitle(),
    date:d3.max(cards, d => d.date),
    cards,
    status:calcDeckStatus(cards),
    completion:calcDeckCompletion(cards)
  }
}

export const embellishDecks = (decks, timeframeKey, groupingTag) => decks.map(d => embellishDeck(d, timeframeKey, groupingTag));