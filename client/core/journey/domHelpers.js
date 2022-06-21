import * as d3 from "d3";

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

export function oscillate(selection, options = {}) {
    const { interval = 20 } = options;
    let i = 0;
    const timer = d3.interval(() => {
        // create a delta for horizontal oscillation based on count
        const dx = i % 2 ? -2.5 : 2.5;
        selection.each(function (d) {
            d3.select(this).attr("transform", `translate(${d.x + dx},${d.y}) scale(1.1)`);
        });

        if (i === 4) {
            timer.stop();
        }

        i += 1;
    }, interval);
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