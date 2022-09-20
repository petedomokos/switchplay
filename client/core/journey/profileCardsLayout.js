import * as d3 from 'd3';

export default function profileCardsLayout(){
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;
    let datasets = [];
    let kpis = [];
    let info = {};

    let aligned = false;

    //helper
    const statValue = (date, statId, datapoints, method="latest") => {
        const relevantDatapoints = datapoints
            .filter(d => d.date <= date)
            .map(d => ({ ...d, value:d.values.find(v => v.measure === statId)?.value }))
            .map(d => ({ ...d, value:d.value ? +d.value : undefined }))
            .filter(d => d);

        //if(method === "latest"){
        //for now, assume latest only
        return d3.greatest(relevantDatapoints, d => d.date);
        //}
    }

    function update(data){
        //console.log("cardslayout data", data)
        //console.log("kpis", kpis)
        //console.log("datasets", datasets)
        
        return data.map((p,i) => {
            const { date, yPC } = p;
            const prevCardDate = i === 0 ? undefined : data[i - 1];
            return {
                ...p,
                x:timeScale(date),
                y:yScale(yPC),
                info,
                kpis:kpis.map(kpi => {
                    const { datasetId, statId } = kpi;
                    const dataset = datasets.find(dset => dset._id === datasetId);
                    const stat = dataset.measures.find(m => m._id === statId);
                    const { bands, standards } = stat;
                    const min = bands[0] ? +bands[0].min : undefined;
                    const max = bands[0] ? +bands[bands.length - 1].max : undefined;
                    const actualDatapoints = dataset.datapoints.filter(d => !d.isTarget);
                    const targetDatapoints = dataset.datapoints.filter(d => d.isTarget);
                    const currentDatapoint = d3.greatest(actualDatapoints, d => d.date);
                    const targetDatapoint = d3.greatest(targetDatapoints, d => d.date);
                    const currentValue = currentDatapoint ? +currentDatapoint.values.find(v => v.measure === statId).value : min;
                    //temp
                    const defaultTarg = currentValue ? currentValue * 1.5 : min;
                    const targetValue = targetDatapoint ? +targetDatapoint.values.find(v => v.measure === statId).value : defaultTarg;
                    const previous = statValue(prevCardDate, statId, actualDatapoints);
                    //for now, we manually seyt this to test it renders as red. But should be based on linear interpolation
                    const expectedCurrent = { date, value:currentValue * 1.3 };//calculateExpected(previous, target, date)
                    
                    //bars
                    let barsData = [
                        { id: "band", from:min, to:max, fill:"transparent" },
                        { id: "target", from:min, to:targetValue, fill:"#DCDCDC" },
                        { id: "current", from:min, to:currentValue, fill:"#696969" },
                    ];
                    if(currentValue < expectedCurrent.value){
                        barsData.push({ id:"deficit", from:currentValue, to:expectedCurrent.value, fill:"red" })
                    }
                    return {
                        ...kpi,
                        //stat full name stands alone without needing the dataset name before it
                        name:stat.fullNameShort,
                        longName:stat.fullNameLong,
                        unit:stat.unit,
                        barsData,
                        bands:bands.map(band => ({ ...band, min:+band.min, max:+band.max })),
                        min,
                        max,
                        standards:standards.map(standard => ({ ...standard, value:+standard.value })),
                        //3 date-value objects for previous, current and target values
                        previous,
                        current:{ date: currentDatapoint.date, value: currentValue },
                        target: targetDatapoint ? { date: targetDatapoint.date, value: targetValue } : undefined,
                        expectedCurrent,
                        actualDatapoints:actualDatapoints.map(d => ({ date:d.date, value:d.values.find(v => v.measure === statId).value }))
                    }
                })
            }
        });
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