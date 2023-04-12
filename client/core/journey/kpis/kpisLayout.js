import * as d3 from 'd3';
import { addDays, addWeeks } from "../../../util/TimeHelpers"
import { pcCompletion } from "../../../util/NumberHelpers"
import { grey10, KPI_CTRLS } from '../constants';
import { getBandsAndStandards } from "../../../data/bandsAndStandards";
import { getValueForStat } from '../../../data/dataHelpers';
import { emptyGoal, ball, goalWithBall, shiningCrystalBall, nonShiningCrystalBall } from "../../../../assets/icons/milestoneIcons.js"

export default function kpisLayout(){
    let format = "actual"; //actual
    let datasets = [];
    let targets = [];
    let withDeficitBar = false;
    let allKpisActive = false;
    let noKpisActive = false;

    function update(data){
        //console.log("update kpisLayout------")
        const kpisData = data.map((kpi,i) => {
            //if(kpi.datasetKey === "pressups"){
                //console.log("milestoneId kpi", milestoneId, kpi)
            //}
            const { key, values, accuracy, order, isPast, isCurrent, isFuture,isActive, milestoneId, datasetKey, statKey,
                steps, stepsValues } = kpi;
            
            const start = values.start?.actual;
            const current = values.current?.actual;
            const target = values.target?.actual;
            const achieved = values.achieved?.actual;
            const expected = values.expected?.actual;
            const { min, max } = values;
            //console.log("kpi key datasetkey", key, datasetKey)
            //bars
            const currentColour = grey10(7);// "#696969";
            const colours = {
                current: currentColour,
                target:grey10(4),// "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour,
                stepsCurrent:"blue"
            }

            
            //if(milestoneId === "profile-5" && kpi.datasetKey === "shuttles"){
                //console.log("milestoneId dset", milestoneId, datasetKey)
            //}

            //Bar datums
            const dataStart = order === "highest is best" ? min : max;
            const dataEnd = order === "highest is best" ? max : min;
            let barStart, barEnd;
            if(isCurrent){
                barStart = dataStart
                barEnd = dataEnd;
            }else{
                barStart = typeof start === "number" ? start : dataStart;
                barEnd = typeof target === "number" ? target : dataEnd;
            }

            //helper
            //const best = (value1, value2) => order === "highest is best" ? d3.max([value1, value2]) : d3.min([value1, value2]);
            //const worst = (value1, value2) => order === "highest is best" ? d3.min([value1, value2]) : d3.max([value1, value2]);

            const currentBarDatum = {
                progressBarType:"dataset",
                key:"current",
                shouldDisplay:() => true,
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: barStart,
                endValue: current,
                fill:colours.current,
                format
            }

            const targetBarDatum = {
                key:"target",
                label: "Target",
                shouldDisplay:(status, editing) => editing?.desc === "target",
                isAchieved:order === "highest is best" ? target <= current : target >= current,
                startValue:barStart,
                endValue:target,
                fill:colours.target,
                format
            }

            //next 2 - add currentTooltip back in (and change key to currentDragHandle)
            //3 - wire up the steps interactions
            //4 - add the steps visual under the bars (not on current) and the 3 displayOptions

            const barData = {
                start:barStart,
                end:barEnd,
                dataStart,
                dataEnd,
                sectionsData:[targetBarDatum, currentBarDatum]
            }
            
            const scaleTooltipsData = [
                { 
                    progressBarType:"dataset",
                    tooltipType:"scale",
                    key:"start", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:status => status === "open",
                    rowNr: -1, y: -1,
                    value: barStart, x:barStart,
                    fullScaleValue:dataStart,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"scale",
                    key:"end", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:status => status === "open",
                    rowNr: -1, y: -1,
                    value: barEnd, x:barEnd,
                    fullScaleValue:dataEnd, 
                    isTarget:barEnd === target,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"scale",
                    key:"currentValue", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:(status, editing) => editing?.desc === "target",
                    rowNr: -1, y: -1,
                    value: current, x:current,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                }
            ]
            //@todo - put different comparisons into current card eg compared to club expectations, or all players avg
            const comparisonTooltipsData = isCurrent ? [] : [
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"expected", milestoneId, kpiKey:key, datasetKey, statKey,
                    //temp disable when its an endTooltip
                    shouldDisplay:(status, editing) => status === "open" && isFuture && !!target, //dont display if past or no future profiles
                    rowNr: 1, y: 1, current,
                    value: expected, x:expected,
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: shiningCrystalBall, notAchieved: nonShiningCrystalBall },
                    editable:false,//isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"target", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:(status, editing) => !!editing,
                    rowNr: -1, y: -1, current,
                    value:typeof target === "number" ? target : dataEnd, 
                    x:typeof target === "number" ? target : dataEnd, 
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: ball, notAchieved: emptyGoal },
                    editable: isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball, notAchieved: emptyGoal },
                }
            ];

            const currentValueTooltipDatum = {
                progressBarType:"dataset",
                tooltipType:"value",
                key:"current", milestoneId, kpiKey:key, datasetKey, statKey,
                shouldDisplay:status => !isPast && status === "open",
                label: values.achieved ? "Achieved" : "Current",
                rowNr:0, y:0,
                value:current,
                fill:grey10(3),
                opacity:0.3,
                stroke:grey10(6),
                strokeWidth:0.1,
                dataOrder: order,
                accuracy,
                editable:isCurrent || isFuture,
                withDragValueAbove:false,
                withInnerValue:false,
            };
            const tooltipsData = [...scaleTooltipsData, ...comparisonTooltipsData, currentValueTooltipDatum]
            
            //numbers
            const currentNumberDatum = {
                progressBarType:"dataset",
                key:"current",
                shouldDisplay:(status, editing) => editing?.desc !== "target",
                label: values.achieved ? "Achieved" : "Current",
                value: current,
                fill:colours.current,
                format
            }
            
            const numbersData = [currentNumberDatum]; //dont amend the current value like we did for bar

            /*
            //steps - the steps progressBar display will not be on current 
            //(although it will show the steps list for all steps on all future cards)
            const stepsCurrentDatum = isCurrent ? null : {
                progressBarType:"steps",
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: 0,
                value:stepsValues.current.completion,
                fill:colours.stepsCurrent,
            }

            const stepsBarData = isCurrent ? null : [stepsCurrentDatum];
            if(stepsBarData){
                stepsBarData.start = 0;
                stepsBarData.end = 100;
            }

            const stepsTooltipsData = isCurrent ? null : [];
            const stepsNumbersData = isCurrent ? null : [];
            */

            return {
                ...kpi,
                nr:i+1,
                barData,
                tooltipsData,
                numbersData,
                stepsBarData:[],
                stepsTooltipsData:[],
                stepsNumbersData:[]
            }
        })

        return { kpisData }
    }

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