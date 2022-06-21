import * as d3 from "d3";
import { distanceBetweenPoints } from "./geometryHelpers.js";
import { getClientPoint } from "./domHelpers.js";
// todo - look into whetehr its possible to enhance d3.drag itself rather than have to enhance each drag handler
export default function dragEnhancements() {
    // consts
    const LONGPRESS_TIME_THRESHOLD = 500;

    // settings
    let dragThreshold = 10;
    let isDragEnabled = true;
    let withLongpress = false;
    let withClick = false;
    let longpressSettings = {};
    let alwaysCallDrag = true;

    // handlers api
    let beforeAll = function () {};
    let onLongpressStart;
    let onLongpressDragged;
    let onLongpressEnd;
    let onClick = function () {};

    // local state
    // isLongpress will only be set to true if at least one longoress handler is set, and the threshold is met
    let isLongpress = false;
    // isClick will only be set to true if onClick has been defined
    let isClick = false;
    let isMultitouch = false;
    // helper variables
    let startPoint;
    let wasMoved = false;
    let longpressTimer;
    let originalCursor;

    let startCallback;
    function withEnhancements(cb = () => { }) {
        return function (e, d) {
            beforeAll.call(this, e, d);
            //programmatic zoom has no src ev
            if(!e.sourceEvent || e.sourceEvent.type === "wheel"){
                cb.call(this, e, d);
                return;
            }
            if (!isDragEnabled) { return; }
            switch (e.type) {
                case "start": {
                    if (isMultitouch) { break; }
                    // set up for drag threshold test
                    startPoint = getClientPoint(e);
                    // set up longpress test
                    if (withLongpress) {
                        setLongpressTimer.call(this, e, d);
                    }
                    startCallback = () => cb.call(this, e, d);
                    //cb.call(this, e, d);
                    break;
                }
                case "drag":
                case "zoom": {
                    if (isMultitouch) {
                        break;
                    }
                    if (e.sourceEvent.touches?.length > 1) {
                        isMultitouch = true;
                        break;
                    }

                    const minDistance = withClick ? dragThreshold : 0;
                    // CHECK ITS REACHED THE DRAG THRESHOLD
                    const currentPoint = getClientPoint(e);
                    if(!startPoint) { startPoint = currentPoint; }
                    const distanceDragged = distanceBetweenPoints(startPoint, currentPoint);
                    //console.log("distanceDragged", distanceDragged)
                    if (distanceDragged < minDistance) {
                        break;
                    }
                    //console.log("was moved")
                    wasMoved = true;
                    if(!isLongpress && startCallback){
                        startCallback();
                        startCallback = undefined;
                    }

                    // if moved before longpress set to true, need to stop the timer
                    if (longpressTimer) {
                        longpressTimer.stop();
                        longpressTimer = undefined;
                    }
                    if (isLongpress) {
                        if(onLongpressDragged){
                            onLongpressDragged.call(this, e, d);
                        }
                        if (!alwaysCallDrag) { break; }
                    }
                    if(!isLongpress){
                        cb.call(this, e, d);
                    }
                    break;
                }
                case "end": {
                    const reset = () => {
                        // internal clean up
                        if (longpressTimer) { clearLongpressTimer(); }
                        resetFlags();
                    }
                    // click flag
                    isClick = withClick && !wasMoved && !isLongpress && !isMultitouch;

                    if (isLongpress && onLongpressEnd) {
                        onLongpressEnd.call(this, e, d);
                        reset();
                        break;
                    }
                    if (isClick) { 
                        onClick.call(this, e, d);
                        reset();
                        break; 
                    }

                    cb.call(this, e, d);
                    reset();
                    break;
                }
                default: { break; }
            }
        };
    }

    function updateLongpress(settings = {}) {
        withLongpress = onLongpressStart || onLongpressDragged || onLongpressEnd;
        longpressSettings = { ...longpressSettings, ...settings };
    }

    function setLongpressTimer(e, d) {
        longpressTimer = d3.timeout(() => {
            if (isMultitouch) { return; }
            isLongpress = true;
            if (longpressSettings.cursor) {
                originalCursor = d3.select(this).style("cursor");
                // @todo - why is this not working, and even if its in gestures handlers its temperamental
                d3.select(this).style("cursor", longpressSettings.cursor);
            }
            if(onLongpressStart){
                onLongpressStart.call(this, e, d);
            }
            longpressTimer = undefined;
        }, LONGPRESS_TIME_THRESHOLD);
    }

    function clearLongpressTimer() {
        longpressTimer.stop();
        longpressTimer = undefined;
        if (longpressSettings.cursor) {
            d3.select(this).style("cursor", originalCursor);
            originalCursor = undefined;
        }
    }

    function resetFlags() {
        isClick = false;
        isLongpress = false;
        isMultitouch = false;
        wasMoved = false;
    }

    // api
    withEnhancements.dragThreshold = function (value) {
        if (!arguments.length) { return dragThreshold; }
        dragThreshold = value;
        return withEnhancements;
    };
    withEnhancements.isDragEnabled = function (value) {
        if (!arguments.length) { return isDragEnabled; }
        isDragEnabled = value;
        return withEnhancements;
    };
    withEnhancements.alwaysCallDrag = function (value) {
        if (!arguments.length) { return alwaysCallDrag; }
        alwaysCallDrag = value;
        return withEnhancements;
    };
    withEnhancements.beforeAll = function (func) {
        if (!arguments.length) { return beforeAll; }
        beforeAll = func;
        return withEnhancements;
    };
    withEnhancements.onLongpressStart = function (func, settings) {
        if (!arguments.length) {
            return onLongpressStart;
        }
        onLongpressStart = func;
        updateLongpress(settings);
        return withEnhancements;
    };
    withEnhancements.onLongpressDragged = function (func, settings) {
        if (!arguments.length) { return onLongpressDragged; }
        onLongpressDragged = func;
        updateLongpress(settings);
        return withEnhancements;
    };
    withEnhancements.onLongpressEnd = function (func, settings) {
        if (!arguments.length) { return onLongpressEnd; }
        onLongpressEnd = func;
        updateLongpress(settings);
        return withEnhancements;
    };
    withEnhancements.onClick = function (func) {
        if (!arguments.length) { return onClick; }
        onClick = func;
        withClick = true;
        return withEnhancements;
    };
    withEnhancements.isMultitouch = function (value) {
        if (!arguments.length) { return isMultitouch; }
        isMultitouch = value;
        return withEnhancements;
    };
    // exposed state
    withEnhancements.isClick = function () { return isClick; };
    withEnhancements.isLongpress = function () { return isLongpress; };
    withEnhancements.wasMoved = function () { return wasMoved; }

    return withEnhancements;
}