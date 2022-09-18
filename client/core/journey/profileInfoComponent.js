import * as d3 from 'd3';
import { DIMNS } from "./constants";
import dragEnhancements from './enhancedDragHandler';

/*

*/
export default function profileInfoComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;

    let fontSizes = {
        name:9
    };

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let enhancedDrag = dragEnhancements();

    //dom
    let containerG;

    function profileInfo(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            console.log("sel profileInfo update", data)
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick);

            const drag = d3.drag()
                .on("start", enhancedDrag())
                .on("drag", enhancedDrag())
                .on("end", enhancedDrag());


            // todo - append photo, name, age, pos
            //note - need a quick way of getting a photo for each player

        })

        return selection;
    }
    
    //api
    profileInfo.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return profileInfo;
    };
    profileInfo.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return profileInfo;
    };
    profileInfo.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileInfo;
    };
    profileInfo.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return profileInfo;
    };
    profileInfo.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return profileInfo;
    };
    profileInfo.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return profileInfo;
    };
    profileInfo.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return profileInfo;
    };
    return profileInfo;
}
