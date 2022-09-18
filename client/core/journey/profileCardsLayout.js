import * as d3 from 'd3';

export default function profileCardsLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;
    let datasets = [];
    let kpis = [];
    let info = {};

    let aligned = false;

    function update(data){
        //console.log("cardslayout data", data)
        //console.log("kpis", kpis)
        //console.log("datasets", datasets)
        
        return data.map(p => ({
            ...p,
            x:timeScale(p.date),
            y:yScale(p.yPC),
            info,
            kpis:kpis.map(kpi => {
                const { datasetId, statId } = kpi;
                const dataset = datasets.find(dset => dset._id === datasetId);
                const stat = dataset.measures.find(m => m._id === statId);
                const { bands, standards } = stat;
                const actualDatapoints = dataset.datapoints.filter(d => !d.isTarget);
                const targetDatapoints = dataset.datapoints.filter(d => d.isTarget);
                const actualDatapoint = d3.greatest(actualDatapoints, d => d.date);
                const targetDatapoint = d3.greatest(targetDatapoints, d => d.date);
                const actualValue = actualDatapoint.values.find(v => v.measure === statId).value;
                const targetValue = targetDatapoint?.values.find(v => v.measure === statId).value;

                return {
                    ...kpi,
                    //stat full name stands alone without needing the dataset name before it
                    name:stat.fullNameShort,
                    longName:stat.fullNameLong,
                    unit:stat.unit,
                    bands:bands.map(band => ({ ...band, min:+band.min, max:+band.max })),
                    min:bands[0] ? +bands[0].min : undefined,
                    max:bands[0] ? +bands[bands.length - 1].max : undefined,
                    standards:standards.map(standard => ({ ...standard, value:+standard.value })),
                    actual:{ date: actualDatapoint.date, value: actualValue },
                    target: targetDatapoint ? { date: targetDatapoint.date, value: targetValue } : undefined,
                    actualDatapoints:actualDatapoints.map(d => ({ date:d.date, value:d.values.find(v => v.measure === statId).value }))
                }
            })
        }));
    }

    update.aligned = function (value) {
        if (!arguments.length) { return aligned; }
        aligned = value;
        return update;
    };
    update.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return update;
    };
    update.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return update;
    };
    update.currentZoom = function (value) {
        if (!arguments.length) { return currentZoom; }
        currentZoom = value;
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    update.kpis = function (value) {
        if (!arguments.length) { return kpis; }
        kpis = value;
        return update;
    };
    update.info = function (value) {
        if (!arguments.length) { return info; }
        info = value;
        return update;
    };

    return update;
}