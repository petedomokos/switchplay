import * as d3 from 'd3';
import { grey10, KPI_CTRLS } from '../constants';
import { isNumber } from '../../../data/dataHelpers';
import { emptyGoal, ball, goalWithBall, shiningCrystalBall, nonShiningCrystalBall } from "../../../../assets/icons/milestoneIcons.js"
import { ContactSupportOutlined } from '@material-ui/icons';

export default function kpisLayout(){
    let format = "actual"; //actual
    let datasets = [];
    let targets = [];
    let withDeficitBar = false;
    let allKpisActive = false;
    let noKpisActive = false;
    let milestoneId = "";

    function update(data){
        //flag
        const nrDatasetKpis = data.filter(kpi => kpi.datasetKey).length;
        const kpisData = data.map((kpi,i) => {
            const { key, values, accuracy, order, isPast, isCurrent, isFuture,isActive, milestoneId, datasetKey, statKey,
                steps=[], stepsValues, allSteps=[], statProgressStatus, stepsProgressStatus } = kpi; 
            
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
                currentMaintanence: "#98AFC7",
                target:grey10(2),// "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour,
                stepsCurrent:"blue"
            }


            //helper for special case of maintanence goals (ie target is actaully same or  worse than starting value)
            const calc20PCWorseThanTarget = (extent, target, keepInRange=false) => {
                const domainDiff = extent[1] - extent[0];
                //note - if decr4asing, then diff will be neg, so subtracting a neg will be an increase
                const _20PC = 0.1 * domainDiff;
                const _20PCWorseThanTarget = target - _20PC;
                //if decreasing, then its out of range if the value is above extent[0], otherwise it is if its less than
                const outOfRange = domainDiff < 0 ? _20PCWorseThanTarget > extent[0] : _20PCWorseThanTarget < extent[0];
                return outOfRange && keepInRange ? extent[0] : _20PCWorseThanTarget;
            }
            const isMaintenanceTarget = isNumber(target) && isNumber(start) && (order === "highest is best" ? target <= start : target >= start);
            //note - this is used for maintancenGoals, so we assume if no current then assume its still at the required value
            const maintenanceTargetHasSlipped = isNumber(current) && isNumber(target) && (order === "highest is best" ? target > current : target < current);
            
            //Bar datums
            const dataStart = order === "highest is best" ? min : max;
            const dataEnd = order === "highest is best" ? max : min;
            let barStart, barEnd;
            if(isCurrent){
                barStart = dataStart
                barEnd = dataEnd;
            }else{
                //3 cases - target worse than start, no start value, or normal
                barStart = isMaintenanceTarget ? calc20PCWorseThanTarget([dataStart, dataEnd], target) : (isNumber(start) ? start : dataStart);
                barEnd = isNumber(target) ? target : dataEnd;
            }

            const currentBarDatum = {
                progressBarType:"dataset",
                key:"current",
                shouldDisplay:() => true,
                label: values.achieved ? "Achieved" : "Current",
                //@todo - remove isAchieved form this - is confusing and means nothing
                isAchieved:!!values.achieved,
                startValue: barStart,
                endValue: current,
                fill:isMaintenanceTarget ? colours.currentMaintanence : colours.current,
                opacity:isMaintenanceTarget ? 0.5 : 1,
                format,
                isMaintenanceTarget
            }

            const targetBarDatum = {
                key:"target",
                label: "Target",
                shouldDisplay:(status, editing) => editing?.desc === "target",
                isAchieved:order === "highest is best" ? target <= current : target >= current,
                startValue:barStart,
                endValue:target,
                fill:colours.target,
                format,
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
                    location:"below",
                    rowNr: -1, y: -1,
                    value: barStart, x:barStart,
                    fullScaleValue:dataStart,
                    isSet:isNumber(start),
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
                    location:"below",
                    rowNr: -1, y: -1,
                    value: barEnd, x:barEnd,
                    fullScaleValue:dataEnd, 
                    isSet:isNumber(target),
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
                    location:"below",
                    rowNr: -1, y: -1,
                    value: current, x:current,
                    accuracy,
                    editable:false,
                    withDragValueAbove:false,
                    withInnerValue:true,
                }
            ]

            //@todo - move out of here and move all kpiprogrss stuff into same file as profilePrgStatus stuff
            const progressStatusForMaintenanceTarget = () => {
                if(maintenanceTargetHasSlipped){ return "offTrack"; }
                return "achieved";
            }
            //@todo - put different comparisons into current card eg compared to club expectations, or all players avg
            //if(milestoneId === "profile-5" && (key === "admin" || key === "pressUps-reps")){
                //console.log("kpi key", key)
                //console.log("value", values)
                //console.log("prog stepPro", progressStatus, stepsProgressStatus)
                //need to loko at why expected steps is 0
            //}

            const comparisonTooltipsData = isCurrent ? [] : [
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"stepsProgress", milestoneId, kpiKey:key, datasetKey, statKey,
                    shouldDisplay:(status, editing, displayFormat) => status === "closed" && displayFormat !== "stats", 
                    location:"end",
                    position:1,
                    rowNr: 1, y: 1, current,
                    status:stepsProgressStatus,
                    icons: { achieved: ball, onTrack: shiningCrystalBall, offTrack: nonShiningCrystalBall, noTarget:emptyGoal },
                    editable:false,//isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"statProgress", milestoneId, kpiKey:key, datasetKey, statKey,
                    shouldDisplay:(status, editing, displayFormat) => status === "closed" && displayFormat !== "steps" && !editing, 
                    location:"end",
                    position:2,
                    rowNr: 1, y: 1, current,
                    status:isMaintenanceTarget? progressStatusForMaintenanceTarget() : statProgressStatus,
                    icons: { achieved: ball, onTrack: shiningCrystalBall, offTrack: nonShiningCrystalBall, noTarget:emptyGoal },
                    editable:false,//isCurrent || isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"steps",
                    tooltipType:"comparison",
                    key:"expectedSteps", milestoneId, kpiKey:key, datasetKey, statKey,
                    //temp disable when its an endTooltip
                    //dont display if past or no future profiles
                    //note - if no steps, then target will be 0 so this wont show
                    shouldDisplay:(status, editing, displayFormat) => 
                        status === "open" && isFuture && !!stepsValues.target.actual && 
                        isNumber(stepsValues.expected?.actual) && !editing && displayFormat !== "stat", 
                    location:"below",
                    rowNr: -1, y: 1, current,
                    //value is required on all tooltips for positioning - we want it to be positioned by completion %
                    value: stepsValues.expected?.actualSteps, x:stepsValues.expected?.completion,
                    //actual steps are used in this tooltip for comparison
                    expectedActualSteps:stepsValues.expected?.actualSteps,
                    currentActualSteps:stepsValues.current?.actualSteps,
                    dataOrder: "highest is best",
                    accuracy:2,
                    //@todo - maybe we only show the expected icons here, so if achieved, we still show just the shining crystal ball
                    status:stepsProgressStatus,
                    icons: { achieved: shiningCrystalBall, onTrack: shiningCrystalBall, offTrack: nonShiningCrystalBall, noTarget:nonShiningCrystalBall },
                    //icons: { achieved: ball, onTrack: shiningCrystalBall, offTrack: nonShiningCrystalBall, noTarget:emptyGoal },
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
                    //dont display if its a maintance goal ie taregt is same or worse then start
                    shouldDisplay:(status, editing, displayFormat) => 
                        status === "open" && isFuture && isNumber(expected) 
                        && displayFormat !== "steps" && !isMaintenanceTarget && !editing, 
                    location:"above",
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
                    shouldDisplay:(status, editing) =>
                        status === "open" && editing?.desc === "target",
                    location:"above",
                    rowNr: 1, y: 1, current,
                    //rowNr: -1, y: -1, current,
                    value:isNumber(target) ? target : dataEnd, 
                    x:isNumber(target) ? target : dataEnd, 
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: ball, notAchieved: emptyGoal },
                    editable: isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball, notAchieved: emptyGoal },
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"profileStart", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:(status, editing) =>  status === "open" && editing?.desc === "start",
                    location:"above",
                    rowNr: 1, y: 1, current,
                    //rowNr: -1, y: -1, current,
                    value:isNumber(start) ? start : dataStart, 
                    x:isNumber(start) ? start : dataStart,
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

            //if(milestoneId === "current" && datasetKey === "pressUps"){
                //console.log("current", current)
            //}
            const currentValueTooltipDatum = {
                progressBarType:"dataset",
                tooltipType:"value",
                key:"current", milestoneId, kpiKey:key, datasetKey, statKey,
                shouldDisplay:(status, editing, displayFormat) => 
                    !isPast && status === "open" && displayFormat !== "steps" && statKey,
                label: values.achieved ? "Achieved" : "Current",
                location:"on",
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

        return { kpisData, milestoneId }
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
    update.milestoneId = function (value) {
        if (!arguments.length) { return milestoneId; }
        milestoneId = value;
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