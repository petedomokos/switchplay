import * as d3 from 'd3';
import { addDays, addWeeks } from "../../../util/TimeHelpers"
import { pcCompletion } from "../../../util/NumberHelpers"
import { grey10, KPI_CTRLS } from '../constants';
import { getBandsAndStandards } from "../../../data/bandsAndStandards";
import { getValueForStat } from '../../../data/dataHelpers';
import { emptyGoal, ball, goalWithBall, shiningCrystalBall, nonShiningCrystalBall } from "../../../../assets/icons/milestoneIcons.js"

export default function kpisLayout(){
    let date = new Date();
    let prevCardDate;
    let format = "completion"; //actual, pc or completion
    let datasets = [];
    let targets = [];
    let withDeficitBar = false;
    let allKpisActive = false;
    let noKpisActive = false;

    function update(data){
        //console.log("update kpisLayout------", data)
        //console.log("datasets", datasets)
        //const orderedData = sortAscending(data, d => d.date);
        //console.log("ordered", orderedData)

        //temp to increase data
        const _data = [...data, ...data, ...data, ...data]
            .map((kpi,i) => {
                if(i <= 1) { return kpi;}
                return { ...kpi, key:`${i}-${kpi.key}`}
            });
        //1 only...const _data = [data[0]]
        const kpisData = _data.map((kpi,i) => {
            //console.log("kpi---",i, kpi)
            const { values } = kpi;
            //can set all kpis to be active eg for an active profile card that doesnt have access to all data
            const isActive = allKpisActive || kpi.isActive;
            //helper
            //const _pcCompletionValue = pcCompletion(previous.value, target.value, current.value);
            //for now, we manually seyt this to test it renders as red. But should be based on linear interpolation
            //const expectedCurrent = { date: date, value:(current?.value ? current.value * 1.3 : 0) };//calculateExpected(previous, target, date)
            //const _pcCompletionExpectedValue = pcCompletion(previous.value, target.value, expectedCurrent.value);
            //bars
            const currentColour = "#696969";
            const colours = {
                current: currentColour,
                target: "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour
            }

            const start = values.start ? values.start[format] : null;
            const end = values.end ? values.end[format] : null;
            const current = values.current ? values.current[format] : null;
            const expected = values.expected ? values.expected[format] : null;
            const target = values.target ? values.target[format] : null;
            const proposedTarget = values.proposedTarget ? values.proposedTarget[format] : null;

            //datums
            const currentDatum = {
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                isAchieved:!!values.achieved,
                startValue:start, //may be undefined
                value:current,
                fill:colours.current,
                format
            }

            const barData = [currentDatum];
            barData.start = start;
            barData.end = end;

            const expectedAchieved = i % 2 === 0;
            const targetAchieved = i % 2 === 0;
            const tooltipsData = [
                { 
                    key:"expected", x:expected, rowNr: 1, y: 1, 
                    icon: expectedAchieved ? shiningCrystalBall : nonShiningCrystalBall,
                    //smallIcon: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    key:"target", x:current, rowNr: -1, y: -1,
                    icon: targetAchieved ? ball /*goalWithBall*/ : emptyGoal,
                    //if small space, just show the ball
                    smallIcon: targetAchieved ? ball : emptyGoal,
                }
            ];
            const numbersData = [currentDatum];

            return {
                ...kpi,
                nr:i,
                barData,
                tooltipsData,
                numbersData
            }
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
            /*
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
            */
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