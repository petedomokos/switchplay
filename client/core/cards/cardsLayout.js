import * as d3 from 'd3';
import { calcDateCount } from '../../util/TimeHelpers';
import { isNumber } from '../../data/dataHelpers';

const calcCardStatus = items => {
    if(items.filter(it => it.status !== 2).length === 0){ return 2; }
    if(items.filter(it => it.status !== 2).length <= 2) { return 1; }
    return 0;
}

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
            const { deckId, cardNr, title="", date, items } = c;
            return {
                ...c,
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
                    title,
                    status:calcCardStatus(items)
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