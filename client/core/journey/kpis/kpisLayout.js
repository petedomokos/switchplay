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
        console.log("update kpisLayout------", data)
        console.log("datasets", datasets)
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
            
           
            const { key, values, accuracy, isPast, isCurrent, isFuture, milestoneId, datasetKey, statKey } = kpi;
            console.log("kpi key datasetkey", key, datasetKey)
            const dataset = datasets.find(dset => dset.key === datasetKey);
            console.log("dset", dataset)
            const stat = dataset.stats.find(stat => stat.key === statKey);
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
                expectedAhead:currentColour
            }

            const start = values.start && typeof values.start[format] === "number" ? values.start[format] : null;
            if(isCurrent && key === "shuttles-time"){
            }
            const end = values.end && typeof values.end[format] === "number" ? values.end[format] : null;
            const current = values.current && typeof values.current[format] === "number" ? values.current[format] : null;
            
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
                key:"target",
                label: "Target",
                isAchieved:stat.order === "highest is best" ? target <= current : target >= current,
                startValue:stat.order === "highest is best" ? values.min : values.max, //may be undefined
                value:target,
                fill:colours.target,
                format
            }
            const currentDatum = {
                key:"current",
                label: values.achieved ? "Achieved" : "Current",
                isAchieved:!!values.achieved,
                startValue:stat.order === "highest is best" ? values.min : values.max, //may be undefined
                value:current,
                fill:colours.current,
                format
            }

            const barData = [targetDatum, currentDatum];
            barData.start = stat.order === "highest is best" ? values.min : values.max;
            barData.end = stat.order === "highest is best" ? values.max : values.min;

            const tooltipsData = [
                { 
                    key:"start", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:true,
                    rowNr: -1, y: -1,
                    value: barData.start, x:barData.start,
                    accuracy,
                    editable:false,
                },
                { 
                    key:"end", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:true,
                    rowNr: -1, y: -1,
                    value: barData.end, x:barData.end,
                    accuracy,
                    editable:false,
                },
                { 
                    key:"expected", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:!isPast && !!targetObj, //dont display if past or no future profiles
                    rowNr: 1, y: 1, current,
                    value: expected, x:expected,
                    dataOrder:stat.order,
                    accuracy,
                    icons: { achieved: shiningCrystalBall, notAchieved: nonShiningCrystalBall },
                    editable:false//isCurrent || isFuture,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    key:"target", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:!!targetObj,
                    rowNr: -1, y: -1, current,
                    value:target, x:target,
                    dataOrder:stat.order,
                    accuracy,
                    icons: { achieved: ball /*goalWithBall*/, notAchieved: emptyGoal },
                    editable:isCurrent || isFuture,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball /*goalWithBall*/, notAchieved: emptyGoal },
                }
            ];

            if(kpi.datePhase === "current" && kpi.key.includes("pressUps")){
                //console.log("kpi---",i,kpi.key, kpi)
                //console.log("values", values)
                //console.log("tooltips", tooltipsData)
            }
            const numbersData = [currentDatum];

            return {
                ...kpi,
                nr:i,
                barData,
                tooltipsData,
                numbersData
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