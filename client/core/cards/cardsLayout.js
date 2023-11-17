import * as d3 from 'd3';
import { calcDateCount } from '../../util/TimeHelpers';
import { isNumber } from '../../data/dataHelpers';
import { mockCardFlags } from './mockCardFlags';
import { purposeLayout } from './purposeLayout';

export default function cardsLayout(){
    let datasets = [];
    let sections;
    let info = {};
    let format = "profiles";

    function update(cardsData){
        const now = new Date();

        const getSection = (it,i) => {
            if(it.sectionKey){ return sections.find(s => s.key === it.sectionKey) }
            return sections[i]
        }

        const _data = cardsData.map((c,i) => {
            const { deckId, cardNr, title="", date, items, purpose } = c;

            const mockFlags = mockCardFlags[i] || [];
            return {
                ...c,
                purposeData:purposeLayout(purpose), //is defined when its a deck-of-decks
                flagsData:mockFlags.map((flag,i) => ({ ...flag, key:`deck-${deckId}-card-${cardNr}-flag-${i}` })),
                items:c.items.map((it,i) => ({ 
                    ...it, 
                    deckId,
                    cardNr, 
                    //sectioning defaults to by itemNr
                    section:getSection(it, i),
                    title:it.title || "" ,
                    key:`deck-${deckId}-card-${cardNr}-item-${it.itemNr}`
                })),
                info:{ 
                    ...info,
                    date,
                    dateCount:calcDateCount(now, date),
                    title
                },
            }
        })
        if(_data[0] && _data[0].cardNr !== _data.length){
            //hasnt been reversed yet
            return _data.reverse();
        }
        return _data;
    }

    update.format = function (value) {
        if (!arguments.length) { return format; }
        if(value){ format = value; }
        return update;
    };
    update.sections = function (value) {
        if (!arguments.length) { return sections; }
        sections = value;
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