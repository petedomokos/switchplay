import * as d3 from 'd3';
import cardsLayout from "./cardsLayout";
import { purposeLayout } from './purposeLayout';
import { sortAscending } from '../../util/ArrayHelpers';
import { hydrateDeckSections } from "../../data/sections";

const getFrontCardNr = (cards, frontCardId) => {
    if(!frontCardId){ return 0; }
    if(frontCardId === "current"){ 
        const now = new Date();
        return d3.least(cards.filter(c => c.date > now)).cardNr;
    }
    //all cards placed
    if(frontCardId === "none"){ return cards.length; }
    //custom card
    return cards.find(c => c.id === frontCardId).cardNr;
}

export default function deckLayout(){
    let datasets = [];
    let info = {};
    let format = "profiles";
    let withSections = null; //true, false or null
    let timeframeKey = "singleDeck"
    let groupingTag;

    const _cardsLayouts = {};

    function update(deckData){
        //next - photoUrl in here - based on playerId or phase or just deck.photoURL depending
        //on value of timeframeKey/timeframe and of groupingTag
        //add regirenee photo to backend, and get url working
        //thenadd mockfootball data, with playerId tags so deck photos show for all players
        //console.log("deckData", withSections, deckData)

        const { cards, id, listPos, purpose, frontCardId } = deckData;
        if(!_cardsLayouts[id]){
            _cardsLayouts[id] = cardsLayout();
        }
        const _cardsLayout = _cardsLayouts[id];
        //sections - if withSections, we create default sectins if none exist. if false, there are never sections
        const sections = withSections ? deckData.sections : null;
        //cards
        const numberedCards = sortAscending(cards, d => d.date).map((c,i) => ({ ...c, cardNr:i }));
        const frontCardNr = getFrontCardNr(numberedCards, frontCardId);
        
        _cardsLayout.sections(sections).frontCardNr(frontCardNr);
        const cardsData = _cardsLayout(numberedCards.map(c => ({ ...c, deckId:id, deckListPos:listPos })));

        return {
            ...deckData,
            purposeData:purposeLayout(purpose),
            frontCardNr,
            cardsData,
            sections, //may be undefined
        }
    }

    update.format = function (value) {
        if (!arguments.length) { return format; }
        if(value){ format = value; }
        return update;
    };
    update.withSections = function (value) {
        if (!arguments.length) { return withSections; }
        withSections = value;
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    update.info = function (value) {
        if (!arguments.length) { return info; }
        info = value;
        return update;
    };
    update.timeframeKey = function (value) {
        if (!arguments.length) { return timeframeKey; }
        timeframeKey = value;
        return update;
    };
    update.groupingTag = function (value) {
        if (!arguments.length) { return groupingTag; }
        groupingTag = value;
        return update;
    };

    return update;
}