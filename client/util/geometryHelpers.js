export function maxDimns(maxWidth, maxHeight, aspectRatio){
    const potentialWidth = maxHeight * aspectRatio;
    if(potentialWidth <= maxWidth){
        return { width: potentialWidth, height: maxHeight }
    }
    return { width: maxWidth, height: maxWidth/aspectRatio }
}