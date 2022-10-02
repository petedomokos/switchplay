import * as d3 from 'd3';

export default function kpisLayout(){
    let date = new Date();
    let
    let format = "progress";
    let datasets = [];

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
        //console.log("update kpis layout")

        const ctrlsData = [
            { key: "progress", label:"Progress", isSelected:format === "progress" },
            { key: "compare", label:"Compare", isSelected:format === "compare" }
        ]
        
        return data.map((kpi,i) => {
            const { date, yPC } = p;
            const prevCardDate = i === 0 ? undefined : data[i - 1];
            return {
                ...p,
                ctrlsData,
                x:timeScale(date),
                y:yScale(yPC),
                info,
                kpis:kpis/*.slice(0,1)*/.map((kpi,i) => {
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
                    const currentColour = "#696969";
                    const colours = {
                        current: currentColour,
                        target: "#DCDCDC",
                        expectedBehind:"red",
                        expectedAhead:currentColour
                    }

                    const isOnTrack = expectedCurrent.value <= currentValue;
                    const start = format === "compare" ? min : (previous?.value || min);
                    const end = format === "compare" ? max : targetValue;

                    const rangeDatum = { id: "range", from:start, to:end, fill:"transparent", stroke:"grey" };
                    const targetDatum = { id: "target", from:start, to:targetValue, fill:colours.target };
                    const currentDatum = { id: "current", from:start, to:currentValue, fill:colours.current };
                    const targetHandleDatum = { ...targetDatum, value:targetDatum.to, pos:"above" }

                    const prevHandleDatum = { 
                        id: "previous", 
                        ...previous,
                        fill:colours.current,
                        pos:"below"
                    }

                    const expectedHandleDatum = { 
                        id: "expected", 
                        value:expectedCurrent.value,
                        //@todo - handle decreasing datasets ie less is best
                        fill:isOnTrack ? colours.expectedAhead : colours.expectedBehind,
                        pos:"above"
                    }
                    const barsData = format === "compare" ? [rangeDatum, targetDatum, currentDatum] : [rangeDatum, currentDatum];
                    const handlesData = format === "compare" ? [prevHandleDatum, targetHandleDatum, expectedHandleDatum] : [expectedHandleDatum];

                    //@todo later - handle target === 0
                    const pcCompletion = targetValue !== 0 ? ((currentValue/targetValue) * 100).toFixed(0) : 100;
                    const numbersData = format === "compare" ? 
                        [ 
                            { id: "actual", value: currentValue, colour:colours.current } 
                        ]
                        :
                        [
                            { id: "pc", value: `${pcCompletion}%`, colour:isOnTrack ? colours.current : "red" },
                            { id: "actual", value: `${currentValue}`, colour:colours.current }
                        ]
                    if(currentValue < expectedCurrent.value){
                        barsData.push({ id:"deficit", from:currentValue, to:expectedCurrent.value, fill:"red" })
                    }

                    return {
                        id:`kpi${i}`, // temp - in reality, each kpi unique id will come from datasetId + statId
                        ...kpi,
                        //stat full name stands alone without needing the dataset name before it
                        name:stat.fullNameShort,
                        longName:stat.fullNameLong,
                        unit:stat.unit,
                        barsData,
                        handlesData,
                        numbersData,
                        bands:bands.map(band => ({ ...band, min:+band.min, max:+band.max })),
                        min,
                        max,
                        start,
                        end,
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

    update.date = function (value) {
        if (!arguments.length) { return date; }
        date = value;
        return update;
    };
    update.format = function (value) {
        if (!arguments.length) { return format; }
        //new value may be undefined in which case dont update it
        if(value){ format = value; }
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    return update;
}