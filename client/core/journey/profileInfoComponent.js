import * as d3 from 'd3';
import { DIMNS } from "./constants";
import dragEnhancements from './enhancedDragHandler';

/*

*/
export default function profileInfoComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height / 2;
    let photoHeight;
    let textInfoHeight;

    function updateDimns(){
        photoHeight = height * 0.8;
        textInfoHeight = height * 0.2;
    }

    let fontSizes = {
        name:9,
        age:11,
        position:8,
        date:9
    };

    let editable;

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};

    let enhancedDrag = dragEnhancements();

    //dom
    let containerG;

    function profileInfo(selection, options={}) {
        //console.log("profileinfo", height)
        updateDimns();
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            //console.log("profileInfo data", data)
            const { firstname, surname, age, position, photos } = data;
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
            //helper
            const photoUrl = d => `/players/${firstname}_${surname}/${d.label}.png`;
            const photosG = containerG.selectAll("g.photos").data(photos, d => d.label);
            photosG.enter()
                .append("g")
                    .attr("class", "photos")
                    .each(function(d){
                        d3.select(this)
                            .insert("image","text")
                            .attr("xlink:href", photoUrl(d))
                    })
                    .merge(photosG)
                    .each(function(d){
                        d3.select(this).select("image")  
                            .attr("width", width)
                            //.attr("height", photoHeight)

                    })

            const format = d3.timeFormat("%_d %b, %y");

            containerG.selectAll("text.date").data([data.date])
                .join("text")
                    .attr("class", "date")
                    .attr("transform", "rotate(-45)")
                    .attr("x", - width * 0.1)
                    .attr("y", height * 0.19)
                    .attr("dominant-baseline", "hanging")
                    .attr("fill", d => d <= new Date() ? "white" : "grey")
                    .attr("font-size", fontSizes.date)
                    .text(d => format(d))

            const textInfoG = containerG.selectAll("g.text-info").data([data]);
            textInfoG.enter()
                .append("g")
                    .attr("class", "text-info")
                    .each(function(d){
    
                        const textInfoG = d3.select(this);

                        textInfoG.append("rect")
                            .attr("class", "bg")
                            .attr("fill", "black");

                        //NAME
                        const nameG = textInfoG.append("g").attr("class", "name");
                        nameG.append("text").attr("class", "first-name")
                        nameG.append("text").attr("class", "surname");

                        nameG.selectAll("text")
                            .attr("dominant-baseline", "central")
                            .attr("stroke", "white")
                            .attr("stroke-width", 0.5)
                            .attr("fill", "white");

                        //OTHER TEXT: AGE AND POSITION
                        const otherTextInfoG = textInfoG.append("g").attr("class", "other-text-info");
                        otherTextInfoG.append("text").attr("class", "age")
                            .attr("font-size", fontSizes.age);

                        otherTextInfoG.append("text").attr("class", "position")
                            .attr("font-size", fontSizes.position);

                        otherTextInfoG.selectAll("text")
                            .attr("dominant-baseline", "central")
                            .attr("text-anchor", "middle")
                            .attr("stroke", "white")
                            .attr("stroke-width", 0.5)
                            .attr("fill", "white");
                        


                        textInfoG.append("line").attr("class", "divider")
                            .attr("stroke", "white");

                    })
                    .merge(textInfoG)
                    .attr("transform", `translate(0, ${photoHeight})`)
                    .each(function(d){
        
                        const textMargin = { left: width * 0.1, right: width * 0.1 };

                        const textInfoG = d3.select(this);
                        textInfoG.select("rect.bg")
                            .attr("width", width)
                            .attr("height", textInfoHeight);

                        const nameG = textInfoG.select("g.name")
                            .attr("transform", `translate(${textMargin.left},0)`) //move to middle of name area
                        
                        nameG.select("text.first-name")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.33})`)
                            .text(d.firstname?.toUpperCase() || "FIRST NAME");
                        
                        nameG.select("text.surname")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.67})`)
                            .text(d.surname?.toUpperCase() || "SURNAME");
                        
                        nameG.selectAll("text")
                            .attr("font-size", fontSizes.name);
                        
                        //OTHER: AGE, POSITION
                        const otherTextInfoG = textInfoG.select("g.other-text-info")
                            .attr("transform", "translate("+width * 0.75 +",0)");
                            

                        otherTextInfoG.select("text.age")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.33})`)
                            .attr("font-size", fontSizes.age)
                            .text("23");

                        otherTextInfoG.select("text.position")
                            .attr("transform", `translate(0, ${textInfoHeight * 0.67})`)
                            .attr("font-size", fontSizes.position)
                            .text("midfield");;

                        textInfoG.select("line.divider")
                            .attr("transform", `translate(${width/2},0)`)
                            .attr("y2", textInfoHeight);

                    })

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
    profileInfo.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
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
