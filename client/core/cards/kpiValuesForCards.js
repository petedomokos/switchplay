import * as d3 from 'd3';
import { addDays, addYears, addMonths, addWeeks, calcDateCount, calcAge } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { convertToPC, round, roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
import { linearProjValue } from "../journey/helpers";
import { isNumber, calcPCIntervalsFromValue } from '../../data/dataHelpers';
import { calcExpected, getStatValue } from "./kpiValuesHelpers"

//next - make these work for what we need so far, using the existing code in helpers file if poss
const calcBestPossibleValue = kpi => kpi.order === "highest is best" ? kpi.max : kpi.min;
const calcWorstPossibleValue = kpi => kpi.order === "highest is best" ? kpi.min : kpi.max;

//export function hydrateJourneyData(data, user, datasets){
export const addKpiValuesToCards = (deck, datasets=[], deckIndex) => {
    const { player, kpis=[], cards=[], settings=[] } = deck
    //console.log("addKpiValuesToCards deck:", deck)
    //console.log("datasets", datasets)
    if(cards.length === 0 || kpis.length === 0){ return cards; }

    const orderedCards = sortAscending(cards, d => d.date);
    const deckStartDate = deck.startDate || orderedCards[0].date;
    const deckEndDate = deck.endDate || orderedCards[orderedCards.length -1].date;
    //console.log("startdate enddate", deckStartDate, deckEndDate)
    //console.log("cardDates", orderedCards.map(c => c.date))

    //helper
    const getValue = (kpi, dateRange, dataMethod="mean", options={}) => {
        //console.log("getValue", kpi)
        const datapoints = datasets.find(dset => dset.key === kpi.datasetKey)?.datapoints;
        const _options = {
            ...options,
            dateRange, 
            dataMethod,
            completionCalcInfo:{
                startValue:kpi.deckRawValues?.start, targetValue:kpi.deckRawValues?.target
            },
            //temp for mock values
            deckIndex,
            playerId:player._id,
        }
        return getStatValue(kpi, datapoints, _options);
    }
    //console.log("adding deck values to kpi.........")
    const kpisWithDeckValues = kpis.map(kpi => { 
        const { customDeckStartValue } = kpi;
        //console.log("kpi------------------", kpi)
        const bestPossibleRawValue = calcBestPossibleValue(kpi);
        const worstPossibleRawValue = calcWorstPossibleValue(kpi);
        const dataset = datasets.find(dset => dset.key === kpi.datasetKey);
        const measure = dataset?.measures.find(m => m.key === kpi.measureKey);
        return {
            ...kpi, 
            deckRawValues:{
                start: isNumber(customDeckStartValue) ? 
                    customDeckStartValue : getValue(kpi, [addWeeks(-52, deckStartDate), deckStartDate], "latest")?.raw,
                target: isNumber(kpi.customTarget) ? kpi.customTarget : (isNumber(kpi.groupTarget) ? kpi.groupTarget : bestPossibleRawValue),
                bestPossible:bestPossibleRawValue,
                worstPossible:worstPossibleRawValue,
            },
            datasetName:dataset?.name || "",
            statName:measure?.name || "",
            getValue
        }
    });

    const cardOptions = {
        now: new Date(),
        rangeFormat: getRangeFormat(settings.cardDateGranularity),
        deckStartDate,
        deckEndDate,
        getValue,
    };

    //recursive function
    const addValuesToNextCard = (remaining, addedSoFar) => {
        const next = remaining[0];
        //base case
        if(!next){ return addedSoFar; }
        const prevCardDate = addedSoFar[addedSoFar.length - 1]?.date;
        const nextAdded = addValuesToCard(next, kpisWithDeckValues, settings, { ...cardOptions, prevCardDate });
        //recursive call
        return addValuesToNextCard(remaining.slice(1, remaining.length), [ ...addedSoFar, nextAdded])
    }
    //init call
    return addValuesToNextCard(orderedCards, []);
}

function addValuesToCard(card, kpis, settings, options){
    //console.log("addValuesToCard------------", card)
    const { date } = card;
    const { deckStartDate, deckEndDate, prevCardDate, getValue } = options;
    const cardStartDate = prevCardDate || deckStartDate;
    const dataMethod = settings.find(s => s.key === "achievedValueDataMethod").value;
    return { 
        ...card, 
        kpis:kpis.map(kpi => {
            const { deckRawValues, datasetName, statName } = kpi;
            //console.log("kpi...",kpi.key,  kpi)
            const cardExpected = calcExpected(deckStartDate, deckRawValues.start, deckEndDate, deckRawValues.target, date);
            const cardAchieved = getValue(kpi, [cardStartDate, date], dataMethod, { ...options, cardNr: card.cardNr });
            return {
                ...kpi,
                values:{
                    start:{ raw:deckRawValues.start, completion:0 },
                    target:{ raw:deckRawValues.target, completion:100 },
                    expected:cardExpected,
                    achieved:cardAchieved
                },
                datasetName,
                statName
            }

        })
    };
    //console.log("datasets", datasets)
    /*
    const { now, rangeFormat } = options;
    const { id, customTargets=[], isCurrent, profileKpis=[] } = profile;
    const date = typeof profile.date === "string" ? new Date(profile.date) : profile.date;
    const created = typeof profile.created === "string" ? new Date(profile.created) : profile.created;
    const customStartDate = !profile.customStartDate ? null : (typeof profile.customStartDate === "string" ? new Date(profile.customStartDate) : profile.customStartDate);
    const milestoneId = id;
    //startDate
    //helper
    //@todo - implement different expiry units, for now, we assume its months
    const expiryDuration = Number(settings.find(s => s.key === "dataExpiryTimeNumber").value);
    const expiryUnits = settings.find(s => s.key === "dataExpiryTimeUnits").value;
    const goBackByExpiryDuration = goBackByExpiryDurationFromDate(expiryDuration, expiryUnits);

    const defaultProfileStartDate = settings.find(s => s.key === "defaultProfileStartDate");
    const restrictDataToWindow = settings.find(s => s.key === "dataToIncludeInMilestones").value === "fromStart";
    const currentValueDataMethod = settings.find(s => s.key === "currentValueDataMethod").value
    const achievedValueDataMethod = settings.find(s => s.key === "achievedValueDataMethod").value
    //@todo - use session id (or date and time). For now, default to the last session date
    const specificDate = currentValueDataMethod === "specificSession" ? getLastSessionDate(datasets) : null;
    //either manual startDate if set, or prev date, or otherwise 20 years ago
    //const startDate = profile.startDate || prevProfile?.date || oneMonthAgo(date);
    //if not startdate and no past profile, then we start from when any non-expired data could exist
    //@todo - deal with profile cards that have date set to eg morning of today - should still be future
    const datePhase = date < now ? "past" : "future";

    const isPast = datePhase === "past";
    const isFuture = datePhase === "future";
    const isActive = isFuture && prevProfile?.isPast;

    const startDate = customStartDate || (created < date ? created : addMonths(-1, date))
    //const startDateType = customStartDate ? "custom" : (created < date ? "creationDate" : "monthBefore");
    startDate.setUTCHours(12); 
    startDate.setUTCMinutes(0); 
    startDate.setUTCSeconds(0); 
    startDate.setUTCMilliseconds(0); 
    //console.log("startDate", startDate)
    //console.log("date", date)
    */
    /*else if(prevProfileToUse){
        profileStart.type = "prev";
        //if this profile is past, then it will use the prev profile to it (rather than the lastPast
        //but it doesnt really matter - i think we shold remove this option as it complicates things.
        //for past profiles, there is either a custom date, or none at all. Unless teh user specifies in their
        //settings that they want to chain them (but this option cant be changed atm)
        profileStart.prevProfileType = isPast ? "prev" : "lastPast";
        profileStart.date = prevProfileToUse.date;
    }else{
        //there is no custom startDate, and no pastProfile or prevProfile to base their start date on
        profileStart.type = "default";
        const creationDate = new Date(created);
        profileStart.date = creationDate < date ? creationDate : goBackByExpiryDuration(date);
        //all profile dates default to 12:00
        profileStart.date.setUTCHours(12); 
        profileStart.date.setUTCMinutes(0); 
        profileStart.date.setUTCSeconds(0); 
        profileStart.date.setUTCMilliseconds(0); 
    }*/
    /*
    let dateRange;
    if(restrictDataToWindow){
        dateRange = calcDateRange(startDate, date);
    }else if(isFuture){
        dateRange = calcDateRange(goBackByExpiryDuration(now), now)
    }else{
        dateRange = calcDateRange(goBackByExpiryDuration(date), date);
    }

    const profileGoal = profile.goal || {};
    return {
        ...profile,
        id:milestoneId,
        dataType:"profile",
        media:profile.media || [],
        goal:{
            title:"Goal Title",
            desc:"Goal description...",
            ...profileGoal
        },
        dateCount:calcDateCount(now, date),
        startDate,
        //startDateType,
        dateRange,
        datePhase,
        isPast,
        isFuture,
        isActive,
        kpis:kpis.map((kpi,i) => {
            //KEYS/ID
            const { datasetKey, statKey, min, max, accuracy, standards, orientationFocus } = kpi;
            const key = kpi.key || `${datasetKey}-${statKey}`;
            //console.log("kpi key--------------------------", key)
            //console.log("kpi--------------------------", kpi)


            const profileKpi = profileKpis.find(pKpi => pKpi.key === key) || {};
            const { customMinStandard, customStartValue, steps=[] } = profileKpi;

            //console.log("datasets", datasets)
            //console.log("datasetKey", datasetKey)
            const dataset = datasets.find(dset => dset.key === datasetKey);
            //console.log("dataset", dataset)
            const datapoints = dataset?.datapoints || [];
            //console.log("datapoints", datapoints)

            //add accuracy to teh stat - note that the stat has only stable metadata, whereas the kpi
            //is dependent on context, so level of accuracy to display is defined in kpi not stat
            const stat = { ...dataset?.stats.find(s => s.key === statKey), accuracy };
            const { order } = stat;

            const getValue = getValueForStat(stat.key, stat.accuracy);
            //@todo - pass these dateValue pairs into calCurrent so not repeating work
            const dateValuePairs = datapoints
                .filter(d => !d.isTarget)
                .map(d => [d.date, getValue(d)])

            const lastDataUpdate = isPast ? null : d3.max(dateValuePairs, d => d[0]);

            const dataStart = order === "highest is best" ? min : max;
            const dataEnd = order === "highest is best" ? max : min;

            //minStandard - may be custom, may be general for kpi, or may be undefined,
            let minStandard = standards.find(st => st.key === "minimum");
            //overide with custom
            if(customMinStandard){
                minStandard = { key:"minimum", label:"Minimum", value:customMinStandard }
            }
            //ensure there is a minStandard if its a defence kpi
            if(!minStandard && orientationFocus === "defence"){
                minStandard = { key:"minimum", label:"Minimum", value:d3.mean([min, max]) }
            }

            const enrichedMinStandard = !minStandard ? null : {
                ...minStandard,
                plus10PC:calcPCIntervalsFromValue(10, [dataStart, dataEnd], minStandard.value, { accuracy })[1]
            }

            const shouldLog = false;// id === "profile-2" && datasetKey === "nutrition";
            if(shouldLog){
                //console.log("kpi key........................", key)
                //console.log("customMin", customMinStandard)
            }
            
            //VALUES

            //START
            //let start;
            //if(profileStart.type === "custom" || profileStart.type === "default"){
            const startDateRange = calcDateRange(goBackByExpiryDuration(startDate), startDate);
            if(shouldLog){
                //console.log("datapoints", datapoints)
                //console.log("getting start value", profileKpi)
            }
            const actualStart = customStartValue || calcCurrent(stat, datapoints, startDateRange, achievedValueDataMethod, undefined, undefined, shouldLog).actual;
            const start = {
                date:startDate,
                //note - we pass in the achieved data method, as this will always be in the past
                actual:isNumber(actualStart) ? actualStart : dataStart,
                completion:0,
                startType: !isNumber(actualStart) ? "dataStart" : (isNumber(customStartValue) ? "custom" : "datapoint"),
                isDefault: !isNumber(actualStart)
            }
            if(shouldLog){
                //console.log("start", start)
            }
            }else{
                //its based on a prev profile 
                //@todo - date should actually be the date of the last datapoint entered within the relevant window
                //rather than the end date of the profile, so that it is more accurate when making predictions
                const prevValuesToUse = prevProfileToUse.kpis.find(kpi => kpi.key === key).values;
                start = prevValuesToUse.achieved ? 
                    { ...profileStart, ...prevValuesToUse.achieved, completion:0 } 
                    : 
                    { ...profileStart, ...prevValuesToUse.start, completion:0 } //date is overriden in this case    
            }

            //TARGET
            const customTargetsForStat = customTargets
                .filter(t => t.datasetKey === datasetKey && t.statKey === statKey)
                .filter(t => isNumber(t.actual));

            if(shouldLog){
                //console.log("customTargets", customTargets)
                //console.log("customTargsForStat", customTargetsForStat)
            }

            const customTarget = d3.greatest(customTargetsForStat, d => d.created);
            const k = customTarget ? Number(customTarget.actual) : null;
            const parsedCustomTarget = customTarget ? customTarget.actual : null;
            
            //2 possible causes of new targ not getting picked up
            //date of new targ that hasnt gone thru server os a Date not a string
            //actual and pc are numbers not strings
            const nonRoundedTarget = isNumber(parsedCustomTarget) ? parsedCustomTarget : createTargetFromDefault(datasetKey, statKey, date, defaultTargets);
            const actualTarget = round(nonRoundedTarget, accuracy);
            //we must round, because accuracy is contextual so a target may not be rounded to the required level
            const target = {
                actual:isNumber(actualTarget) ? actualTarget : dataEnd,
                completion:100,
                targetType:!isNumber(actualTarget) ? "dataEnd" : (parsedCustomTarget ? "custom" : "stored"),
                isDefault:!isNumber(actualTarget)
            }
            if(shouldLog){
                //console.log("target", target)
            }

            //CURRENT
            //note - for current profile, the range is last twenty years so all will be included anyway
            //this is also true for 1st profile, unless user specifies a startDate
            let current;
            if(isPast){ 
                current = calcCurrent(stat, datapoints, dateRange, achievedValueDataMethod, start, target); 
            }
            else if(currentValueDataMethod !== "specificSession"){
                if(shouldLog){
                    //console.log("calculating current value")
                }
                current = calcCurrent(stat, datapoints, dateRange, currentValueDataMethod, start, target, shouldLog);
            }else{
                //it must be a future card and current value is based purely on a specificSession
                current = getValueForSession(stat, datapoints, specificDate, start, target)
            }
            //if(shouldLog){
                //console.log("current", current)
            //}

            const achieved = isPast ? current : null;
            //if(shouldLog)
            //console.log("calcing expected......")
            //note prevProfile has already been processed with a full key and values
            let expected = isPast ? null : calcExpected(start, { date, ...target }, now, { accuracy });
            //why is this {null}

            const values = {
                //min/max are just values
                min, max, start, current, expected, achieved, target, //proposedTarget,
            }
            if(shouldLog){
                //console.log("order", order)
                //console.log("values", values)
            }

            //statProgressStatus is either achieved, onTrack, offTrack, or undefined
            let statProgressOptions = { order };
            let statProgressStatus;
            if(orientationFocus === "defence"){
                if(requiredValueIsAchieved(values.current, { actual: enrichedMinStandard.plus10PC }, statProgressOptions)){
                    statProgressStatus = "achieved";
                }else if(requiredValueIsAchieved(values.current, { actual: minStandard.value }, statProgressOptions)){
                    statProgressStatus = "onTrack";
                }else{
                     //note - no data will also mean offTrack
                    statProgressStatus = "offTrack";
                }

            } else if(target.isDefault){
                statProgressStatus = "noTarget";
            } else if(targetIsAchieved(values, statProgressOptions)){
                statProgressStatus = "achieved";
            } else if(expectedIsAchieved(values, statProgressOptions)){
                statProgressStatus = "onTrack";
            } else {
                //note - no data will also mean offTrack
                statProgressStatus = "offTrack";
            }

            //steps
            const log = false;//milestoneId === "profile-5" && key === "longJump-distance-left";
            const stepsValues = calcStepsValues(startDate, date, steps);
            if(log){
                //console.log("kpi...............................", key)
                //console.log("steps", steps)
                //console.log("stepsValues", stepsValues)
            }
            let stepsProgressStatus;
            if(steps?.length === 0){
                //if(log){ console.log("set no target-----")}
                stepsProgressStatus = "noTarget"
            }else if(isPast){
                //if(log){ console.log("set past card-----???")}
                stepsProgressStatus = targetIsAchieved(stepsValues, { useSteps:true, log }) ? "achieved" : "notAchieved";
            }else{
                //future
                if(targetIsAchieved(stepsValues, { useSteps:true, log })){
                    //if(log){ console.log("set achieved-----")}
                    stepsProgressStatus = "achieved";
                }else if(expectedIsAchieved(stepsValues, { useSteps:true, log })){
                    //if(log){ console.log("set onTrack------")}
                    stepsProgressStatus = "onTrack";
                }else{
                    //if(log){ console.log("set offTrack-------")}
                    stepsProgressStatus = "offTrack";
                };
            }

            return {
                ...kpi, key, milestoneId,
                //dates
                date, 
                startDate, //this may be different from values.start.date
                dateRange, 
                datePhase,
                isPast, isCurrent, isFuture, isActive,
                lastDataUpdate,
                //data
                dataStart,
                dataEnd,
                minStandard:enrichedMinStandard,
                values,
                statProgressStatus,
                order,
                accuracy,
                //other info
                datasetName:dataset?.name || "",
                statName:stat?.name || "",
                unit:stat?.unit || "",
                //steps
                steps,
                stepsValues,
                stepsProgressStatus
            }
        })
    }
    */
}

