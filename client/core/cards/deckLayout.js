import * as d3 from 'd3';
import cardsLayout from "./cardsLayout";

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
        if(withSections === null){ sections = deckData.sections }
        else if(withSections === true){ 
            sections = deckData.sections || createDefaultSections(cards) 
        }
        //cards
        _cardsLayout.sections(sections);
        const cardsData = _cardsLayout(cards.map(c => ({ ...c, deckId:id, deckListPos:listPos })));

        return {
            ...deckData,
            cards:cardsData,
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

    return update;
}