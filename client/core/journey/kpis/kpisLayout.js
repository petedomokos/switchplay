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
        //console.log("update kpisLayout------", data)
        //console.log("datasets", datasets)
        //const orderedData = sortAscending(data, d => d.date);
        //console.log("ordered", orderedData)

        //temp to increase data
        /*
        const _data = [...data, ...data, ...data, ...data]
            .map((kpi,i) => {
                if(i <= 1) { return kpi;}
                return { ...kpi, key:`${i}-${kpi.key}`}
            });*/
        //1 only...const _data = [data[0]]
        const kpisData = data.map((kpi,i) => {
            const { key, values, accuracy, order, isPast, isCurrent, isFuture, milestoneId, datasetKey, statKey,
                steps, stepsValues } = kpi;
            //console.log("kpi key datasetkey", key, datasetKey)
            const dataset = datasets.find(dset => dset.key === datasetKey);
            //can set all kpis to be active eg for an active profile card that doesnt have access to all data
            const isActive = allKpisActive || kpi.isActive;
            //helper
            //const _pcCompletionValue = pcCompletion(previous.value, target.value, current.value);
            //for now, we manually seyt this to test it renders as red. But should be based on linear interpolation
            //const expectedCurrent = { date: date, value:(current?.value ? current.value * 1.3 : 0) };//calculateExpected(previous, target, date)
            //const _pcCompletionExpectedValue = pcCompletion(previous.value, target.value, expectedCurrent.value);
            //bars
            const currentColour = grey10(7);// "#696969";
            const colours = {
                current: currentColour,
                target:grey10(4),// "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour,
                stepsCurrent:"blue"
            }

            //todo - fix bug why expected and current are showing as ontrack when they are not
            //also refacotr the below logic

            const start = values.start && typeof values.start[format] === "number" ? values.start[format] : null;
            if(isCurrent && key === "shuttles-time"){
            }
            const end = values.end && typeof values.end[format] === "number" ? values.end[format] : null;
            //console.log("values.curr", values.current)
            const current = values.current && typeof values.current[format] === "number" ? values.current[format] : null;
            
            if(kpi.datasetKey === "shuttles"){
                //console.log("milestoneId--------------------", kpi.milestoneId)
                //console.log("format ")

            }
            
            let expected;
            let target;
            //let proposedTarget;
            const expectedObj = values.expected;
            const targetObj = values.target;
            //const proposedTargetObj = values.target;
            if(!expectedObj) {
                expected = null;
            }else{
                expected = expectedObj.unsaved ? expectedObj.unsaved[format] : expectedObj[format];
            }
            if(!targetObj){
                target = null;
            }else{
                target = targetObj.unsaved ? targetObj.unsaved[format] : targetObj[format];
            }
            /*
            if(!proposedTargetObj){
                proposedTarget = null;
            }else{
                proposedTarget = proposedTargetObj.unsaved ? proposedTargetObj.unsaved[format] : proposedTargetObj[format];
            }*/

            //datums
            const targetDatum = {
                progressBarType:"dataset",
                key:"target",
                label: "Target",
                isAchieved:(order === "highest is best" || format === "completion") ? target <= current : target >= current,
                startValue:format === "completion" ? 0 : (order === "highest is best" ? values.min : values.max), //may be undefined
                value:target,
                fill:colours.target,
                format
            }
            const currentDatum = {
                progressBarType:"dataset",
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: format === "completion" ? 0 : (order === "highest is best" ? values.min : values.max), //may be undefined
                value:current,
                fill:colours.current,
                format
            }

            const barData = format === "completion" ? [currentDatum] : [targetDatum, currentDatum];
            barData.start = format === "completion" ? 0 : (order === "highest is best" ? values.min : values.max);
            barData.end = format === "completion" ? 100 : (order === "highest is best" ? values.max : values.min);

            const tooltipsData = [
                { 
                    progressBarType:"dataset",
                    key:"start", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:status => status === "open",
                    rowNr: -1, y: -1,
                    value: barData.start, x:barData.start,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    key:"end", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:status => status === "open",
                    rowNr: -1, y: -1,
                    value: barData.end, x:barData.end,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    key:"expected", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:status => !isPast && !!targetObj, //dont display if past or no future profiles
                    rowNr: 1, y: 1, current,
                    value: expected, x:expected,
                    dataOrder: format === "completion" ? "highest is best" : order,
                    accuracy,
                    icons: { achieved: shiningCrystalBall, notAchieved: nonShiningCrystalBall },
                    editable:false,//isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    progressBarType:"dataset",
                    key:"target", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:status => !!targetObj,
                    rowNr: -1, y: -1, current,
                    value:target, x:target,
                    dataOrder: format === "completion" ? "highest is best" : order,
                    accuracy,
                    icons: { achieved: ball /*goalWithBall*/, notAchieved: emptyGoal },
                    editable:isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball /*goalWithBall*/, notAchieved: emptyGoal },
                },
                //when completion, value below is 0
                {
                    progressBarType:"dataset",
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
                    shouldDisplay:status => status === "open" && !isPast
                }
            ];

            if(kpi.datePhase === "future" && kpi.key.includes("pressUps")){
                //console.log("kpi---",i,kpi.key, kpi)
                //console.log("milestone", milestoneId)
                //console.log("current", values.current)
                //console.log("expected", values.expected)
                //console.log("tooltips", tooltipsData)
            }
            const numbersData = [currentDatum];

            const stepsCurrentDatum = {
                progressBarType:"steps",
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: 0,
                value:stepsValues.current.completion,
                fill:colours.stepsCurrent,
            }

            const stepsBarData = [stepsCurrentDatum];
            stepsBarData.start = 0;
            stepsBarData.end = 100;
            //console.log("key value", key, stepsValues.current.completion)
            //console.log("steps", steps)

            const stepsTooltipsData = [];
            const stepsNumbersData = [];

            if(datasetKey === "shuttles"){
                //console.log("milestoneId", kpi.milestoneId)
                //console.log("kpi", kpi)
                //console.log("values", values)
                //console.log("tooltipsData", tooltipsData)
                //console.log("format ", format, current)

            }

            return {
                ...kpi,
                nr:i+1,
                barData,
                tooltipsData,
                numbersData,
                stepsBarData,
                stepsTooltipsData,
                stepsNumbersData
            }
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