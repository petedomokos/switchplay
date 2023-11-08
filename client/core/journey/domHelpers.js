import * as d3 from "d3";
import { TRANSITIONS } from "./constants";
import { getTransformationFromTrans } from './helpers';

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;

const classMatches = (selection, classNameToTest) => {
    const classStr = selection.attr("class");
    if(!classStr){ return false; }

    const classNames = classStr.split(" ");
    return !!classNames.find(c => c === classNameToTest)
}

const identifierMatches = (selection, identifier) => {
    return classMatches(selection, identifier) || selection.attr("id") === identifier;
}


/*
Note - this doesnt handle scales because if an element has a scale, then it is only applied to all elements from it onwards
so to handle scale, we need to make it more complex rather than just accumulating all values, we need a bracketed formula

*/
export function getPosition(initSelection, containerIdentifier=""){
    //console.log("getPosition.....", initSelection.node(), containerIdentifier)
    function next(selection, posSoFar={ x: 0, y: 0 }){
        //console.log("next...", posSoFar, selection.node())
        //base case
        //test if we have reached top element in dom or the required container
        if(selection.node().nodeName === "BODY" || identifierMatches(selection, containerIdentifier)){
            //console.log("base case reached...",posSoFar)
            return posSoFar;
        }
        //next case
        const { translateX, translateY, scaleX } = getTransformationFromTrans(selection.attr("transform"));
        //console.log("tx ty k", translateX, translateY, scaleX)
        const newPos =  { 
            x: posSoFar.x + translateX, 
            y: posSoFar.y + translateY,
        };
        //recursive call
        const nextSelection = d3.select(selection.node().parentNode);
        return next(nextSelection, newPos)
    }
    //init call
    return next(initSelection);
}

/*
function deletor(){
    const oscillator = Oscillator({k:1})
    function startDelete(selection){
        selection.each(function(){
            d3.select(this).select("rect.bg")
                //.style("filter", "url(#drop-shadow)")
                .call(oscillator.start);
        })
    }
}
export function startDeleteSelection(selection){
    selection.each(function(){
        d3.select(this).select("rect.bg")
            //.style("filter", "url(#drop-shadow)")
            .call(oscillator.start);
    })
    

}

export function deleteSelection(selection){

}

export function cancelDeleteSelection(selection){

}
*/

//@todo - move these out as also used by Menu
export function hide(selection, options={}){
    const { delay, duration=200, onEnd, finalOpacity, startOpacity } = options;
    selection.each(function(){
        const element = d3.select(this);
        //check if already hidden or being hidden
        if(element.attr("class").includes("hidden")){ return; }
        //set init opacity if not set
        if(!element.style("opacity")){ element.style("opacity", 1) }
        //store prev opacity/display, set class before transition to avoid duplicate transitions
        element
            .classed("hidden", true)
            .attr("data-shown-display", element.style("display"))
            .attr("data-shown-opacity", element.style("opacity"))

        element
            .transition()
            .duration(duration)
                .attr("opacity", 0)
                    .on("end", function(){ d3.select(this).style("display", "none"); })
    })
}

export function show(selection, options={}){
    const { delay, duration=200, onEnd, finalOpacity, startOpacity } = options;
    selection.each(function(){
        const element = d3.select(this);
        //check if already shown or being shown
        if(!element.attr("class").includes("hidden")){ return; }
        //remove class before transition to avoid duplicate transitions
        element.classed("hidden", false);
        //hide
        element
            .transition()
            .duration(duration)
                .attr("opacity", element.style("data-shown-opacity"))
                    .on("end", function(){
                        d3.select(this).style("display", element.attr("data-shown-display"));
                    })
    })

}

export function fadeInOut(selection, shouldDisplay, options={}){
    const { transitionIn, transitionOut, transition } = options;
    //console.log("fadeInOut trans", transition)
    selection.each(function(){
        if(shouldDisplay){
            //console.log("call fadeIn")
            const transitionToUse = transitionIn || transition;
            d3.select(this).call(fadeIn, { ...options, transition:transitionToUse });
        }else{
            //console.log("call fadeOut")
            const transitionToUse = transitionOut || transition;
            d3.select(this).call(fadeOut, { ...options, transition:transitionToUse });
        }
    })
}

export function fadeIn(selection, options={}){
    const { transition, cb=()=>{}, display=null, opacity=1 } = options;
    selection.each(function(){
        //will be multiple exits because of the delay in removing
        const sel = d3.select(this);
        const isFadingIn = sel.attr("class").includes("fading-in");
        const currOpacity = sel.attr("opacity") ? +sel.attr("opacity") : null;
        const currDisplay = sel.attr("display");
        const somethingMustChange = currOpacity !== opacity || currDisplay !== display;
        //console.log("fadeIn?", currOpacity, opacity, currOpacity !== opacity)

        if(!isFadingIn && somethingMustChange){
            //console.log("fadeIn this", this)
            //console.log("fadeIn trans", transition)
            d3.select(this)
                .attr("opacity", d3.select(this).attr("opacity") || 0)
                //adjust display if required or if new value passed in
                .attr("display", currDisplay !== display ? display : currDisplay)
                .classed("fading-in", true)
                .transition("fade-in")
                    .delay(transition?.delay || 0)
                    .duration(transition?.duration || CONTENT_FADE_DURATION)
                    .attr("opacity", opacity)
                    .on("end", function() { 
                        d3.select(this).classed("fading-in", false); 
                        cb.call(this);
                    });
        }
    })
}

export function fadeOut(selection, options={}){
    const { transition, cb=()=>{}, shouldRemove, display="none", opacity=0 } = options;
    selection.each(function(){
        //will be multiple exits because of the delay in removing
        const sel = d3.select(this);
        const isFadingOut = sel.attr("class").includes("fading-out");
        const currOpacity = sel.attr("opacity") ? +sel.attr("opacity") : null;
        const currDisplay = sel.attr("display");
        const somethingMustChange = currOpacity !== opacity || currDisplay !== display;
       
        if(!isFadingOut && somethingMustChange){
            d3.select(this)
                .attr("opacity", d3.select(this).attr("opacity") || 1)
                .classed("fading-out", true)
                .transition("fade-out")
                    .delay(transition?.delay || 0)
                    .duration(transition?.duration || CONTENT_FADE_DURATION)
                    .attr("opacity", opacity)
                    .on("end", function() { 
                        if(shouldRemove){ 
                            d3.select(this).remove(); 
                        }
                        else{
                            d3.select(this)
                                .attr("display", display)
                                .classed("fading-out", false); 
                        }
                        cb.call(this);
                    });
        }
    })
}

export function remove(selection, options={}){ 
    return fadeOut(selection, { ...options, shouldRemove:true })
}


export function updatePos(selection, pos={}, transition){
    const { x, y, x1, y1, x2, y2} = pos;
    selection.each(function(d){
        const element = d3.select(this);
        //on call from enter, there will be no translate so deltas are 0 so no transition
        //but then transform is called again on entered planets after merge with update
        const currX = element.attr("x");
        const currX1 = element.attr("x1");
        const currX2 = element.attr("x2");
        const currY = element.attr("y");
        const currY1 = element.attr("y1");
        const currY2 = element.attr("y2");

        //may not need the ?: as max filters out undefined
        const deltaX = currX && x ? Math.abs(+currX - x(d)) : 0;
        const deltaX1 = currX1 && x1 ? Math.abs(+currX1 - x1(d)) : 0;
        const deltaX2 = currX2 && x2 ? Math.abs(+currX2 - x2(d)) : 0;
        const deltaY = currY && y ? Math.abs(+currY - y(d)) : 0;
        const deltaY1 = currY1 && y1 ? Math.abs(+currY1 - y1(d)) : 0;
        const deltaY2 = currY2 && y2 ? Math.abs(+currY2 - y2(d)) : 0;

        const delta = d3.max([deltaX, deltaX1, deltaX2, deltaY, deltaY1, deltaY2]);

        //todo - use attrs instead to avoid repetition
        if(transition && delta > 0.1){
            element
                .transition()
                    .delay(transition.delay || 0)
                    .duration(transition.duration || 200)
                    .attr("x", x ? x(d) : (currX ? +currX : null))
                    .attr("x1", x1 ? x1(d) : (currX1 ? +currX1 : null))
                    .attr("x2", x2 ? x2(d) : (currX2 ? +currX2 : null))
                    .attr("y", y ? y(d) : (currY ? +currY : null))
                    .attr("y1", y1 ? y1(d) : (currY1 ? +currY1 : null))
                    .attr("y2", y2 ? y2(d) : (currY2 ? +currY2 : null));

        }else{
            element
                .attr("x", x ? x(d) : (currX ? +currX : null))
                .attr("x1", x1 ? x1(d) : (currX1 ? +currX1 : null))
                .attr("x2", x2 ? x2(d) : (currX2 ? +currX2 : null))
                .attr("y", y ? y(d) : (currY ? +currY : null))
                .attr("y1", y1 ? y1(d) : (currY1 ? +currY1 : null))
                .attr("y2", y2 ? y2(d) : (currY2 ? +currY2 : null));
        }
    })
}


// Provides a shake and a slight increase in size, with specifics such as scale (k), centre of enlargement
// and size of shake (dx) an duration passed in as options
export function Oscillator(options = {}) {
    let timer;
    let origTransforms = {};
    let selection;
    //let origTransformOrigin;
    const start = (_selection, dynamicOptions={}) => {
        if(selection) {
            //it has already started on a selection and not been stopped
            return;
        }
        //if(!selection){
        selection = _selection;
        //}
        const allOptions = { ...options, ...dynamicOptions };
        // translate dx, x, y,  scale k
        const { interval = 20, k = 1.05, dx = 5, centre, nrOscillations } = allOptions;
        //ensure even nr of osc so it ends up how it began
        const nrOscillationsEven = nrOscillations % 2 === 0 ? nrOscillations : nrOscillations + 1;
        let i = 0;
        timer = d3.interval(() => {
            // get any existing transform on the selection
            const currentTransformAttr = selection.attr("transform");
            const currentTransform = parseTransform(currentTransformAttr);
            const { translate, scale } = currentTransform;

            if(!origTransforms[i]){
                origTransforms[i] = currentTransformAttr;
            }
            // scale may be an array and in that case just use x compooinent for now. Also use + to coerce.
            const currentScale = typeof scale === "string" ? +scale : +scale[0];
            const newK = i % 2 ? currentScale * k : currentScale / k;

            // create a delta for horizontal oscillation based on count
            const newDx = i === 4 ? 0 : (i % 2 ? -dx / 2 : dx / 2);
            const newX = +translate[0] + newDx;
            const newY = +translate[1];
            selection.each(function () {
                d3.select(this)
                    .attr("transform", `translate(${newX},${newY}) scale(${newK})`)
                    .attr("transform-origin", centre ? `${centre[0]} ${centre[1]}` : null);
            });

            if (nrOscillations && i === nrOscillationsEven - 1) {
                timer.stop();
                selection = null;
            }

            i += 1;
        }, interval);
    }

    const stop = () => {
        if(timer){
            timer.stop();
            selection.each(function(d,i){
                d3.select(this).attr("transform", origTransforms[i])
            })
            //clean up
            selection = null;
            timer = null;
            origTransforms = {};
        }
    }

    return { start, stop }
}

// e can be a source event or a d3 drag event, and mouse or touch
export function getClientPoint(event) {
    // d3 drag events have the sourceEvent as a property
    const e = event.sourceEvent || event;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const y = e.touches ? e.touches[0].clientY : e.clientY;
    return { x, y };
}

// works with client positions only
// note - zoomTranslate is a 2D array, whereas from and to are objects
export function calcRequiredTranslate(from, to, zoomTranslate) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const [x, y] = zoomTranslate;
    return [x + dx, y + dy];
}

export const svgParent = (node = null) => {
    if (node === null) return undefined;
    return getParentByTagName(node, "svg");
};

export function getParentByTagName(node, tag) {
    const checkNext = (nextNode) => {
        const { parentNode } = nextNode;
        if (!parentNode) {
            return undefined;
        }
        if (parentNode.tagName === tag) {
            return parentNode;
        }
        return checkNext(parentNode);
    };
    return checkNext(node);
}

// todo - pass in options instead of sep args, and include a string for what to do on end: remove or displayNone
/*
export const hide = (selectionToHide, settings = {}) => {
    const { delay, duration, onEnd, finalOpacity, startOpacity } = settings;

    selectionToHide
        .attr("opacity", startOpacity || 1)
        .transition()
        .delay(typeof delay === "number" ? delay : 50)
        .duration(typeof duration === "number" ? duration : 200)
        .attr("opacity", finalOpacity || 0)
        .on("end", function () {
            if (finalOpacity && finalOpacity !== 0) { return; }
            if (onEnd && onEnd === "remove") {
                d3.select(this).remove();
            } else {
                d3.select(this).attr("display", "none");
            }
        });
};

export const show = (selectionToShow, delay = 300, duration = 800, name = "transition") => {
    selectionToShow
        .attr("display", "inline")
        .transition(name)
        .delay(delay)
        .duration(duration)
        .attr("opacity", 1);
};
*/

export function parseTransform(a) {
    // return the identity values if no translate defined
    if (a === null || !a) return { translate: ["0", "0"], scale: "1" };
    const b = {};
    /* eslint-disable */
    for (const i in a = a.match(/(\w+)\(([^,)]+),?([^)]+)?\)/gi)) {
        const c = a[i].match(/[\w\.\-]+/g);
        b[c.shift()] = c;
    }
    /* eslint-enable */
    // return the identity values if either translate or scale not defined
    return { translate: ["0", "0"], scale: "1", ...b };
}

export function shiftTranslate(xShift, yShift, currentTranslate) {
    const newCoods = currentTranslate
        .slice(10, currentTranslate.length - 1)
        .split(",")
        .map((str, i) => Number(str) + (i === 0 ? xShift : yShift))
        .join(",");

    return `translate(${newCoods})`;
}

/**
 * Calculates velocity v, w.r.t. displacement (s) and time (t)
 *
 * @param {array} vectors   array of objects of the form { dx, dy }
 * @param {array} times     array of end times for each vector in ms, each corresponding to the vector at the same position
 * @param {object} options  optoins are as follows:
 *                          n -  the number of vectors to use, starting with most recent
 *                          defaultToClosest - if n is specified and n vectors are not available, then use as many as possible
 * */
// @todo - need to first pick out the first time and discard the first vector
// so we can use the first time for the start time accurately
export function calculateMeanVelocity(vectors, times, options) {
    const { n, defaultToClosest = false } = options;
    if (n && (vectors.length < n || times.length < n) && !defaultToClosest) {
        return undefined;
    }
    if (vectors.length !== times.length) {
        // @todo - trim to shortest option
        return undefined;
    }

    const sliceTo = n || vectors.length;
    // calc velocity v, w.r.t. displacement (s) and time (t)
    const vectorsToUse = [...vectors].reverse().slice(0, sliceTo); // this way handles it when n < 5
    const timesToUse = [...times].reverse().slice(0, sliceTo);
    const dx = vectorsToUse.reduce((acc, next) => acc + next.dx, 0);
    const dy = vectorsToUse.reduce((acc, next) => acc + next.dy, 0);
    const ds = Math.sqrt(dx ** 2 + dy ** 2);
    // max will be the final end time, min will be an approximation of the start time (should be previous vector time for accurate dt)
    const dt = d3.max(timesToUse) - d3.min(timesToUse);
    if (dt === 0) {
        return undefined;
    }
    return ds / dt;

}

export function openFullscreen(elem) {
    //console.log("openFullScreen")
    if (document.webkitFullscreenElement) {
      document.webkitCancelFullScreen();
    } else {
      const el = document.documentElement;
      el.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
    if (elem.requestFullscreen) {
      //console.log("req full screen")
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { // Safari
      //console.log("safari req full screen")
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { // IE11
      //console.log("IE11 req full screen")
      elem.msRequestFullscreen();
    } else {
      //console.log("no req full screen")
    }
  }