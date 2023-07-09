import * as d3 from 'd3';

export default function cardsLayout(){
    let datasets = [];
    let info = {};
    let format = "profiles";

    function update(data){
        const _data = data.map((c,i) => {
                return {
                    ...c,
                    info:{ 
                        ...info,
                        date:c.date,
                        title:c.title,
                        progressStatus:c.progressStatus
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