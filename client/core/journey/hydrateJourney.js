import * as d3 from 'd3';
import { addDays, addYears, addMonths, addWeeks, calcDateCount, calcAge } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { getKpis } from "../../data/kpis"
import { getTargets, findDefaultTarget } from "../../data/targets";
import { convertToPC, round, roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
import { linearProjValue } from "./helpers";
import { pcCompletion } from "../../util/NumberHelpers"
import { isNumber, calcPCIntervalsFromValue } from '../../data/dataHelpers';
import { JOURNEY_SETTINGS, JOURNEY_SETTINGS_INFO, createFutureProfile } from './constants';
import { getBandsAndStandards } from "../../data/bandsAndStandards";
import { getProfileStatusInfo } from './profileStatus';

//helper
const requiredValueIsAchieved = (value, required, options={}) => {
    const { order="highest is best", log, useSteps } = options;
    if(log){ 
        //console.log("tia..val", value)
        //console.log("tia..req", required)
    }
    if(!isNumber(value?.actual) || !isNumber(required?.actual)){ return false; }
    if(order === "highest is best"){ 
        if(log){
            //console.log("res", useSteps ? value.actual >= required.actualSteps : value.actual >= required.actual )
        }
        return useSteps ? value.actual >= required.actualSteps : value.actual >= required.actual 
    }
    return value.actual <= required.actual;
}

const targetIsAchieved = (values, options) => requiredValueIsAchieved(values.current, values.target, options);
const expectedIsAchieved = (values, options) => requiredValueIsAchieved(values.current, values.expected, options);

export function hydrateJourneyData(data, user, datasets){
    const now = new Date();
    console.log("hydrateJourneyData", data)
    const player = user.player;
    const nonCurrentProfiles = data.profiles.filter(p => p.id !== "current");

    const nrFutureProfiles = nonCurrentProfiles.filter(p => {
        //cant assume date has been parsed
        const date = typeof p.date === "string" ? new Date(p.date) : p.date;
        const today = new Date();
        today.setHours(22);
        //profiles set to today count as future
        return date >= new Date();
    }).length;

    const profiles = nrFutureProfiles !== 0 ? nonCurrentProfiles : [createFutureProfile(nonCurrentProfiles)]

    const kpis = getKpis(player._id).map(kpi => {
        const { bands=[], standards=[], accuracy=1 } = getBandsAndStandards(kpi.datasetKey, kpi.statKey) || {};
        const min = bands[0] ? bands[0].min : null;
        const max = bands[0] ? bands[bands.length - 1].max : null;
        return { ...kpi, min, max, bands, standards, accuracy }
    });
    //console.log("kpis....................", kpis)
    const defaultTargets = getTargets(player._id, player.groupId);
    const rangeFormat = getRangeFormat("day");

    //embellish the settings, and also put in defaults if required
    const settings = JOURNEY_SETTINGS
        .map(s => {
            const customValue = data.settings.find(set => set.key === s.key)?.value
            return { 
                key: s.key, 
                value: customValue || s.defaultValue,
                isCustom: !!customValue 
            }
        })
        .map(s => ({
            ...JOURNEY_SETTINGS_INFO[s.key], 
            ...s,
            selectedLabel:() => JOURNEY_SETTINGS_INFO[s.key].options.find(opt => opt.value === s.value)?.label,
            selectedDesc:() => JOURNEY_SETTINGS_INFO[s.key].options.find(opt => opt.value === s.value)?.desc
        }));

    //STEP 1: HYDRATE PROFILES
    const options = { now, rangeFormat };
    const hydratedProfiles = hydrateProfiles(profiles, datasets, kpis, defaultTargets, settings, options);
    console.log("hydratedProfiles", hydratedProfiles)

    //STEP 2: CREATE CURRENT PROFILE, including expected values
    const currentProfile = { 
        ...createCurrentProfile(hydratedProfiles, datasets, settings, options ), 
        nr:0,
        media:data.media || []
    };
    console.log("currentprofile", currentProfile)

    //SEP 3: EMBELLISH PROFILES BASED ON CURRENT PROFILE INFO
    const pastProfiles = hydratedProfiles.filter(p => p.isPast).map((p,i, data) => ({ ...p, nr:i - data.length }));
    const futureProfiles = hydratedProfiles.filter(p => p.isFuture).map((p,i) => ({ ...p, nr:i + 1 }));

    const allProfiles = [ ...pastProfiles, currentProfile, ...futureProfiles];

    const enrichedProfiles = allProfiles.map(p => {
        //profileProgressStatus
        const onlyIncludeKpisWithTargets = settings.find(s => s.key === "progressStatusOnlyIncludesKpisWithTargets")?.value
        const profileProgressInfo = p.id === "current" ? undefined : getProfileStatusInfo(p, { onlyIncludeKpisWithTargets })

        return {
            ...p,
            playerAge:calcAge(player.dob, p.date),
            goalPhotoLabel:p.goalPhotoLabel || "goal-default",
            profilePhotoLabel:p.profilePhotoLabel || (p.isCurrent ? "main" : "profile-default"),
            profileProgressInfo,
        }
    })

    return {
        //for now, asume all users are players
        player,
        //kpis not needed at journey level I dont think so have removed
        //kpis,
        //later do user.players.find if user is a coach, and also journey may be bout a coach or group
        ...data,
        contracts:hydrateContracts(data.contracts),
        profiles:enrichedProfiles,
        settings,
        media:data.media || []
    }
}

function hydrateContracts(contracts=[]){
    return contracts.map(c => {
        return {
            ...c,
            dataType:"contract"
        }
    })
}

function hydrateProfiles(profiles=[], datasets, kpis, defaultTargets, settings, options={}){
    //console.log("hydrateProfiles----------------");
    const orderedProfiles = sortAscending(profiles, d => d.date);
    const hydrateNextProfile = (remaining, hydratedSoFar) => {
        const next = remaining[0];
        //base case
        if(!next){ return hydratedSoFar; }
        //hydration
        //the last past card can only be determined if the one we are on is in future
        //@todo - deal with profile cards that have date set to eg morning of today - should still be future
        const lastPastHydrated = next.date < new Date() ? null : d3.greatest(hydratedSoFar.filter(p => p.isPast), p => p.date)
        const prevHydrated = hydratedSoFar.length !== 0 ? hydratedSoFar[hydratedSoFar.length - 1] : null;
        const nextHydrated = hydrateProfile(next, lastPastHydrated, prevHydrated, datasets, kpis, defaultTargets, settings, options);
        //recursive call
        return hydrateNextProfile(remaining.slice(1, remaining.length), [ ...hydratedSoFar, nextHydrated])
    }
    //init call
    return hydrateNextProfile(orderedProfiles, []);
}

//note - we are using all datasets here, even ones potentially that have in involvemnet in kpis
function getLastSessionDate(datasets){
    const dateMaxes = datasets
        .map(dset => dset.datapoints)
        .map(ds => d3.max(ds, d => d.date))

    const max = d3.max(dateMaxes);
    if(!max){ return null; }

    max.setHours(22);
    return max;
}

function calcStepsValues(startDate, date, steps=[]){
    const nrSteps = steps.length;
    const start = { actual:0, completion:0, date:startDate };
    const target = { 
        actual:nrSteps,
        actualSteps:nrSteps, 
        completion:100 
    };
    const nrCompletedSteps = steps.filter(s => s.completed).length;
    const current = { 
        actual:nrCompletedSteps,
        actualSteps:nrCompletedSteps,
        completion: nrSteps === 0 ? 0 : Math.round((nrCompletedSteps/nrSteps) * 100) 
    } 
    //@todo - impl showTrailingZeros in round function so we can set it to false
    const _expected = calcExpected(start, { ...target, date }, new Date(), { accuracy:2, /*showTrailingZeros:false*/ });
    const expected = { ..._expected, actualSteps:Math.floor(_expected.actual) }
    return { start, current, target, expected }
}

//@todo - custom expected when user drags
function calcExpected(start, target, now, options={}){
    //console.log("start", start)
    //console.log("target", target)
    const completion = Math.round(linearProjValue(start.date.getTime(), 0, target.date.getTime(), 100, now.getTime()));
    //console.log("completion", completion)
    if(!start || !isNumber(start.actual) || !isNumber(target.actual)){ 
        return { actual:null, completion }; 
    }
    const { accuracy, showTrailingZeros=true } = options;
    const actual = linearProjValue(start.date.getTime(), start.actual, target.date.getTime(), target.actual, now.getTime());
    //const completion = convertToPC(start.actual, target.actual)(actual);
    return { 
        actual: round(actual, accuracy, showTrailingZeros), 
        completion
    }
}
function isSameDay(d1, d2){
    return  d1.getUTCDate() === d2.getUTCDate() && 
            d1.getUTCMonth() === d2.getUTCMonth() && 
            d1.getUTCFullYear() === d2.getUTCFullYear();
}

function getValueForSession(stat, datapoints, sessionDate, start, target){
    //if dataset unavailable, stat will be undefined
    if(!stat){ return { actual:undefined, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    //note for now we assume one per day, but will soon implement a sessionId property of each datapoint too
    const datapointThatDay = datapoints.find(d => {
        return isSameDay(d.date, sessionDate) && !d.isTarget
    });
    const actual = getValue(datapointThatDay);
    const completion = start && target ? convertToPC(start.actual, target.actual)(actual) : null;
    return { actual , completion };
}

function calcCurrent(stat, datapoints, dateRange, dataMethod, start, target, log){
    console.log("calcCurrent......", stat.key)
    console.log("nrdatapoints", datapoints.length)
    if(log){
        //console.log("calcCurrent stat", stat)
    }
    //if dataset unavailable, stat will be undefined
    if(!stat){ return { actual:undefined, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    const dateValuePairs = datapoints
        //if no date range, we want to include all as it will be the current card
        .filter(d => !dateRange || dateIsInRange(d.date, dateRange))
        .filter(d => !d.isTarget)
        .map(d => [d.date, getValue(d)])
        .filter(d => {
            return typeof d[1] === "number"
        })
    console.log("nrpairs", pairs.length)

    const values = dateValuePairs.map(d => d[1]);
    
    //helper
    const getBest = values => stat.order === "lowest is best" ? d3.min(values) : d3.max(values);
    const getOverallValue = values => {
        if(dataMethod === "best"){ return getBest(values); }
        if(dataMethod === "latest") {
            return dateValuePairs[0] ? d3.greatest(dateValuePairs, d => d[0])[1] : null 
        }
        return 0;
    }
    const actual = getOverallValue(values);
    const completion = start && target ? convertToPC(start.actual, target.actual)(actual) : null;
    return {
        actual,
        completion
    }

}

function createTargetFromDefault(datasetKey, statKey, date, defaultTargets){
    const defaultTarget = findDefaultTarget(defaultTargets, datasetKey, statKey, date);
    return defaultTarget?.value || null;
}

function twentyYearsAgo(now){ return addMonths(-240, now); }
function oneMonthAgo(now){ return addMonths(-1, now); }
function calcDateRange(start, end, format){
    return [
        roundUp(start, "day", format), 
        roundUp(end, "day", format)
    ];
}

const goBackByExpiryDurationFromDate = (duration, units) => date => {
    if(units === "years"){ return addYears(-duration, date); }
    if(units === "months"){ return addMonths(-duration, date); }
    if(units === 'weeks'){ return addWeeks(-duration, date); }
    return date;
}

function hydrateProfile(profile, lastPastProfile, prevProfile, datasets, kpis, defaultTargets, settings, options={}){
    console.log("hydrateProfile------------", profile.id, profile.date, profile)
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
    //notes about why we default to lastPastCard not the prevCard (for future cards)
    //note 1 - if we want future cards to start from a prev future card, that is achieved by running
    //a simulation, as that is when it would make sense to do so
    //note 2: Targets for future cards can still eb calculated incrementally, and visually adjusted based on 
    //the target for a previous future card

    //note - after this line, we never refer directly to prevProfile or lastPastProfile
    //const prevProfileToUse = isPast ? prevProfile : lastPastProfile;
    //profile.startDate is set on the card at the time of creation if it was set to creationDate, pastCardFixed, or prevCardFixed
    //the startDateSetting is also stored on the profile so it is not affected by any change to the setting after it's creation
    //profile.startdate is also set at any time that the user changes the date manually

    const startDate = customStartDate || (created < date ? created : addMonths(-1, date))
    //const startDateType = customStartDate ? "custom" : (created < date ? "creationDate" : "monthBefore");
    startDate.setUTCHours(12); 
    startDate.setUTCMinutes(0); 
    startDate.setUTCSeconds(0); 
    startDate.setUTCMilliseconds(0); 
    //console.log("startDate", startDate)
    //console.log("date", date)
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
            console.log("kpi key--------------------------", key)
            console.log("kpi--------------------------", kpi)


            const profileKpi = profileKpis.find(pKpi => pKpi.key === key) || {};
            const { customMinStandard, customStartValue, steps=[] } = profileKpi;

            const dataset = datasets.find(dset => dset.key === datasetKey);
            const datapoints = dataset?.datapoints || [];
            console.log("datapoints", datapoints)

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
            /*}else{
                //its based on a prev profile 
                //@todo - date should actually be the date of the last datapoint entered within the relevant window
                //rather than the end date of the profile, so that it is more accurate when making predictions
                const prevValuesToUse = prevProfileToUse.kpis.find(kpi => kpi.key === key).values;
                start = prevValuesToUse.achieved ? 
                    { ...profileStart, ...prevValuesToUse.achieved, completion:0 } 
                    : 
                    { ...profileStart, ...prevValuesToUse.start, completion:0 } //date is overriden in this case    
            }*/

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
                console.log("current", current)
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
                console.log("order", order)
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
}


//current profile is dynamically created, so it doesnt need hydrating
//note - this is nely created each time, so nothing must be stored on it
function createCurrentProfile(orderedProfiles, datasets, settings, options={}){
    console.log("createcurrentprofile----------------------------------")
    const { now, rangeFormat } = options;
    const activeProfile = d3.least(orderedProfiles.filter(p => p.isFuture), p => p.date);
    const { kpis } = activeProfile;
    //console.log("kpis", kpis)
    //@todo - current profile should show all kpis that are used in any future profile, grouped by profile?
    //for now, current profile just shpows the kpis for the active profile
    const activeProfileValues = kpi => kpis
        ?.find(k => k.datasetKey === kpi.datasetKey && k.statKey === kpi.statKey)
        ?.values;

    const lastPastProfile = d3.greatest(orderedProfiles.filter(p => p.isPast), p => p.date);

    //settings
    const expiryDuration = Number(settings.find(s => s.key === "dataExpiryTimeNumber").value);
    const expiryUnits = settings.find(s => s.key === "dataExpiryTimeUnits").value;
    const goBackByExpiryDuration = goBackByExpiryDurationFromDate(expiryDuration, expiryUnits);

    const currentValueDataMethod = settings.find(s => s.key === "currentValueDataMethod").value;
    //@todo - use session id (or date and time). For now, default to the last session date
    const specificDate = currentValueDataMethod === "specificSession" ? getLastSessionDate(datasets) : null;

    const startDate = goBackByExpiryDuration(now);
    const datePhase = "current";
    const dateRange = calcDateRange(startDate, now);
    return {
        startDate,
        settings,
        specificDate,
        date:now, dateRange, datePhase,
        id:"current", isCurrent:true, dataType:"profile",
        kpis:kpis.map((kpi,i) => {
            console.log("kpi...", kpi)
            const { datasetKey, statKey, name, min, max, accuracy, key } = kpi;
            const milestoneId = "current";
            
            const dataset = datasets.find(dset => dset.key === datasetKey);
            const datapoints = dataset?.datapoints || [];
            console.log("datapoints", datapoints)
            const stat = { ...dataset?.stats.find(s => s.key === statKey), accuracy };
            const getValue = getValueForStat(stat.key, stat.accuracy);
            //@todo - pass these dateValue pairs into calCurrent so not repeating work
            const dateValuePairs = datapoints
                .filter(d => !d.isTarget)
                .map(d => [d.date, getValue(d)])

            const lastDataUpdate = d3.max(dateValuePairs, d => d[0]);
            //current value
            let current;
            if(currentValueDataMethod !== "specificSession"){
                current = calcCurrent(stat, datapoints, dateRange, currentValueDataMethod, undefined, undefined);
                console.log("calced current", current)
            }else{
                //it must be a future card and current value is based purely on a specificSession
                current = getValueForSession(stat, datapoints, specificDate)
            }

            //names
            const datasetName = dataset?.name || "";
            const statName = stat?.name || "";

            //flatten all steps for this kpi (special case for current)
            //@todo - keep them flat, but adjust listComponent so it nests them, or, nest them here 
            //and adjust list so it can handle it to allow draggin to move steps between milestones
            const steps = orderedProfiles
                .map(p => p.kpis.find(kpi => kpi.key === key).steps
                    .map(step => ({
                        milestoneId:p.id,
                        kpiName:name,
                        datasetName,
                        statName,
                        ...step
                    }))
                )
                .reduce((a, b) => [...a, ...b], []);

            return {
                ...kpi,
                key,
                milestoneId,
                //dates
                date:now, 
                startDate,
                dateRange, datePhase, 
                isCurrent:true, isPast:false, isFuture:false,
                order:stat.order,
                accuracy,
                lastDataUpdate,
                values:{
                    //min/max just values
                    min, max,
                    //expected,
                    //target,
                    current
                },
                //other info
                datasetName,
                statName,
                unit:stat?.unit || "",
                steps,
                //stepsValues,
            }
        })
    }

}