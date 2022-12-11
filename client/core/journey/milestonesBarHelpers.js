export const calculateOffsetForCardsBeforePlaceholder = (placeholderDimns, hitSpace) => (prev, next) => {
    const neighbourPhases = { prev: prev?.datePhase, next: next?.datePhase };
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "current"){
        return -placeholderDimns.width/2 - hitSpace/2;
    }
    if(neighbourPhases.prev === "current" && neighbourPhases.next === "future"){
        return -placeholderDimns.width/2 - hitSpace/2// - phaseGap/2; //we are subtracting too much
    }
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "past"){
        return -placeholderDimns.width/2 - hitSpace/2;
    }
    if(neighbourPhases.prev === "future" && neighbourPhases.next === "future"){
        //minus half the new hitspace plus all of the previous hitspace
        return -placeholderDimns.width/2 - hitSpace/2 + hitSpace;
    }
    return 0;
}

export const calculateOffsetForCardsAfterPlaceholder = (placeholderDimns, hitSpace, phaseGap) => (prev, next) => {
    const neighbourPhases = { prev: prev?.datePhase, next: next?.datePhase };
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "current"){
        return placeholderDimns.width/2 + hitSpace/2 + phaseGap/2;
    }
    if(neighbourPhases.prev === "current" && neighbourPhases.next === "future"){
        return placeholderDimns.width/2 + hitSpace/2;// + phaseGap/2;
    }
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "past"){
        return placeholderDimns.width/2 + hitSpace/2;
    }
    if(neighbourPhases.prev === "future" && neighbourPhases.next === "future"){
         //add half the new hitspace plus all of the previous hitspace
        return placeholderDimns.width/2 + hitSpace/2 + hitSpace;
    }
    return 0;
}

export const calculatePlaceholderX = (placeholderDimns, hitSpace, phaseGap) => (prev, next) => {
    const neighbourPhases = { prev: prev?.datePhase, next: next?.datePhase };
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "current"){
        return next.x - next.width/2 - hitSpace/2 - phaseGap - placeholderDimns.width/2;
    }
    if(neighbourPhases.prev === "current" && neighbourPhases.next === "future"){
        return next.x - next.width/2 - hitSpace/2 - placeholderDimns.width/2 + phaseGap/2;
    }
    if(neighbourPhases.prev === "past" && neighbourPhases.next === "past"){
        return next.x - next.width/2 - hitSpace/2 - placeholderDimns.width/2;
    }
    if(neighbourPhases.prev === "future" && neighbourPhases.next === "future"){
        return next.x - next.width/2 + hitSpace/2 - placeholderDimns.width/2;
    }
    return 0;

}

//this function is just for purposes of setting requiredSliderPos
//the actual nrs are added to the milestones in layout
export function calcNewMilestoneNr(prev, next){
    if(prev){
        if(prev.isPast){ return prev.nr };
        if(prev.isFuture){ return prev.nr + 1; }
        //prev must be current so new is first future
        return 1;
    }else{
        //if no prev, then next must be either past or current
        return next.nr - 1;
    }
}