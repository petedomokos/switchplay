import * as d3 from 'd3';
import { addMonths } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { getKpis } from "../../data/kpis"
import { getTargets, findDefaultTarget } from "../../data/targets";
import { roundDown, roundUp, getRangeFormat, dateIsInRange, getValueForStat, getGreatestValueForStat } from "../../data/dataHelpers";
import { pcCompletion } from "../../util/NumberHelpers"
//import { } from '../constants';
import { getBandsAndStandards } from "../../data/bandsAndStandards";

let now;
let twentyYearsAgo;
export function hydrateJourneyData(data, user, datasets){
    now = new Date();
    twentyYearsAgo = addMonths(-240, now);
    // console.log("hydrateJourneyData", data)
    const currentProfile = { date:new Date(), id:"current", isCurrent:true };
    const player = user.player;
    return {
        //for now, asume all users are players
        player,
        //kpis not needed at journey level I dont think so have removed
        //kpis,
        //later do user.players.find if user is a coach, and also journey may be bout a coach or group
        ...data,
        contracts:hydrateContracts(data.contracts),
        profiles:[
            ...hydrateProfiles(data.profiles, player, datasets), 
            ...hydrateProfiles([currentProfile], player, datasets)
        ]
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


function hydrateProfiles(profiles=[], player, datasets){
    //console.log("hydrateProfiles!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!", profiles);
    //get kpis and default targets for player (later...or coach or team)
    const kpis = getKpis(player._id).map(kpi => {
        const { bands, standards } = getBandsAndStandards(kpi.datasetKey, kpi.statKey) || {};
        //console.log("bands standards", bands, standards);
        const min = bands[0] ? bands[0].min : null;
        const max = bands[0] ? bands[bands.length - 1].max : null;
        return { ...kpi, bands, standards, min, max }
    });
    //console.log("kpis", kpis)
    const defaultTargets = getTargets(player._id, player.groupId);

    const orderedProfiles = sortAscending(profiles, d => d.date);
    //console.log("orderedprofiles", orderedProfiles)

    const hydrateNextProfile = (remaining, hydratedSoFar) => {
        const next = remaining[0];
        //console.log("hydrateNextprofile....................", hydratedSoFar.length)
        //base case
        if(!next){ return hydratedSoFar; }
        //hydration
        const prevHydrated = hydratedSoFar.length !== 0 ? hydratedSoFar[hydratedSoFar.length - 1] : null;
        const nextHydrated = hydrateProfile(next, prevHydrated, datasets, kpis, defaultTargets);
        //recursive call
        return hydrateNextProfile(remaining.slice(1, remaining.length), [ ...hydratedSoFar, nextHydrated])
    }
    //init call
    return hydrateNextProfile(orderedProfiles, []);
}


function hydrateProfile(profile, prevProfile, datasets, kpis, defaultTargets){
    const { _id, id, date, targets=[], isCurrent } = profile;
    //console.log("hydrate Profile.......", profile)
    //why is startDate going back to 2022
    const milestoneId = _id || id;
    //startDate
    //either manual startDate if set, or prev date, or otherwise 20 years ago
    const startDate = profile.startDate || prevProfile?.date || twentyYearsAgo;
    const startsFromPrevProfile = !profile.startDate && prevProfile;
    const datePhase = isCurrent ? "current" : (date < now ? "past" : "future");
    const isPast = datePhase === "past";
    const isFuture = datePhase === "future";
    const isActive = isFuture && !prevProfile.isFuture;

    //RANGE
    //round both dates in range up, so any datapoint on teh day of a profile
    //will be counted in THAT profile, and NOT the next one.
    //note - we round date up,which goes to 00:00 of the next day, but because we check 
    //dateIsInRange with exclusiveEnd, a datapoint for next day 00:00 will not be counted
    const rangeFormat = getRangeFormat("day");
    const dateRange = [
        roundUp(startDate, "day", rangeFormat), 
        roundUp(date, "day", rangeFormat)
    ];

    return {
        ...profile,
        id:milestoneId,
        dataType:"profile",
        startDate,
        startsFromPrevProfile,
        dateRange,
        datePhase,
        isPast,
        isFuture,
        isActive,
        kpis:kpis.map((kpi,i) => {
            //KEYS/ID
            //console.log("hydrating kpi...",i, kpi)
            const { datasetKey, statKey, min, max } = kpi;
            //temp - for now give extra index so we can use same dataset more than once
            const kpiSetId = `${datasetKey}-${statKey}`;
            const key = `${kpiSetId}-${milestoneId}`;
            
            //VALUES
            //helper
            const getValue = getValueForStat(statKey);
            const dataset = datasets.find(dset => dset.key === datasetKey);
            const datapoints = dataset?.datapoints || [];
            //console.log("dataset", dataset)
            const stat = dataset?.stats.find(s => s.key === statKey);
            //console.log("stat", stat)
            const allActualDatapoints = datapoints
                .filter(d => !d.isTarget)
                //.need to just get the stat value for a sinbgle stat
                .map(d => ({ ...d, value:getValue(d) })); //nee to simply get the statValue

            const actualDatapointsInRange = allActualDatapoints.filter(d => dateIsInRange(d.date, dateRange))
            //console.log("actualDs", actualDatapointsInRange)
            //startvalues are only set if prevProfile isPast ie it has an achieved score
            //note - current profile is hydrated on its own so has no prevProfile
            const prevAchieved = prevProfile?.kpis.find(kpi => kpi.kpiSetId === kpiSetId)?.achieved;
            const start = {
                actual:prevAchieved?.actual || min,
                pc:prevAchieved?.pc || 0, //the min pc for all datasets is 0
                completion:0 //this always starts at 0 
            }
            const end = {
                actual:max,
                pc:100,
                completion:100
            }

            //the 'overall' scores include ds before the range
            const currentOverall = {
                //@todo - use min if order is 'lowest is best'
                actual:d3.max(allActualDatapoints, d => d.value),
                pc:"",
                completion:""
            }
            const achievedOverall = isPast ? currentOverall : null;
            //note - for current profile, the range is last twenty years so all will be included anyway
            //this is also true for 1st profile, unless user specifies a startDate
            const current = {
                //@todo - use min if order is 'lowest is best'
                actual:d3.max(actualDatapointsInRange, d => d.value),
                pc:"",
                //@todo - for completion, we need startvalues too from prevProfile
                completion:"",
            };
            const achieved = isPast ? current : null;
        
            const expected = null;//{
                //actual:"",
                //pc:"",
                //completion:""
            //};

            //filter targets to the range specified by the profile date(s)
            const profileTargets = targets.find(t => t.key === key) || [];
            const allTargetsInRange = profileTargets
                .filter(t => t.date <= date)
                .filter(t => t.date > startDate) || [];

            const approvedTargetsInRange = allTargetsInRange.filter(t => t.approved.length !== 0);
            const nonApprovedTargetsInRange = allTargetsInRange.filter(t => t.approved.length === 0);
            //get the latest, or default to the general targets on the kpi, if it exists
            const target = d3.greatest(approvedTargetsInRange, t => t.date) || findDefaultTarget(defaultTargets, datasetKey, statKey, date);
            const proposedTarget = d3.greatest(nonApprovedTargetsInRange, t => t.date)
            return {
                ...kpi,
                key,
                milestoneId,
                kpiSetId,
                //dates
                date,
                startDate,
                startsFromPrevProfile,
                dateRange,
                datePhase,
                isPast,
                isCurrent,
                isFuture,
                isActive,
                //values
                values:{
                    min, //just a value
                    max, //just a value
                    start,
                    end,
                    current,
                    achieved,
                    expected,
                    target,
                    proposedTarget,
                },
                //other info
                datasetName:dataset?.name || "",
                statName:stat?.name || "",
                unit:stat?.unit || ""
                
            }
        })
    }
}

/*
function hydrateProfiles(profiles=[], player){
    //console.log("hydrateProfiles", profiles);

    //get kpis and default targets for player (later...or coach or team)
    const kpis = getKpis(player._id);
    const defaultTargets = getTargets(player._id, player.groupId);

    const orderedProfiles = sortAscending(profiles, d => d.date);
    return orderedProfiles
        .map((p,i) => ({
            ...p, 
            //either manual startDate if set, or prev date, or otherwise 20 years ago
            startDate: p.startDate || (i === 0 ? addMonths(-240, p.date) : orderedProfiles[i-1].date),
            startsFromPrevProfile:p.startDate || i === 0 ? false : true
        }))
        .map(p => hydrateProfile(p, kpis, defaultTargets));
}

*/


/*
function hydrateProfile(p, kpis, defaultTargets){
    const { startDate, startsFromPrevProfile, date, targets=[] } = p;
    //console.log("hyd Prof", p)
    //why is startDate going back to 2022
    const milestoneId = p._id || p.id;
    return {
        ...p,
        id:milestoneId,
        dataType:"profile",
        kpis:kpis.map(kpi => {
            //console.log("hydrating kpi", kpi)
            const { datasetKey, statKey } = kpi;
            //temp - for now give extra index so we can use same dataset more than once
            const kpiSetId = `${datasetKey}-${statKey}`;
            const key = `${kpiSetId}-${milestoneId}`;
            //filter targets to the range specified by the profile date(s)
            const profileTargets = targets.find(t => t.key === key) || [];
            const allTargetsInRange = profileTargets
                .filter(t => t.date <= date)
                .filter(t => t.date > startDate) || [];

            const approvedTargetsInRange = allTargetsInRange.filter(t => t.approved.length !== 0);
            const nonApprovedTargetsInRange = allTargetsInRange.filter(t => t.approved.length === 0);
            //get the latest, or default to the general targets on the kpi, if it exists
            const target = d3.greatest(approvedTargetsInRange, t => t.date) || findDefaultTarget(defaultTargets, datasetKey, statKey, date);
            const proposedTarget = d3.greatest(nonApprovedTargetsInRange, t => t.date)
            return {
                ...kpi,
                key,
                milestoneId,
                kpiSetId,
                //kpiSet,
                isCurrent:milestoneId === "current",
                target,
                proposedTarget,
                startDate,
                startsFromPrevProfile,
                date,
            }
        })
    }
}
*/