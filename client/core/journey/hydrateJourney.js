import * as d3 from 'd3';
import { addMonths } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { getKpis } from "../../data/kpis"
import { getTargets, findDefaultTarget } from "../../data/targets";
import { round, roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
import { linearProjValue } from "./helpers";
import { calcDateCount } from "../../util/TimeHelpers"
import { pcCompletion } from "../../util/NumberHelpers"
import { JOURNEY_SETTINGS, JOURNEY_SETTINGS_OPTIONS } from './constants';
import { getBandsAndStandards } from "../../data/bandsAndStandards";

export function hydrateJourneyData(data, user, datasets){
    const now = new Date();
    //console.log("hydrateJourneyData", datasets)
    const nonCurrentProfiles = data.profiles.filter(p => p.id !== "current");
    const player = user.player;

    const kpis = getKpis(player._id).map(kpi => {
        const { bands, standards, accuracy } = getBandsAndStandards(kpi.datasetKey, kpi.statKey) || {};
        const min = bands[0] ? bands[0].min : null;
        const max = bands[0] ? bands[bands.length - 1].max : null;
        return { ...kpi, bands, standards, min, max, accuracy }
    });
    const defaultTargets = getTargets(player._id, player.groupId);
    const rangeFormat = getRangeFormat("day");

    //embellish the settings, and also put in defaults if required
    const settings = JOURNEY_SETTINGS
        .map(s => ({ 
            key: s.key, 
            value: data.settings.find(set => set.key === s.key)?.value || s.defaultValue 
        }))
        .map(s => {
            //there may not be any embellisments, eg if setting is a number
            const embellishments = JOURNEY_SETTINGS_OPTIONS.find(set => set.key === s.key && set.value === s.value) || {};
            return {
                ...embellishments, 
                ...s
            }
    });

    //STEP 1: HYDRATE PROFILES
    const options = { now, rangeFormat };
    //console.log("hydrateJourney", data)
    const hydratedProfiles = hydrateProfiles(nonCurrentProfiles, datasets, kpis, defaultTargets, settings, options);
    //console.log("hydratedProfiles", hydratedProfiles.find(p => p.id === "profile-1"))

    //STEP 2: CREATE CURRENT PROFILE, including expected values
    const currentProfile = createCurrentProfile(hydratedProfiles, datasets, kpis, settings, options );

    //console.log("currentProfile", currentProfile)
    //SEP 3: EMBELLISH PROFILES BASED ON CURRENT PROFILE INFO
    const pastProfiles = hydratedProfiles.filter(p => p.isPast);
    const futureProfiles = hydratedProfiles.filter(p => p.isFuture)
        //.map(p => addExpected(p, currentProfile));

    return {
        //for now, asume all users are players
        player,
        //kpis not needed at journey level I dont think so have removed
        //kpis,
        //later do user.players.find if user is a coach, and also journey may be bout a coach or group
        ...data,
        contracts:hydrateContracts(data.contracts),
        profiles:[ ...pastProfiles, currentProfile, ...futureProfiles],
        settings
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
    //console.log("hydrateProfiles----------------", profiles);
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

//@todo - custom expected when user drags
function calcExpected(kpi, start, target, now, options={}){
    //console.log("calcExp targ", target)
    if(!start || start.actual === null || target.actual === null){ 
        return { actual:null, completion:null }; 
    }
    const { accuracy, showTrailingZeros=true } = options;
    //@todo - completion
    const actual = linearProjValue(start.date.getTime(), start.actual, target.date.getTime(), target.actual, now.getTime())
    return { 
        actual: round(actual, accuracy, showTrailingZeros), 
        completion:null 
    }
}
function isSameDay(d1, d2){
    return  d1.getUTCDate() === d2.getUTCDate() && 
            d1.getUTCMonth() === d2.getUTCMonth() && 
            d1.getUTCFullYear() === d2.getUTCFullYear();
}

function getValueForSession(stat, datapoints, sessionDate){
    //if dataset unavailable, stat will be undefined
    if(!stat){ return { actual:undefined, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    //note for now we assume one per day, but will soon implement a sessionId property of each datapoint too
    const datapointThatDay = datapoints.find(d => {
        return isSameDay(d.date, sessionDate) && !d.isTarget
    });
    return { actual: getValue(datapointThatDay), completion:null };
}

function calcCurrent(stat, datapoints, dateRange, dataMethod){
    //if dataset unavailable, stat will be undefined
    if(!stat){ return { actual:undefined, completion:null } }
    //helper
    const getValue = getValueForStat(stat.key, stat.accuracy);
    const dateValuePairs = datapoints
        //if no date range, we want to include all as it will be the current card
        .filter(d => !dateRange || dateIsInRange(d.date, dateRange))
        .filter(d => !d.isTarget)
        .map(d => [d.date, getValue(d)])
        .filter(d => typeof d[1] === "number")

    const values = dateValuePairs.map(d => d[1]);
    
    //helper
    const getBest = values => stat.order === "highest is best" ? d3.max(values) : d3.min(values);
    const getOverallValue = values => {
        if(dataMethod === "best"){ return getBest(values); }
        if(dataMethod === "latestValue") {
            //console.log("pairs", dateValuePairs) 
            //console.log("greatest", d3.greatest(dateValuePairs, d => d[0]))
            return dateValuePairs[0] ? d3.greatest(dateValuePairs, d => d[0])[1] : null 
        }
        return 0;
    }
    return {
        //@todo - use min if order is 'lowest is best', use stat to determine order
        actual: getOverallValue(values),
        completion: null
    }

}

function createTargetFromDefault(datasetKey, statKey, date, defaultTargets){
    const defaultTarget = findDefaultTarget(defaultTargets, datasetKey, statKey, date);
    return {
        actual:defaultTarget?.value || null,
        completion:defaultTarget?.completion || null,
    }
}

function twentyYearsAgo(now){ return addMonths(-240, now); }
function oneMonthAgo(now){ return addMonths(-1, now); }
function calcDateRange(start, end, format){
    return [
        roundUp(start, "day", format), 
        roundUp(end, "day", format)
    ];
}


function hydrateProfile(profile, lastPastProfile, prevProfile, datasets, kpis, defaultTargets, settings, options={}){
    //console.log("hydrateProfile------------", profile.id, profile.date, profile.created)
    const { now, rangeFormat } = options;
    const { id, date, customTargets=[], isCurrent, created } = profile;
    const milestoneId = id;
    //startDate
    //helper
    //@todo - implement different expiry units, for now, we assume its months 
    const expiryDuration = settings.find(s => s.key === "dataExpiryTimeNumber").value;
    const restrictDataToWindow = settings.find(s => s.key === "restrictMilestoneDataToWindow").value;
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
    const prevProfileToUse = isPast ? prevProfile : lastPastProfile;
    const profileStart = {};
    if(profile.startDate){
        profileStart.type = "custom";
        profileStart.date = profile.startDate;
    }else if(prevProfileToUse){
        profileStart.type = "prev";
        profileStart.prevProfileType = isPast ? "prev" : "lastPast";
        profileStart.date = prevProfileToUse.date;
    }else{
        profileStart.type = "default";
        const creationDate = new Date(created);
        profileStart.date = creationDate < date ? creationDate : addMonths(-expiryDuration, date);
        //all profile dates default to 22:00
        profileStart.date.setUTCHours(22); 
        profileStart.date.setUTCMinutes(0); 
        profileStart.date.setUTCSeconds(0); 
        profileStart.date.setUTCMilliseconds(0); 
    }
   
    let dateRange;
    if(restrictDataToWindow){
        dateRange = calcDateRange(profileStart.date, date);
    }else if(isFuture){
        dateRange = calcDateRange(addMonths(-expiryDuration, now), now)
    }else{
        dateRange = calcDateRange(addMonths(-expiryDuration, date), date);
    }

    return {
        ...profile,
        id:milestoneId,
        dataType:"profile",
        dateCount:calcDateCount(now, date),
        start:profileStart,
        //legacy  - @todo - remove references to startDate for profile, replace with start.date
        startDate:profileStart.date, //must remove
        dateRange,
        datePhase,
        isPast,
        isFuture,
        isActive,
        kpis:kpis.map((kpi,i) => {
            //console.log("kpi", kpi)
            //console.log("profileStart", profileStart)
            //console.log("prevProfToUse", prevProfileToUse)
            //KEYS/ID
            const { datasetKey, statKey, min, max, accuracy } = kpi;
            const key = `${datasetKey}-${statKey}`;
            //console.log("kpi key", key)
            
            //VALUES
            //helper
            //issue - surely we should also filter for datasetKey
            //need to take ll this into the calcCurrent func
            const dataset = datasets.find(dset => dset.key === datasetKey);
            const datapoints = dataset?.datapoints || [];
            //add accuracy to teh stat - note that the stat has only stable metadata, whereas the kpi
            //is dependent on context, so level of accuracy to display is defined in kpi not stat
            const stat = { ...dataset?.stats.find(s => s.key === statKey), accuracy };

            let start;
            if(profileStart.type === "custom" || profileStart.type === "default"){
                //console.log("date....", profileStart.date)
                const startDateRange = calcDateRange(addMonths(-expiryDuration, profileStart.date), profileStart.date);
                start = {
                    ...profileStart,
                    //note - we pass in the achieved data method, as this will always be in the past
                    ...calcCurrent(stat, datapoints, startDateRange, achievedValueDataMethod) //put params in for the custom startDate
                }
            }else{
                //its based on a prev profile 
                //@todo - date should actually be the date of the last datapoint entered within the relevant window
                //rather than the end date of the profile, so that it is more accurate when making predictions
                const prevValuesToUse = prevProfileToUse.kpis.find(kpi => kpi.key === key).values;
                start = prevValuesToUse.achieved ? 
                    { ...profileStart, ...prevValuesToUse.achieved } 
                    : 
                    { ...profileStart, ...prevValuesToUse.start } //date is overriden in this case    
            }



            //note - for current profile, the range is last twenty years so all will be included anyway
            //this is also true for 1st profile, unless user specifies a startDate
            let current;
            if(isPast){ 
                current = calcCurrent(stat, datapoints, dateRange, achievedValueDataMethod); 
            }
            else if(currentValueDataMethod !== "specificSession"){
                current = calcCurrent(stat, datapoints, dateRange, currentValueDataMethod);
            }else{
                //it must be a future card and current value is based purely on a specificSession
                current = getValueForSession(stat, datapoints, specificDate)
            }
            //console.log("current", current, dateRange)
            //console.log("ds", datapoints)
            const achieved = isPast ? current : null;
            const customTargetsForStat = customTargets
                .filter(t => t.datasetKey === datasetKey && t.statKey === statKey)
                .filter(t => typeof Number(t.actual) === "number" && !Number.isNaN(Number(t.actual)));

            const customTarget = d3.greatest(customTargetsForStat, d => d.created);
            const k = customTarget ? Number(customTarget.actual) : null;
            const parsedCustomTarget = customTarget ? { actual: Number(customTarget.actual), completion:Number(customTarget.completion) } : null;
            
            //2 possible causes of new targ not getting picked up
            //date of new targ that hasnt gone thru server os a Date not a string
            //actual and pc are numbers not strings
            const nonRoundedTarget = parsedCustomTarget || createTargetFromDefault(datasetKey, statKey, date, defaultTargets);
            //we must round, because accuracy is contextual so a target may not be rounded to the required level
            const target = {
                ...nonRoundedTarget,
                actual:round(nonRoundedTarget.actual, accuracy)
            }
            if(key === "pressUps-reps"){
                
            }
            //note prevProfile has already been processed with a full key and values

            //for now, we only do expected for the active profile, which ensures achived is defined on previous
            let expected = isPast ? null : calcExpected(kpi, start, { date, ...target }, now, { accuracy });

            if(i === 0 && id === "profile-7"){
                //console.log("expected", expected)
            }

            return {
                ...kpi, key, milestoneId,
                //dates
                date, 
                startDate: profileStart.Date, //this may be different from values.start.date
                dateRange, 
                datePhase,
                isPast, isCurrent, isFuture, isActive,
                //values
                values:{
                    //min/max are just values
                    min, max, start, current, expected, achieved, target, //proposedTarget,
                },
                accuracy,
                //other info
                datasetName:dataset?.name || "",
                statName:stat?.name || "",
                unit:stat?.unit || ""
                
            }
        })
    }
}


//current profile is dynamically created, so it doesnt need hydrating
//note - this is nely created each time, so nothing must be stored on it
function createCurrentProfile(orderedProfiles, datasets, kpis, settings, options={}){
    //console.log("createcurrentprofile----------------------------------")
    const { now, rangeFormat } = options;
    const activeProfile = d3.least(orderedProfiles.filter(p => p.isFuture), p => p.date);
    const activeProfileValues = kpi => activeProfile?.kpis
        ?.find(k => k.datasetKey === kpi.datasetKey && k.statKey === kpi.statKey)
        ?.values;

    const lastPastProfile = d3.greatest(orderedProfiles.filter(p => p.isPast), p => p.date);

    //settings
    //@todo - implement different expiry units, for now, we assume its months 
    const expiryDuration = settings.find(s => s.key === "dataExpiryTimeNumber").value;
    const currentValueDataMethod = settings.find(s => s.key === "currentValueDataMethod").value;
    //@todo - use session id (or date and time). For now, default to the last session date
    const specificDate = currentValueDataMethod === "specificSession" ? getLastSessionDate(datasets) : null;

    //10 was scored in 20th apr 2021 so not within 3 months and not since last card
    //it seems startdate is more than 3 months ago
    //note - current always only takes values from last 3 months
    //@todo - implement other starts for current card eg this week / this season etc
    const profileStart = {
        type:"default",
        date:addMonths(-expiryDuration, now)
    };
    const datePhase = "current";
    const dateRange = calcDateRange(profileStart.date, now);
    return {
        start:profileStart,
        //legacy - remove
        startDate:profileStart.date,
        settings,
        specificDate,
        /*date:now,*/ dateRange, datePhase,
        id:"current", isCurrent:true, dataType:"profile",
        kpis:kpis.map((kpi,i) => {
            //console.log("kpi...", kpi)
            const { datasetKey, statKey, min, max, values, accuracy } = kpi;
            const key = `${datasetKey}-${statKey}`;
            const milestoneId = "current";
            
            const dataset = datasets.find(dset => dset.key === datasetKey);
            const datapoints = dataset?.datapoints || [];
            const stat = { ...dataset?.stats.find(s => s.key === statKey), accuracy };
            //START & END
            //@todo - if user has given a fixed startTime for a profile, then get value at that point
            const prevAchieved = lastPastProfile?.kpis.find(kpi => kpi.key === key)?.achieved;

            let current;
            if(currentValueDataMethod !== "specificSession"){
                current = calcCurrent(stat, datapoints, dateRange, currentValueDataMethod);
            }else{
                //it must be a future card and current value is based purely on a specificSession
                current = getValueForSession(stat, datapoints, specificDate)
            }

            return {
                ...kpi,
                key,
                milestoneId,
                //dates
                date:now, 
                startDate:profileStart.date,
                dateRange, datePhase, isCurrent:true,
                accuracy,
                values:{
                    //min/max just values
                    min, max,
                    expected:activeProfileValues(kpi)?.expected,
                    target:activeProfileValues(kpi)?.target,
                    current
                },
                //other info
                datasetName:dataset?.name || "",
                statName:stat?.name || "",
                unit:stat?.unit || ""
            }
        })
    }

}