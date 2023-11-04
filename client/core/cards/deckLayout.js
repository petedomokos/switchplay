import * as d3 from 'd3';
import cardsLayout from "./cardsLayout";

const calcDeckStatus = cards => {
    if(cards.filter(c => c.info.status !== 2).length === 0){ return 2; }
    if(cards.filter(c => c.info.status !== 2).length <= 2) { return 1; }
    return 0;
}

const calcCompletion = cards => {
    const allItems = cards
        .map(c => c.items)
        .reduce((a,b) => [...a, ...b], [])
        .filter(it => it.title);

    if(allItems.length === 0) { return 0; }

    const completedItems = allItems.filter(it => it.status === 2);
    return completedItems.length / allItems.length;
}

const createDefaultSections = cards => cards[0].items.map((it,i) => ({
    key:`section-${i+1}`, title:`Section ${i+1}`, initials:`S${i+1}`
}))

export default function decksLayout(){
    let datasets = [];
    let info = {};
    let format = "profiles";
    let withSections = null; //true, false or null

    const _cardsLayout = cardsLayout();

    function update(deckData){
        const { cards, id, listPos } = deckData;
        //sections - if withSections, we create default sectins if none exist. if false, there are never sections
        let sections;
        console.log("deckData.sections", deckData.sections)
        if(withSections === null){ sections = deckData.sections }
        else if(withSections === true){ 
            console.log("withSections", deckData.sections)
            sections = deckData.sections || createDefaultSections(cards) 
        }
        console.log("sections are", sections)
        //cards
        _cardsLayout.sections(sections);
        const processedCards = _cardsLayout(cards.map(c => ({ ...c, deckId:id, deckListPos:listPos })));

        return {
            ...deckData,
            cards:processedCards,
            sections, //may be undefined
            status:calcDeckStatus(processedCards),
            completion:calcCompletion(processedCards)
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

    return update;
}