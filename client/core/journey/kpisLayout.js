import * as d3 from 'd3';
import { addWeeks } from "../../util/TimeHelpers"
import { pcCompletion } from "../../util/NumberHelpers"
import { grey10 } from './constants';

export default function kpisLayout(){
    let date = new Date();
    let prevCardDate;
    let format = "target-completion";
    let datasets = [];
    let withDeficitBar = false;
    let allKpisActive = false;
    let noKpisActive = false;

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

    const parse = valueObject => valueObject ? ({ ...valueObject, value: +valueObject.value }) : undefined;

    const sortAscending = (data, accessor =  d => d) => {
        const dataCopy = data.map(d => d);
        return dataCopy.sort((a, b) => d3.ascending(accessor(a), accessor(b)))
    };

    function update(data){
        //console.log("update kpis layout", data)
        const now = new Date();
        const orderedData = sortAscending(data, d => d.date);
        const nextKpi = orderedData.find(kpi => kpi.date > new Date());
       
        return orderedData.map((kpi,i) => {
            const kpiDate = kpi.date || date;
            //if kpis have dates, we use these for previous, except for the first one which uses the prevCardDate setting
            const prevKpiDate = i === 0 ? prevCardDate : data[i-1].date;
            const prevDate = kpi.date ? prevKpiDate : prevCardDate;
            //can set all kpis to be active eg for an active profile card that doesnt have access to all data
            const isActive = allKpisActive || (kpi.id === nextKpi?.id && !noKpisActive);
            const isFuture = kpi.date > now;
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
            const current = parse(currentDatapoint?.values.find(v => v.measure === statId)) || { date:now, value: min };
            //temp
            const defaultTargValue = current?.value ? current.value * 1.5 : min;
            const defaultTarg = { date:addWeeks(4, now), value: defaultTargValue };
            const target = parse(targetDatapoint?.values.find(v => v.measure === statId)) || defaultTarg;
            //const pcCompletion = (value) => target.value !== 0 ? +(((+value/+target.value) * 100).toFixed(0)) : 100;
            //for now, if no previous, we default it to 50% of targ
            const achieved = statValue(kpiDate, statId, actualDatapoints) || { value: d3.max([target.value * 0.5, min]) };
            const previous = statValue(prevDate, statId, actualDatapoints) || { value: d3.max([target.value * 0.5, min]) };
            
            const _pcCompletionValue = pcCompletion(previous.value, target.value, current.value);
            //for now, we manually seyt this to test it renders as red. But should be based on linear interpolation
            const expectedCurrent = { date: kpiDate, value:(current?.value ? current.value * 1.3 : 0) };//calculateExpected(previous, target, date)
            //bars
            const currentColour = "#696969";
            const colours = {
                current: currentColour,
                target: "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour
            }

            //@todo - change formats to 3 types: 'Target Completion', 'Actual Score', and 'Standardised Score'
            const formatIsActual = format === "actual-value";
            const isOnTrack = expectedCurrent.value <= current.value;
            const start = format === "actual-value" ? min : (d3.min([previous?.value, current?.value]) || min);
            //console.log("previous", previous)
            //console.log("current", current)
            //console.log("min", min)
            const end = format === "actual-value" ? max : target.value;

            const rangeDatum = { id: "range", from:start, to:end, fill:"transparent", stroke:"grey" };
            const targetDatum = { id: "target", from:start, to:target.value, fill:colours.target };
            const currentDatum = { id: "current", from:start, to:current.value, fill:colours.current };
            const targetHandleDatum = { 
                ...targetDatum, 
                handleType:"triangle", 
                value:targetDatum.to, 
                pos:"above"
            }

            const prevHandleDatum = { 
                id: "previous",
                handleType:"line",
                stroke:"white",
                strokeWidth:0.5,
                strokeDasharray:4,
                ...previous,
                fill:colours.current,
                pos:"above"
            }

            const expectedHandleDatum = { 
                id: "expected",
                handleType:"triangle",
                value:expectedCurrent.value,
                //@todo - handle decreasing datasets ie less is best
                fill:isOnTrack ? colours.expectedAhead : colours.expectedBehind,
                pos:"below"
            }

            const currentHandleDatum = {
                id:'current',
                handleType:"rect",
                fill:"transparent",
                stroke:"white",
                strokeWidth:0.2,
                ...current,
                pcValue:_pcCompletionValue,
                format:formatIsActual ? "actual" : "pc"
            }
            const barsData = formatIsActual ? [rangeDatum, targetDatum, currentDatum] : [rangeDatum, currentDatum];

            let handlesData = [];
            if(formatIsActual) {
                if(previous){ handlesData.push(prevHandleDatum);}
                handlesData.push(currentHandleDatum, targetHandleDatum);
            }else{
                handlesData.push(currentHandleDatum);
                //only show expected handle on next future profile, not past or other future ones
            }
            if(isActive){
                handlesData.push(expectedHandleDatum);
            }
            
           
            const numbersData = formatIsActual ? 
                [ 
                    { id: "actual", value: current?.value, colour:colours.current } 
                ]
                :
                [
                    { id: "pc", value: `${_pcCompletionValue}%`, colour:isOnTrack ? colours.current : "red" },
                    { id: "actual", value: `${current?.value}`, colour:colours.current }
                ]

            if(withDeficitBar && current?.value < expectedCurrent.value){
                barsData.push({ id:"deficit", from:current?.value, to:expectedCurrent.value, fill:"red" })
            }

            const tooltipStyles = {
                bg:{ fill: "none" },
                title:{ stroke: "white" },
                value:{ fill:"white", stroke: grey10(7)}
            }
            let tooltipsData = [];
            
            if(formatIsActual){
                if(previous){
                    tooltipsData.push({ 
                        key: "previous",
                        title:"Previous",
                        desc: "...",
                        ...previous,
                        location:"above",
                        row:1, // very top
                        labelPos:"below",
                        styles:tooltipStyles
                    });
                }
                /*if(!isFuture){
                    //todo - finish all this...its a past kpi - just show the achieved datapoint
                    //but also show target
                    tooltipsData.push({ 
                        key: "achieved", 
                        title:"Achieved",
                        ...achieved,
                        location:"above",
                        row:0, // just above bar
                        styles:tooltipStyles
                        
                    })
                }else{*/
                    //its a future kpi
                    tooltipsData.push(
                        { 
                            key: "current", 
                            title:"Current",
                            ...current,
                            location:"above",
                            row:0, // just above bar
                            styles:tooltipStyles
                            
                        },
                        { 
                            key: "target",
                            title: "Target",
                            desc: "...",
                            ...target,
                            location:"above",
                            row:1, // very top,
                            styles:tooltipStyles
                        }
                    );
                    if(isActive){
                        tooltipsData.push({ 
                            key: "expected",
                            title:"Expected",
                            desc: "...",
                            ...expectedCurrent,
                            location:"below",
                            row:0, // just below bar
                            styles:tooltipStyles
                        });
                    }
                //}
                
            }else{
                tooltipsData.push({
                    key: "current", 
                    title:"Current",
                    desc: "...",
                    format:'pc',
                    ...current,
                    actualValue:current.value,
                    //override value with pc
                    //value: pcCompletion(current.value),
                    pcValue: _pcCompletionValue,
                    //units:"%",
                    location:"above",
                    row:0, // just above bar,
                    styles:tooltipStyles
                });
                if(isActive){
                    tooltipsData.push({ 
                        key: "expected",
                        title:"Expected",
                        desc: "...",
                        format:"pc",
                        ...expectedCurrent,
                        actualValue:expectedCurrent.value,
                        //override value with pc
                        // value: pcCompletion(expectedCurrent.value),
                        pcValue: _pcCompletionValue,
                        //units:"%",
                        location:"below",
                        row:0, // very top
                        styles:tooltipStyles
                    });
                }
            }

            return {
                ...kpi,
                date:kpiDate,
                isActive,
                isFuture,
                //stat full name stands alone without needing the dataset name before it
                name:stat.fullNameShort,
                longName:stat.fullNameLong,
                unit:stat.unit,
                barsData,
                handlesData,
                tooltipsData,
                numbersData,
                bands:bands.map(band => ({ ...band, min:+band.min, max:+band.max })),
                min,
                max,
                start,
                end,
                standards:standards.map(standard => ({ ...standard, value:+standard.value })),
                //3 date-value objects for previous, current and target values
                previous,
                current:{ date: currentDatapoint.date, value: current.value },
                target: targetDatapoint ? { date: targetDatapoint.date, value: target.value } : undefined,
                expectedCurrent,
                actualDatapoints:actualDatapoints.map(d => ({ date:d.date, value:d.values.find(v => v.measure === statId).value }))
            }
        })
    }

    update.date = function (value) {
        if (!arguments.length) { return date; }
        date = value;
        return update;
    };
    update.prevCardDate = function (value) {
        if (!arguments.length) { return prevCardDate; }
        prevCardDate = value;
        return update;
    };
    update.format = function (value) {
        if (!arguments.length) { return format; }
        //new value may be undefined in which case dont update it
        if(value){ format = value; }
        return update;
    };
    update.withDeficitBar = function (value) {
        if (!arguments.length) { return withDeficitBar; }
        withDeficitBar = value;
        return update;
    };
    update.allKpisActive = function (value) {
        if (!arguments.length) { return allKpisActive; }
        allKpisActive = value;
        return update;
    };
    update.noKpisActive = function (value) {
        if (!arguments.length) { return noKpisActive; }
        noKpisActive = value;
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    update.datasets = function (value) {
        if (!arguments.length) { return datasets; }
        datasets = value;
        return update;
    };
    return update;
}