import * as d3 from 'd3';
import { grey10, KPI_CTRLS } from '../constants';
import { isNumber, valueIsInDomain, calcPCIntervalsFromValue } from '../../../data/dataHelpers';
import { iceCrystals, ice, meltingIce, emptyGoal, ball, goalWithBall, shiningCrystalBall, nonShiningCrystalBall } from "../../../../assets/icons/milestoneIcons.js"

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
            const { key, values, accuracy, order, isPast, isCurrent, isFuture, isActive, milestoneId, datasetKey, statKey,
                steps=[], stepsValues, allSteps=[], statProgressStatus, stepsProgressStatus, minStandard, orientationFocus,
                dataStart, dataEnd 
            } = kpi; 
            
            const shouldLog = false;// milestoneId === "profile-2" && datasetKey === "meditation"
            const start = values.start?.actual;
            const current = values.current?.actual;
            const target = orientationFocus === "defence" ? minStandard.value : values.target?.actual;
            const achieved = values.achieved?.actual;
            const expected = values.expected?.actual;
            const { min, max } = values;
            //if(shouldLog){
                //console.log("min", milestoneId, minStandard)
            //}
            //console.log("kpi key datasetkey", key, datasetKey)
            //bars
            const currentColour = grey10(7);// "#696969";
            const colours = {
                current: currentColour,
                currentMaintanence: "#483d8b",
                currentNoData:grey10(5),
                target:grey10(2),// "#DCDCDC",
                expectedBehind:"red",
                expectedAhead:currentColour,
                stepsCurrent:"blue",
                currentDefenceTooltip:"#dcf3ff",
                currentDefenceNumber:"#90d9ff",
                redZone:"red"
            }

            const isMaintenanceTarget = isNumber(target) && isNumber(start) && (order === "highest is best" ? target <= start : target >= start);
            //note - this is used for maintancenGoals, so we assume if no current then assume its still at the required value
            const maintenanceTargetHasSlipped = isNumber(current) && isNumber(target) && (order === "highest is best" ? target > current : target < current);
            
            //Bar datums
            let barStart, barEnd;
            //4 cases
            if(isCurrent || orientationFocus === "defence"){
                //case 1: current card any orientation - use full scale
                barStart = dataStart
                barEnd = dataEnd;
            }/*else if(orientationFocus === "defence"){
                //case 2: non-current card, defence kpis go from -20% to +20%
                const pcIntervals = calcPCIntervalsFromValue(20, [dataStart, dataEnd], minStandard.value, { accuracy });
                barStart = valueIsInDomain(pcIntervals[0], [dataStart, dataEnd]) ? pcIntervals[0] : dataStart;
                barEnd = valueIsInDomain(pcIntervals[1], [dataStart, dataEnd]) ? pcIntervals[1] : dataEnd;
            }*/else if(isMaintenanceTarget){
                //case 3: non-current card, maintanence target
                const endToUse = isNumber(target) ? target : dataEnd
                barStart = calcPCIntervalsFromValue(20, [dataStart, dataEnd], endToUse, { accuracy })[0];
                barEnd = endToUse;
            }else {
                //case 3: non-current card normal target
                barStart = isNumber(start) ? start : dataStart;
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
                fill:orientationFocus === "defence" ? colours.currentDefenceBar : (isMaintenanceTarget ? colours.currentMaintanence : colours.current),
                opacity:isMaintenanceTarget ? 0.5 : 1,
                format,
                isMaintenanceTarget
            }

            const targetBarDatum = {
                key:"target",
                label: "Target",
                shouldDisplay:(status, editing) => orientationFocus === "defence" || editing?.desc === "target",
                isAchieved:order === "highest is best" ? target <= current : target >= current,
                startValue:barStart,
                endValue:orientationFocus === "defence" ? minStandard.value : target,
                fill:orientationFocus === "defence" ? colours.redZone : colours.target,
                opacity: 0.7,
                format,
            }

            //steps bar data
            //steps - the steps progressBar display will not be on current 
            //(although it will show the steps list for all steps on all future cards)
            const stepsBarData = !isCurrent || nrDatasetKpis === 0 ? steps : [];

            let getStandardsData = () => {
                if(!minStandard){ return []; }
                const minDatum = { ...minStandard, strokeWidth:0.6 };
                const plus10PCValue = calcPCIntervalsFromValue(10, [dataStart, dataEnd], minStandard.value, { accuracy })[1];
                const minPlus10Datum = { key:"minimumPlus10PC", label:"", value: plus10PCValue }
                return valueIsInDomain(plus10PCValue, [dataStart, dataEnd]) ? [minDatum, minPlus10Datum] : [minDatum];
            }

            const barData = {
                start:barStart,
                end:barEnd,
                dataStart,
                dataEnd,
                standardsData:getStandardsData(),
                sectionsData: [targetBarDatum, currentBarDatum],
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
                    isDefault:values.start?.isDefault,
                    accuracy,
                    editable:false,
                    clickableToEdit:isFuture && orientationFocus === "attack",
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
                    isDefault:values.target?.isDefault,
                    accuracy,
                    editable:false,
                    clickableToEdit:isFuture && orientationFocus === "attack",
                    withDragValueAbove:false,
                    withInnerValue:true,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"scale",
                    key:"minStandard", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all so no expected
                    shouldDisplay:(status, editing, displayFormat) => status === "open" && displayFormat !== "steps" && orientationFocus === "defence",
                    location:"below",
                    rowNr: -1, y: -1,
                    value: minStandard?.value, x:minStandard?.value,
                    isDefault:false, //always uses the stored value or a custom value, never a default
                    accuracy,
                    editable:false,
                    clickableToEdit:isFuture,
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
                    clickableToEdit:false,
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

            const progressIcons = orientationFocus === "defence" ?
                { achieved: iceCrystals, onTrack: ice, offTrack: meltingIce, noTarget:null }
                :
                { achieved: ball, onTrack: shiningCrystalBall, offTrack: nonShiningCrystalBall, noTarget:emptyGoal };

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
                    icons: progressIcons,
                    editable:false,//isCurrent || isFuture,
                    clickableToEdit:false,
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
                    icons: progressIcons,
                    editable:false,//isCurrent || isFuture,
                    clickableToEdit:false,
                    withDragValueAbove:true,
                    withInnerValue:true,
                },
                /*
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
                    clickableToEdit:false,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                */
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"expected", milestoneId, kpiKey:key, datasetKey, statKey,
                    //temp disable when its an endTooltip
                    //dont display if past or no future profiles
                    //dont display if its a maintance goal ie taregt is same or worse then start
                    shouldDisplay:(status, editing, displayFormat) => 
                        valueIsInDomain(expected, [barStart, barEnd]) && status === "open" && isFuture
                        && displayFormat !== "steps" && !isMaintenanceTarget && !editing
                        && orientationFocus === "attack", 
                    location:"below",
                    rowNr: -1, y: -1, current,
                    value: expected, x:expected,
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: shiningCrystalBall, notAchieved: nonShiningCrystalBall },
                    editable:false,//isCurrent || isFuture,
                    clickableToEdit:false,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //smallIcons: expectedAchieved ? emptyGoal : emptyGoal,
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"target", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:(status, editing) => status === "open" && editing?.desc === "target",
                    location:"above",
                    rowNr: 1, y: 1, current,
                    //rowNr: -1, y: -1, current,
                    value:isNumber(target) ? target : dataEnd, 
                    x:isNumber(target) ? target : dataEnd, 
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: ball, notAchieved: emptyGoal },
                    editable: isFuture,
                    clickableToEdit:false,
                    orientationFocus,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball, notAchieved: emptyGoal },
                },
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"minStandardEdit", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:(status, editing) => status === "open" && editing?.desc === "minStandard",
                    location:"above",
                    rowNr: 1, y: 1, current,
                    //rowNr: -1, y: -1, current,
                    value:minStandard?.value, // will always be defined but need the ? so this file doesnt error 
                    x:minStandard?.value, 
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: ball, notAchieved: emptyGoal },
                    editable: isFuture,
                    clickableToEdit:false,
                    orientationFocus,
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
                },
                /*
                //THIS IS FOR WHEN WE WANT TO ENABLE SETTING A CUSTOM MIN STANDARD BY CLICKING THE MIN LINE AND DRAGGING THIS TOOLTIP THAT APPEARS ABOVE
                { 
                    progressBarType:"dataset",
                    tooltipType:"comparison",
                    key:"minStandard", milestoneId, kpiKey:key, datasetKey, statKey,
                    //if no targetObj, this means there is no future active profile at all
                    shouldDisplay:(status, editing) => displayFormat !== "steps" && editing?.desc === "minStandard",
                    location:"above",
                    rowNr: 1, y: 1, current,
                    //rowNr: -1, y: -1, current,
                    value:isNumber(minStandard.value) ? minStandard.value : dataStart, 
                    x:isNumber(minStandard.value) ? minStandard.value : dataStart, 
                    dataOrder: order,
                    accuracy,
                    icons: { achieved: ball, notAchieved: emptyGoal },
                    editable: isFuture,
                    withDragValueAbove:true,
                    withInnerValue:true,
                    //if small space, just show the ball
                    //smallIcons: { achieved: ball, notAchieved: emptyGoal },
                },
                */

            ];

            //if(milestoneId === "current" && datasetKey === "pressUps"){
                //console.log("current", current)
            //}

            let getFill = (itemType) => {
                if(!isNumber(current)){ return colours.currentNoData; }
                if(orientationFocus === "defence" && itemType === "tooltip"){
                    return statProgressStatus === "offTrack" ? "red" : colours.currentDefenceTooltip;
                }
                if(orientationFocus === "defence" && itemType === "number"){
                    return statProgressStatus === "offTrack" ? "red" : colours.currentDefenceNumber;
                }
                return isMaintenanceTarget ? colours.currentMaintanence : colours.current
            }

            const currentTooltipDatum = {
                progressBarType:"dataset",
                tooltipType:"value",
                key:"current", milestoneId, kpiKey:key, datasetKey, statKey,
                shouldDisplay:(status, editing, displayFormat) => 
                    //show on current if open, but not if closed because bars are showing
                    //(!isCurrent || status === "open") &&
                    (valueIsInDomain(current, [barStart, barEnd]) || editing || status === "open") 
                    /*&& !isPast && status === "open"*/ && displayFormat !== "steps" && statKey,
                label: values.achieved ? "Achieved" : "Current",
                location:"on",
                rowNr:0, y:0,
                value:current,
                //fill:grey10(3),
                fill:getFill("tooltip"),
                //opacity:0.3,
                //if current, the bars are showing too so reduces opacity
                opacity:isNumber(current) ? 0.8 : 0.3,//isCurrent ? 0.3 : 0.8,
                stroke:grey10(6),
                strokeWidth:0.1,
                dataOrder: order,
                accuracy,
                editable:isCurrent || isFuture,
                withDragValueAbove:true,
                withInnerValue:false,
            }

            //if(shouldLog){
                //console.log("id current", milestoneId, current)
            //}

            const tooltipsData = [...scaleTooltipsData, ...comparisonTooltipsData, currentTooltipDatum]
            
            //numbers
            const currentNumberDatum = {
                milestoneId,
                progressBarType:"dataset",
                key:"current",
                shouldDisplay:(status, editing, displayFormat) => /*editing?.desc !== "target" &&*/ displayFormat !== "steps",
                label: values.achieved ? "Achieved" : "Current",
                value: current,
                //fill:colours.current,
                fill:getFill("number"),
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