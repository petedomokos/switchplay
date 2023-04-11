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
            if(kpi.datasetKey === "pressups"){
                console.log("milestoneId kpi", milestoneId, kpi)
            }
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

            const isNumber = number => typeof number === "number";
            const boundedValue = (value, bounds) => {
                const lowerBound = d3.min(bounds);
                const upperBound = d3.max(bounds);
                if(!isNumber(value)){ return value; }
                return d3.min([upperBound, d3.max([lowerBound, value])])
            }

            const currentBarDatum = {
                progressBarType:"dataset",
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: barStart,
                /*
                ive made this far too complicated - this should just be the value and thats it.
                and the barComponent should cut it off 
                */
                value: boundedValue(current, [barStart, barEnd]),
                actualValue:current,
                fullScaleStartValue:dataStart,
                fullScaleValue:current,
                fill:colours.current,
                format
            }

            /*const targetDatum = {
                key:"target",
                label: "Target",
                isAchieved:order === "highest is best" ? target <= current : target >= current,
                startValue:barStart,
                value:target,
                fill:colours.target,
                format
            }*/

            //then...add teh steps visual under the bars (not on current) and the 3 displayOptions
            //then ...wire up the steps interactions
            //then figure out a better way to set target value -> USER CAN JUST CLICK THE END SCALE TOOLTIP BELOW
            //THIS OPENS UP THE OPTION TO ADJUST IT VIA A DRAG SCALE - MAY NEED TO MAKE THEN TOOLTIP LARGER,
            //OR AT LEAST THE HITBOX
            //and remove targetTooltip. 
            //could have it at end of each bar, and the current datum becomes a football, so it goes into the net 
            //once target is met! and target would be set by clicking it, that opens the target tooltip on a scale to set it
            const barData = [currentBarDatum]// : [targetDatum, currentDatum];
            barData.start = barStart;
            barData.end = barEnd;
            barData.dataStart = dataStart;
            barData.dataEnd = dataEnd;
            
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
            if(milestoneId === "profile-5" && key === "pressUps-reps"){
                console.log("milestoneId", milestoneId)
                console.log("key", key)
                console.log("compdata", comparisonTooltipsData)
            }
            /*
            const currentValueTooltipDatum = {
                progressBarType:"dataset",
                tooltipType:"value",
                key:"current", milestoneId, kpiKey:key, datasetKey, statKey,
                label: values.achieved ? "Achieved" : "Current",
                rowNr:0, y:0,
                value:current,
                fill:colours.current,
                dataOrder: format === "completion" ? "highest is best" : order,
                accuracy,
                editable:isCurrent || isFuture,
                withDragValueAbove:false,
                withInnerValue:false,
                shouldDisplay:(status, editing) => status === "open" && !isPast
            };
            */
            const tooltipsData = [...scaleTooltipsData, ...comparisonTooltipsData, /*currentValueTooltipDatum*/]
            const numbersData = [{ ...currentBarDatum, value:current }]; //dont amend the current value like we did for bar

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