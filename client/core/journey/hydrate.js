import * as d3 from 'd3';

export function hydrateJourneyData(data, userKpis=[]){
    return {
        ...data,
        contracts:hydrateContracts(data.contracts),
        profiles:hydrateProfiles(data.profiles, userKpis)
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

function hydrateProfiles(profiles=[], userKpis){
    return profiles.map(p => hydrateProfile(p, userKpis));
}

function hydrateProfile(p, userKpis){
    const milestoneId = p._id || p.id;
    return {
        ...p,
        id:milestoneId,
        dataType:"profile",
        kpis:userKpis.map((kpi,i) => {
            //temp - for now give extra index so we can use same dataset more than once
            const kpiSet = `dset-${kpi.datasetId}-stat-${kpi.statId}`;
            const kpiSetId = `${kpiSet}-${i}`;
            return {
                ...kpi,
                id:`milestone-${milestoneId}-${kpiSetId}`,
                milestoneId,
                kpiSetId,
                kpiSet,
                isCurrent:milestoneId === "current"
            }
        })
    }
}

export function createCurrentProfile(userKpis){
    return hydrateProfile({ date:new Date(), id:"current", isCurrent:true }, userKpis);
}