import * as d3 from 'd3';

export function hydrateJourneyData(data, userKpis, datasets){
    return {
        ...data,
        profiles:hydrateProfiles(data.profiles, userKpis, datasets)
    }
}
function hydrateProfiles(profiles, userKpis, datasets){
    return profiles.map(p => {
        const milestoneId = p._id || p.id;
        return {
            ...p,
            id:milestoneId,
            kpis:userKpis.map(kpi => {
                const kpiSetId = `dset-${kpi.datasetId}-stat-${kpi.statId}`;
                return {
                    ...kpi,
                    id:`milestone-${milestoneId}-${kpiSetId}`,
                    milestoneId,
                    kpiSetId
                }
            })
        }
    })
  
  }