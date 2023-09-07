import * as d3 from 'd3';
import cardsLayout from "./cardsLayout";

const calcStackStatus = cards => {
    if(cards.filter(c => c.info.status !== 2).length === 0){ return 2; }
    if(cards.filter(c => c.info.status !== 2).length <= 2) { return 1; }
    return 0;
}

export default function decksLayout(){
    let datasets = [];
    let info = {};
    let format = "profiles";

    const _cardsLayout = cardsLayout();

    function update(deckData){
        const { cards } = deckData;
        const processedCards = _cardsLayout(cards);
        return {
            ...deckData,
            cards:processedCards,
            status:calcStackStatus(processedCards)
        }
    }

    update.format = function (value) {
        if (!arguments.length) { return format; }
        if(value){ format = value; }
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