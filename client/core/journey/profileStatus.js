export function getProfileStatusInfo(p, options={}){
    const { onlyIncludeKpisWithTargets } = options;
    //@todo - calculated profilestatus based on all the data for expected versus current for each kpi so its more accurate
    //for now, its based on the kpi statuses rather than the underlying values
    //stats
    const getKpisWithGivenStatus = (kpis, options={}) => {
        //note - the onlyInclude option takes kpis out that would otherwise reduce the pcOnTrack
        //if we include "noTarget" in statuses, then that will increase the pcOnTrack which is also not wanted
        const { getStatus=kpi => kpi.status, onlyIncludeKpisWithTargets=true, statusesToInclude=[] } = options;

        const kpisToInclude = onlyIncludeKpisWithTargets ? kpis.filter(kpi => getStatus(kpi) !== "noTarget") : kpis; 
        const kpisWithStatus = kpisToInclude.filter(kpi => statusesToInclude.includes(getStatus(kpi)));
        const pc = kpisToInclude === 0 ? 0 : Math.round((kpisWithStatus.length /kpisToInclude.length) * 100)
        return { 
            kpis:kpisWithStatus.map(kpi => kpi.key),
            kpisIncluded:kpisToInclude.map(kpi => kpi.key),  
            pc, 
            amount:kpisWithStatus.length, 
            amountIncluded:kpisToInclude.length 
        }
    }

    //defence kpis offTrack
    const defenceStats = p.kpis.filter(kpi => kpi.orientationFocus === "defence");
    const defenceStatsOffTrack = getKpisWithGivenStatus(defenceStats, { 
        getStatus:kpi => kpi.statProgressStatus, 
        statusesToInclude:["offTrack"]
    });

    const attackStats = p.kpis.filter(kpi => kpi.orientationFocus === "attack");
    const nrAttackStatsWithTargets = attackStats.filter(kpi => kpi.statProgressStatus !== "noTarget").length

    //next = move this out form here, and then check it works properly
    //5 levels - no shine, small silver, med silver, med gold, large gold
    //Achieved
    const achievedStatuses = ["achieved"];
    const statsAchieved = getKpisWithGivenStatus(p.kpis, { 
        getStatus:kpi => kpi.statProgressStatus, 
        onlyIncludeKpisWithTargets, 
        statusesToInclude:achievedStatuses
    });
    const stepsAchieved = getKpisWithGivenStatus(p.kpis, { 
        getStatus:kpi => kpi.stepsProgressStatus, 
        onlyIncludeKpisWithTargets, 
        statusesToInclude:achievedStatuses
    });
    const totalValuesIncludedForAchieved = statsAchieved.amountIncluded + stepsAchieved.amountIncluded;
    const totalAchieved = statsAchieved.amount + stepsAchieved.amount;
    const totalPCAchieved = totalValuesIncludedForAchieved === 0 ? 0 : Math.round((totalAchieved/totalValuesIncludedForAchieved) * 100);

    //On track
    const onTrackStatuses = ["achieved", "onTrack"];
    const statsOnTrack = getKpisWithGivenStatus(p.kpis, { 
        getStatus:kpi => kpi.statProgressStatus, 
        onlyIncludeKpisWithTargets, 
        statusesToInclude:onTrackStatuses 
    });
    const stepsOnTrack = getKpisWithGivenStatus(p.kpis, { 
        getStatus:kpi => kpi.stepsProgressStatus, 
        onlyIncludeKpisWithTargets, 
        statusesToInclude:onTrackStatuses 
    });
    const totalValuesIncludedForOnTrack = statsOnTrack.amountIncluded + stepsOnTrack.amountIncluded;
    const totalOnTrack = statsOnTrack.amount + stepsOnTrack.amount;
    const totalPCOnTrack = totalValuesIncludedForOnTrack === 0 ? 0 : Math.round((totalOnTrack/totalValuesIncludedForOnTrack) * 100);

    let profileProgressStatus;
    //if even 1 defence kpi is off track, then entire card is severely off track
    if(defenceStatsOffTrack.amount !== 0){ profileProgressStatus = "severelyOffTrack" }
    else if(totalPCAchieved === 100){ profileProgressStatus = "fullyAchieved"; }
    else if(totalPCOnTrack === 100){ profileProgressStatus = "fullyOnTrack"; }
    else if(totalPCOnTrack >= 75) { profileProgressStatus = "mostlyOnTrack"; }
    else if(totalPCOnTrack >= 50) { profileProgressStatus = "partlyOnTrack"; }
    else if(totalPCOnTrack <= 20) { profileProgressStatus = "severelyOffTrack"; }
    else profileProgressStatus = "offTrack"; //this includes when there are no targets at all

    //5,4,2,6,1
    /*const fake = {
        "profile-5":"partlyOnTrack",
        "profile-4":"mostlyOnTrack",
        "profile-2":"fullyOnTrack",
        "profile-6":"fullyAchieved"
    }*/

    return {
        //@todo - later - make a visual to show which kpis involved etc - for that we will uncomment these
        //stepsAchieved,
        //statsAchieved,
        //stepsOnTrack,
        //statsOnTrack,
        nrAttackStats:attackStats.length,
        nrAttackStatsWithTargets,
        totalValuesIncludedForAchieved,
        totalAchieved,
        totalPCAchieved,
        totalValuesIncludedForOnTrack,
        totalOnTrack,
        totalPCOnTrack,
        defenceStatsOffTrack:defenceStatsOffTrack,
        status:/*fake[p.id] ||*/ profileProgressStatus
    }
}