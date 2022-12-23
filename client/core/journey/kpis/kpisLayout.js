import * as d3 from 'd3';
import { addWeeks } from "../../../util/TimeHelpers"
import { pcCompletion } from "../../../util/NumberHelpers"
import { grey10, KPI_CTRLS } from '../constants';
import { getBandsAndStandards } from "../../../data/bandsAndStandards";

export default function kpisLayout(){
    let date = new Date();
    let prevCardDate;
    let format = "target-completion";
    let datasets = [];
    let targets = [];
    let withDeficitBar = false;
    let allKpisActive = false;
    let noKpisActive = false;

    //helper
    const statValue = (date, statKey, datapoints, method="latest") => {
        const relevantDatapoints = datapoints
            .filter(d => d.date <= date)
            .map(d => ({ ...d, value:d.values.find(v => v.key === statKey)?.value }))
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
        console.log("update kpisLayout...........", data)
        console.log("datasets", datasets)
        const now = new Date();
        const orderedData = sortAscending(data, d => d.date);
        const nextKpi = orderedData.find(kpi => kpi.date > new Date());
       
        //use kpiPoint for a value of a kpi at a particular point/date eg on a particular profile

        //we remove the use of target datapoints. Instead, we store targets direclty on a profile, 
        /*eg profile.targets = {
            //we dont refer to kpis, as this allows non-kpi stat targets to be set too
            //the actual target is the latest target that has been approved by at least one person
            //the actual proposedTarget is teh latest target non-approved (if it is later than teh actual) or null

            //note - UI needs a 'confirm' or 'save' button for whenever user drags values
            statKey: [{dateCreated:"...", createdBy: userId, approvedBy: [userId], value:"..."}]
            statKey:targetValue,
            etc
        }

        */

        // the current is the last actual datapoint before that date

        //if these dont exist, then we dont use defaults. they system must be able to cope with no data or no targets

        const kpisData = orderedData.map((kpi,i) => {
            console.log("kpi",i, kpi)
            const { datasetKey, statKey, startDate, date, target, proposedTarget } = kpi;
            //const date = kpi.date || date;
            //can set all kpis to be active eg for an active profile card that doesnt have access to all data
            const isActive = allKpisActive || (kpi.id === nextKpi?.id && !noKpisActive);
            const isFuture = date > now;
            const dataset = datasets.find(dset => dset.key === datasetKey);
            console.log("dataset", dataset)
            const stat = dataset?.stats.find(s => s.key === statKey);
            console.log("stat", stat)
            const { bands, standards } = getBandsAndStandards(datasetKey, statKey) || {};
            console.log("bands standards", bands, standards);
            const min = bands[0] ? bands[0].min : null;
            const max = bands[0] ? bands[bands.length - 1].max : null;

            const actualDatapoints = dataset?.datapoints
                .filter(d => !d.isTarget)
                .filter(d => d.date > startDate && d.date <= date);

            const currentDatapoint = d3.greatest(actualDatapoints, d => d.date);
            //const target = kpi.target || findDefaultTarget(targets, datasetKey, statKey, date);
    
            //const current = parse(currentDatapoint?.values.find(v => v.key === statKey)) || { date:now, value: min };
            console.log("actual ds", actualDatapoints)
            console.log("currentD", currentDatapoint)
            console.log("target", target);
            console.log("proposedTarget", proposedTarget)
            
            //temp
            /*
            const defaultTargValue = current?.value ? current.value * 1.5 : min;
            const defaultTarg = { date:addWeeks(4, now), value: defaultTargValue };
            //need to hydrate datapoints so its values array objects each have a statKey, and also so we have
            //an object for derivedMeasures too
            const target = parse(targetDatapoint?.values.find(v => v.key === statKey)) || defaultTarg;
            //const pcCompletion = (value) => target.value !== 0 ? +(((+value/+target.value) * 100).toFixed(0)) : 100;
            //for now, if no previous, we default it to 50% of targ
            const achieved = statValue(date, statKey, actualDatapoints) || { value: d3.max([target.value * 0.5, min]) };
            const previous = statValue(prevDate, statKey, actualDatapoints) || { value: d3.max([target.value * 0.5, min]) };
            
            const _pcCompletionValue = pcCompletion(previous.value, target.value, current.value);
            //for now, we manually seyt this to test it renders as red. But should be based on linear interpolation
            const expectedCurrent = { date: date, value:(current?.value ? current.value * 1.3 : 0) };//calculateExpected(previous, target, date)
            const _pcCompletionExpectedValue = pcCompletion(previous.value, target.value, expectedCurrent.value);
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

            //const rangeDatum = { key: "range", from:start, to:end, fill:"transparent", stroke:"grey" };

            */
            /*
            const targetDatum = { 
                key: "target", 
                from:start, 
                to:target.value, 
                fill:colours.target,
                handle:{
                    handleType:"triangle",  
                    pos:"above",
                    key: "target",
                    colour:colours.target
                }
            };
            const currentDatum = { 
                key: "current", 
                from:start, 
                to:current.value, 
                fill:colours.current,
                pcValue:_pcCompletionValue,
                previousValue:previous.value,
                targetValue:target.value,
                format:formatIsActual ? "actual" : "completion",
                handle:{
                    handleType:"rect",
                    pos:"over",
                    key: "current",
                    colour:colours.current
                    //fill:"transparent",
                    //stroke:"white",
                    //strokeWidth:0.2,
                }
            };
            const expectedDatum = {
                key: "expected",
                handle:{
                    handleType:"triangle",
                    pos:"below",
                    key: "expected",
                    colour:isOnTrack ? colours.expectedAhead : colours.expectedBehind
                },
                value:expectedCurrent.value,
                previousValue:previous.value,
                targetValue:target.value,
                from:start, 
                to:expectedCurrent.value,
                //@todo - handle decreasing datasets ie less is best
                fill:isOnTrack ? colours.expectedAhead : colours.expectedBehind,
                format:formatIsActual ? "actual" : "completion"
            }

            const prevDatum = {
                key: "previous",
                handle:{
                    handleType:"line",
                    pos:"over",
                    key: "previous",
                    colour:"white",
                    strokeWidth:0.5,
                    strokeDasharray:2,
                },
                value:expectedCurrent.value,
                from:start, 
                to:previous.value,
                //@todo - handle decreasing datasets ie less is best
                fill:"none",
                format:formatIsActual ? "actual" : "completion"
            }

            const barData = kpi.isCurrent ? [currentDatum] :(formatIsActual ? [targetDatum, expectedDatum, currentDatum, prevDatum] : [expectedDatum, currentDatum]);
            barData.start = start;
            barData.end = end;
            
            const currentActualNumberDatum = { key: "current-actual", value: current?.value, colour:colours.current }
            const numbersData = kpi.isCurrent || formatIsActual ? currentActualNumberDatum :
                [
                    { 
                        key: "current-completion", 
                        value: `${_pcCompletionValue}%`,
                        previousValue:previous.value,
                        targetValue:target.value,
                        colour:isOnTrack ? colours.current : "red",
                    },
                    currentActualNumberDatum
                ]

            if(withDeficitBar && !kpi.isCurrent && current?.value < expectedCurrent.value){
                barData.push({ key:"deficit", from:current?.value, to:expectedCurrent.value, fill:"red" })
            }

            const tooltipStyles = {
                bg:{ fill: "none" },
                title:{ stroke: "white" },
                value:{ fill:"white", stroke: grey10(7)}
            }
            let tooltipsData = [];
            if(kpi.isCurrent){
                tooltipsData.push({
                    ...current,
                    key: "current", 
                    title:"Current",
                    shortTitle:"Curr",
                    location:"above",
                    row:0, // just above bar
                    styles:tooltipStyles
                        
                })
            } else {
                if(formatIsActual){
                    if(previous){
                        tooltipsData.push({ 
                            ...previous,
                            key: "previous",
                            title:"Previous",
                            shortTitle:"Prev",
                            desc: "...",
                            location:"above",
                            row:1, // very top
                            labelPos:"below",
                            styles:tooltipStyles
                        });
                    }
                    //if(!isFuture){
                        //todo - finish all this...its a past kpi - just show the achieved datapoint
                        //but also show target
                        //tooltipsData.push({ 
                            //key: "achieved", 
                            //title:"Achieved",
                            //shortTitle:"Ach",
                            //...achieved,
                            //location:"above",
                            //row:0, // just above bar
                            //styles:tooltipStyles
                            
                        //})
                    //}else{
                        //its a future kpi
                        tooltipsData.push(
                            { 
                                ...current,
                                key: "current", 
                                title:"Current",
                                shortTitle:"Curr",
                                location:"above",
                                row:0, // just above bar
                                styles:tooltipStyles
                                
                            },
                            { 
                                ...target,
                                key: "target",
                                title: "Target",
                                shortTitle:"Targ",
                                desc: "...",
                                location:"above",
                                row:1, // very top,
                                styles:tooltipStyles
                            }
                        );
                        if(isActive){
                            tooltipsData.push({
                                ...expectedCurrent,
                                previousValue:previous.value,
                                targetValue:target.value,
                                key: "expected",
                                title:"Expected",
                                shortTitle:"Exp",
                                desc: "...",
                                location:"below",
                                row:0, // just below bar
                                styles:tooltipStyles
                            });
                        }
                }else{
                    tooltipsData.push({
                        ...current,
                        key: "current", 
                        title:"Current",
                        shortTitle:"Curr",
                        desc: "...",
                        format:'pc',
                        previousValue:previous.value,
                        targetValue:target.value,
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
                            ...expectedCurrent,
                            key: "expected",
                            title:"Expected",
                            shortTitle:"Exp",
                            desc: "...",
                            format:"pc",
                            previousValue:previous.value,
                            targetValue:target.value,
                            actualValue:expectedCurrent.value,
                            //override value with pc
                            // value: pcCompletion(expectedCurrent.value),
                            pcValue: _pcCompletionExpectedValue,
                            //units:"%",
                            location:"below",
                            row:0, // very top
                            styles:tooltipStyles
                        });
                    }
                }
            }
            */

            return {
                ...kpi,
                //date,
                //isActive,
                //isFuture,
                //stat full name stands alone without needing the dataset name before it
                //name:stat.fullNameShort,
                //longName:stat.fullNameLong,
                //unit:stat.unit,
                //barData,
                //tooltipsData,
                //numbersData,
                //bands:bands.map(band => ({ ...band, min:+band.min, max:+band.max })),
                //min,
                //max,
                //start,
                //end,
                //standards:standards.map(standard => ({ ...standard, value:+standard.value })),
                //3 date-value objects for previous, current and target values
                //previous,
                //current:{ date: currentDatapoint.date, value: current.value },
                //target: targetDatapoint ? { date: targetDatapoint.date, value: target.value } : undefined,
                //expectedCurrent,
                //actualDatapoints:actualDatapoints.map(d => ({ date:d.date, value:d.values.find(v => v.key === statKey).value }))
            }
        })

        const ctrlsData = KPI_CTRLS(format); 

        return { kpisData, ctrlsData }
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
    update.targets = function (value) {
        if (!arguments.length) { return targets; }
        //if targets null, we want to replace any exiaiting with an empty array
        targets = value || [];
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