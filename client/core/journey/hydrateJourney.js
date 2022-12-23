import * as d3 from 'd3';
import { addMonths } from '../../util/TimeHelpers';
import { sortAscending } from '../../util/ArrayHelpers';
import { getKpis } from "../../data/kpis"
import { getTargets, findDefaultTarget } from "../../data/targets";

export function hydrateJourneyData(data, user){
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
        profiles:hydrateProfiles([...data.profiles, currentProfile], player)
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
            startDate: p.startDate || (i === 0 ? addMonths(-240, p.date) : orderedProfiles[i-1].date)
        }))
        .map(p => hydrateProfile(p, kpis, defaultTargets));
}

function hydrateProfile(p, kpis, defaultTargets){
    const { startDate, date, targets=[] } = p;
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
                date,
            }
        })
    }
}