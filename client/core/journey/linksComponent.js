import * as d3 from 'd3';
//import "d3-selection-multi";
import { grey10 } from "./constants";
import { distanceBetweenPoints } from './geometryHelpers';
import { updatePos } from "./domHelpers"
import menuComponent from './menuComponent';
//import openedLinkComponent from './openedLinkComponent';
/*

*/
export default function linksComponent() {

    let selectedMeasure;
    let timeScale = x => 0;
    let yScale = x => 0;
    let strokeWidth = 1;

    let linksData = [];
    let withCompletion = true;

    //functions
    let deleteLink = function (){}
    let onClick = function (){}

    //components
    //@todo make an openedContent component
    let barCharts = {};
    let tooltips = {};
    //let openedLink = {};
    let menus = {};
    let menuOptions = [
        { key: "delete", label:"Delete" }
    ];
    let hovered;

    function links(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true } = options;
        selection.each(function (data) {
            //console.log("links comp", transitionUpdate)
            if(data){ linksData = data;}
           
            const linkG = d3.select(this).selectAll("g.link").data(linksData, l => l.id);
            linkG.enter()
                .append("g")
                    .attr("class", "link")
                    .attr("id", d => "link-"+d.id)
                    .attr("opacity", 1)
                    .each(function(d,i){
                        const linkG = d3.select(this);
                        //ENTER
                        //line
                        linkG
                            .append("line")
                                .attr("class", "main")
                                .attr("stroke", grey10(5))
                                .attr("cursor", "pointer")
                                //there are no cases where we want an entering link to transition in from actualX1 or actualX2
                                .call(updatePos, { 
                                    x1: () => d.src.x,
                                    y1: ()=> d.src.y,
                                    x2: () => d.targ.x,
                                    y2: () => d.targ.y
                                })
                                //.attr("x1", d.src.x)
                                //.attr("y1", d.src.y)
                                //.attr("x2", d.targ.x)
                                //.attr("y2", d.targ.y)
                        
                        //completion line
                        linkG
                            .append("line")
                                .attr("class", "completion")
                                .attr("display", withCompletion ? "inline" : "none")
                                .attr("stroke", "blue")
                                .attr("cursor", "pointer")
                                .attr("x1", d.src.x)
                                .attr("y1", d.src.y)
                                .attr("x2", d.compX)
                                .attr("y2", d.compY)

                        
                        //hitbox
                        linkG
                            .append("rect")
                            .attr("class", "hitbox")
                            .attr("stroke", "transparent")
                            .attr("fill", "transparent")
                            .style("cursor", "pointer")

                        //opened content
                        //const openedContentG = linkG.append("g").attr("class", "opened-content");
                        //bar
                        /*
                        openedContentG
                            .append("g")
                                .attr("class", "bar-chart")
                                .attr("opacity", 0)
                                .attr("display", "none");
                        
                        //tooltip
                        openedContentG
                            .append("g")
                                .attr("class", "tooltip");
                            

                        //bar chart component
                        barCharts[d.id] = barChart();
                        tooltips[d.id] = tooltipComponent();
                        */
                        //openedLink[d.id] = openedLinkComponent();
                        
                        //menu component
                        menus[d.id] = menuComponent();
                            
                    })
                    .merge(linkG)
                    .each(function(d){
                        //ENTER AND UPDATE
                        // console.log("update link", d)
                        //lines
                        d3.select(this).select("line.main")
                            .attr("stroke-width", strokeWidth)
                            .call(updatePos, { 
                                x1: () => d.src.x,
                                y1: ()=> d.src.y,
                                x2: () => d.targ.x,
                                y2: () => d.targ.y
                            }, transitionUpdate)
                            .on("click", onClick)

                        d3.select(this).select("line.completion")
                            .attr("stroke-width", strokeWidth * 1.3)
                            .on("click", onClick)
                        
                        //hitbox
                        const hitboxWidth = 5;
                        d3.select(this).select("rect.hitbox")
                            .attr("transform", "rotate(" +d.rotation +" " +d.src.x +" " +d.src.y +")")
                            .attr("x", d.src.x)
                            .attr("y", d.src.y - hitboxWidth/2)
                            .attr("width", distanceBetweenPoints(d.src, d.targ))
                            .attr("height", hitboxWidth)
                            .on("click", onClick)
                       
                    })
                    .each(function(d){
                        const menuG = d3.select(this).selectAll("g.menu").data(d.isSelected ? [menuOptions] : []);
                        const menuGEnter = menuG.enter()
                            .append("g")
                                .attr("class", "menu")
                                .attr("opacity", 1)
                                /*
                                .attr("opacity", 0)
                                .transition()
                                    .duration(200)
                                    .attr("opacity", 1);*/
                        
                        menuGEnter.merge(menuG)
                            .attr("transform", "translate(" +d.centre[0] + "," +(d.centre[1] - menus[d.id].optDimns().height/2) +")")
                            .call(menus[d.id]
                                .onClick((opt) => {
                                    switch(opt.key){
                                        case "delete": { deleteLink(d.id) };
                                        default:{};
                                    }
                                }))
    
                        menuG.exit().each(function(d){
                            if(!d3.select(this).attr("class").includes("exiting")){
                                d3.select(this)
                                    .classed("exiting", true)
                                    .transition()
                                        .duration(200)
                                        .attr("opacity", 0)
                                        .on("end", function() { d3.select(this).remove() });
                            }
                        }) 
                    })
                    .on("mousedown", e => { e.stopPropagation(); })

            //update only
            /*
            linkG.each(function(d){
                console.log("update link ", transitionUpdate)
                const mainLine = d3.select(this).select("line.main")
                const compLine = d3.select(this).select("line.completion")
                    .attr("display", withCompletion ? "inline" : "none")

                if(transitionUpdate){
                    mainLine
                        .transition()
                        .delay(50)
                        .duration(200)
                            .attr("x1", d.src.x)
                            .attr("y1", d.src.y)
                            .attr("x2", d.targ.x)
                            .attr("y2", d.targ.y)

                    compLine
                        .transition()
                        .delay(50)
                        .duration(200)
                            .attr("x1", d.src.x)
                            .attr("y1", d.src.y)
                            .attr("x2", d.compX)
                            .attr("y2", d.compY)
                }else{
                    mainLine
                        .attr("x1", d.src.x)
                        .attr("y1", d.src.y)
                        .attr("x2", d.targ.x)
                        .attr("y2", d.targ.y)
                    
                    compLine
                        .attr("x1", d.src.x)
                        .attr("y1", d.src.y)
                        .attr("x2", d.compX)
                        .attr("y2", d.compY)
                }
            })
            */

            

            //EXIT
            linkG.exit().each(function(d){
                if(!d3.select(this).attr("class").includes("exiting")){
                    d3.select(this)
                        .classed("exiting", true)
                        .transition()
                            .duration(200)
                            .attr("opacity", 0)
                            .on("end", function() { d3.select(this).remove() });
                }
            }) 
        })

        return selection;
    }
    
    //helpers
    /*
    function updateSelected(id){
        console.log("updateSel", id)
        selected = id;
        menu.onClick((option) => {
            switch(option.key){
                case "delete": { deletePlanet(selected) };
                default:{};
            }
        });
    }
    */

    //api
    links.withCompletion = function (value) {
        if (!arguments.length) { return withCompletion; }
        withCompletion = value;
        return links;
    };
    links.selectedMeasure = function (value) {
        if (!arguments.length) { return selectedMeasure; }
        selectedMeasure = value;
        return links;
    };
    links.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return links;
    };
    links.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return links;
    };
    links.strokeWidth = function (value) {
        if (!arguments.length) { return strokeWidth; }
        strokeWidth = value;
        return links;
    };
    links.deleteLink = function (value) {
        if (!arguments.length) { return deleteLink; }
        if(typeof value === "function"){
            deleteLink = value;
        }
        return links;
    };
    links.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return links;
    };
    /*
    links.onPlanetDrag = function (e, d) {
        //src links
        d3.selectAll("g.link")
            .filter(l => l.src.id === d.id)
            .each(function(l){
                l.src.x = d.x;
                l.src.y = d.y;
                d3.select(this).select("line")
                    .attr("x1", l.src.x)
                    .attr("y1", l.src.y)
                
                 //bar pos
                d3.select(this).select("g.bar-chart")
                    //.attr("transform", )

            })

        //targ links
        d3.selectAll("g.link")
            .filter(l => l.targ.id === d.id)
            .each(function(l){
                l.targ.x = d.x;
                l.targ.y = d.y;
                d3.select(this).select("line")
                    .attr("x2", l.targ.x)
                    .attr("y2", l.targ.y)
            })
        
        return links;
    }
    */
    return links;
};
