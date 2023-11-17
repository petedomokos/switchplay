import { sortAscending } from "../../util/ArrayHelpers";
import { embellishDeck } from "./embellishDecks";
import * as d3 from 'd3';
import { tagInfoArray } from "../../data/tagInfoArray";
import { groupBy } from "lodash";

const calcColNr = (i, nrCols) => i % nrCols;
const calcRowNr = (i, nrCols) => Math.floor(i/nrCols);

/*
 - LATER - hydarte tags using json stringify

- LATER - add playerId to each decks tags in storage, and add a full player object to the tag in hydrateDeck function with player name and photo
 - LATER - add a .photo to each deck, which is rendered under the deck header to the left. 
 Each deck can render a photo, and it constructs the link using teh playerName if deck.player exists,
 or deck.title otherwise; (note - later, we will need a way of determining if =the phot should beof a player or of the deck title)
 (also later, we can add a media property to it, similar to the progile cards media in previous version,
 so we can store all media links in it for each card and item of deck too


if timeExtent is decks,
 - create a new deck object for each playerId -> deck title = player name, deck photo = player photo, and calc its 
   completion proportion as an avergae of all decks completion proportions
 - the cards inside each deck are the decks for that player, ordered by date (note - wont be able to render it until we impl 
  the code to allow any number of cards) so we just filter all decks for ones that have that playerId,
  and give each card a .cardNr property too, based on position within the deck
 - the items of each card are the cards of the deck, so just convert .cards to .items and the cardNr to itemNr (note: each card will have a title
  and a status, so they meet the criteria for being an item in the cardItems component)
 - the cardHeader component will need an api to tell the progressStatus that it is rendering a trophy on each cardHeader,
 rather than a chain/polygon, and that trophy should be coded to expect/look for completion proportion rather than status of items
 - change nr cards to 4 for each cycle -> allow any number of cards per deck -> always show up to 5 in hand (ie held), and a ... icon to show there are more


*/

const groupDecks = (decks, groupingTagKey) => {
  const tags = tagInfoArray.find(info => info.key === groupingTagKey)?.values || [];
  //remove decks that do not have a value specified for this key
  const filteredDecks = decks.filter(d => !!d.tags.find(t => t.key === groupingTagKey))
  const sortedDecks = sortAscending(filteredDecks, d => d.date);
  
  return tags.map(tag => {
      const { title, value } = tag;
      const id = `${groupingTagKey}-${value}`;
      return {
        id, 
        title,
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
    })).slice(0,5)
  }
}

const formatDecks = (decks, timeExtent, groupingTagKey) => {
  if(!groupingTagKey){ return decks; }
  //group decks by tags
  const groupedDecks = groupDecks(decks, groupingTagKey);
  return groupedDecks.map(group => timeExtent === "single-deck" ? 
    getCurrentDeck(group.decks) 
    : 
    embellishDeck(createDeckOfDecks(group, groupingTagKey), timeExtent, groupingTagKey));
}



export const tableLayout = (decks, nrCols=3, timeExtent="single-deck", groupingTagKey) => {
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