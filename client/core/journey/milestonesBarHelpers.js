export const calculateOffsetForCardsBeforePlaceholder = (placeholderWidth, hitSpace) => (prev, next) => {
    //between past & current
    if(prev?.isPast && next?.isCurrent){
        return -placeholderWidth/2 - hitSpace/2;
    }
    //between current and future
    if(prev?.isCurrent && next?.isFuture){
        return -placeholderWidth/2 - hitSpace/2// - phaseGap/2; //we are subtracting too much
    }
    //between past and past
    if(prev?.isPast && next?.isPast){
        return -placeholderWidth/2 - hitSpace/2;
    }
    //between future and future
    if(prev?.isFuture && next?.isFuture){
        //minus half the new hitspace plus all of the previous hitspace
        return -placeholderWidth/2 - hitSpace/2 + hitSpace;
    }
    //2 cases for adding card at the start
    if(!prev && next?.isCurrent){
        return 0;
    }
    if(!prev && next?.isPast){
        return 0;
    }
    //2 cases for adding card at the end
    if(prev?.isCurrent && !next){
        return 0;
    }
    if(prev?.isFuture && !next){
        return 0;
    }
    return 0;
}

export const calculateOffsetForCardsAfterPlaceholder = (placeholderWidth, hitSpace, phaseGap) => (prev, next) => {
    //between past & current
    if(prev?.isPast && next?.isCurrent){
        return placeholderWidth/2 + hitSpace/2 + phaseGap/2;
    }
    //between current and future
    if(prev?.isCurrent && next?.isFuture){
        return placeholderWidth/2 + hitSpace/2;// + phaseGap/2;
    }
    //between past and past
    if(prev?.isPast && next?.isPast){
        return placeholderWidth/2 + hitSpace/2;
    }
    //between future and future
    if(prev?.isFuture && next?.isFuture){
         //add half the new hitspace plus all of the previous hitspace
        return placeholderWidth/2 + hitSpace/2 + hitSpace;
    }
    //2 cases for adding card at the start
    if(!prev && next?.isCurrent){
        return 0;
    }
    if(!prev && next?.isPast){
        return 0;
    }
    //2 cases for adding card at the end
    if(prev?.isCurrent && !next){
        return 0;
    }
    if(prev?.isFuture && !next){
        return 0;
    }
    return 0;
}

//position it in centre of card, same as milestones
export const calculatePlaceholderX = (placeholderWidth, hitSpace, phaseGap) => (prev, next) => {
    //between past & current
    if(prev?.isPast && next?.isCurrent){
        return next.x - next.width/2 - hitSpace/2 - phaseGap;
    }
    //between current and future
    if(prev?.isCurrent && next?.isFuture){
        return next.x - next.width/2 - hitSpace/2 + phaseGap/2;
    }
    //between past and past
    if(prev?.isPast && next?.isPast){
        return next.x - next.width/2 - hitSpace/2;
    }
    //between future and future
    if(prev?.isFuture && next?.isFuture){
        return next.x - next.width/2 + hitSpace/2;
    }
    //2 cases for adding card at the start
    if(!prev && next?.isCurrent){
        return next.x - next.width/2 - phaseGap - hitSpace - placeholderWidth/2;
    }
    if(!prev && next?.isPast){
        return next.x - next.width/2 - hitSpace - placeholderWidth/2;
    }
    //2 cases for adding card at the end
    if(prev?.isCurrent && !next){
        return prev.x + prev.width/2 + phaseGap + hitSpace + placeholderWidth/2;
    }
    if(prev?.isFuture && !next){
        return prev.x + prev.width/2 + hitSpace + placeholderWidth/2;
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