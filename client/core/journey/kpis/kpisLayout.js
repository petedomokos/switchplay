import * as d3 from 'd3';
import { grey10, KPI_CTRLS } from '../constants';
import { isNumber } from '../../../data/dataHelpers';
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
        //flag
        const nrDatasetKpis = data.filter(kpi => kpi.datasetKey).length;
        const kpisData = data.map((kpi,i) => {
            const { key, values, accuracy, order, isPast, isCurrent, isFuture,isActive, milestoneId, datasetKey, statKey,
                steps=[], stepsValues, allSteps=[] } = kpi;

            //if(kpi.datasetKey === "pressUps"){
                //console.log("milestoneId kpi", milestoneId, kpi)
            //}
                
            
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
                target:grey10(2),// "#DCDCDC",
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

            //steps bar data
            //steps - the steps progressBar display will not be on current 
            //(although it will show the steps list for all steps on all future cards)
            const stepsBarData = !isCurrent || nrDatasetKpis === 0 ? steps : [];

            const barData = {
                start:barStart,
                end:barEnd,
                dataStart,
                dataEnd,
                sectionsData:[targetBarDatum, currentBarDatum],
                stepsData:stepsBarData
            }
            
            const scaleTooltipsData = [
                { 
                    progressBarType:"dataset",
                    tooltipType:"scale",
                    key:"start", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:(status, editing, displayFormat) => status === "open" && displayFormat !== "steps",
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
                    shouldDisplay:(status,editing, displayFormat) => status === "open" && displayFormat !== "steps",
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
                    shouldDisplay:(status, editing, displayFormat) => editing?.desc === "target" && displayFormat !== "steps",
                    rowNr: -1, y: -1,
                    value: current, x:current,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                }
            ]
            //@todo - put different comparisons into current card eg compared to club expectations, or all players avg
            if(milestoneId === "profile-5" && (key === "admin" || key === "pressUps-reps")){
                //console.log("kpi key", key)
                //console.log("stepsValues", stepsValues)
                //need to loko at why expected steps is 0
            }
            const comparisonTooltipsData = isCurrent ? [] : [
                { 
                    progressBarType:"steps",
                    tooltipType:"comparison",
                    key:"expectedSteps", milestoneId, kpiKey:key, datasetKey, statKey,
                    //temp disable when its an endTooltip
                    //dont display if past or no future profiles
                    shouldDisplay:(status, editing, displayFormat) => 
                        status === "open" && isFuture && isNumber(stepsValues.expected?.actual) && displayFormat === "steps", 
                    rowNr: 1, y: 1, current,
                    //value is required on all tooltips for positioning - we want it to be positioned by completion %
                    value: stepsValues.expected?.completion, x:stepsValues.expected?.completion,
                    unit:"%",
                    //actual steps are used in this tooltip for comparison
                    expectedActualSteps:stepsValues.expected?.actualSteps,
                    currentActualSteps:stepsValues.current?.actualSteps,
                    dataOrder: "highest is best",
                    accuracy:2,
                    icons: { achieved: shiningCrystalBall, notAchieved: nonShiningCrystalBall },
                    editable:false,//isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"expected", milestoneId, kpiKey:key, datasetKey, statKey,
                    //temp disable when its an endTooltip
                    //dont display if past or no future profiles
                    shouldDisplay:(status, editing, displayFormat) => status === "open" && isFuture && isNumber(expected) && displayFormat !== "steps", 
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
                    shouldDisplay:(status, editing, displayFormat) => !!editing && displayFormat !== "steps",
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
                shouldDisplay:(status, editing, displayFormat) => !isPast && status === "open" && displayFormat !== "steps",
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
                shouldDisplay:(status, editing, displayFormat) => editing?.desc !== "target" && displayFormat !== "steps",
                label: values.achieved ? "Achieved" : "Current",
                value: current,
                fill:colours.current,
                format
            }
            
            const numbersData = [currentNumberDatum]; //dont amend the current value like we did for bar

            /*
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