import * as d3 from 'd3';
import { COLOURS } from "./constants"

export function planetsGenerator(){
    //api vars
    let width = 100;
    let height = 200;
    let onSelect = function(){};
    //planet dimns
    const planetHeight = 100; //@todo - make dependedn on props
    const planetWidth = 100;
    const planetMarginBottom = 10;
    const planetMarginRight = 10;
    const propertyMarginBottom = 5;
    const planetNameWidth = planetWidth * 0.7;
    const planetNameHeight = 20;
    //property dimns
    const propertyHeight = 15;
    const propertyWidth = 50

    function planets(selection){
        // set up drag
        const planetDrag = d3.drag()
            //.on("start", planetDragStart)
            //.on("drag", planetDragged)
            .on("end", planetDragEnd);

        selection.each(function(data){
             //Bind
            const planetG = selection.selectAll("g.planet").data(data, d => d.id)
            //Enter
            const planetGEnter = planetG.enter()
                .append("g")
                    .attr("class", "planet")
                    .attr("transform", (d,i) => "translate(0,"+i*(planetHeight + planetMarginBottom) +")");

            planetGEnter
                    .append("rect")
                        .attr("width", planetWidth)
                        .attr("height", planetHeight)
                        .attr("fill", COLOURS.planet.bg)

            planetGEnter
                .append("text")
                    .attr("transform", "translate(5,5)")
                    .attr("dominant-baseline", "hanging")
                    .attr("font-size", 14)
                    .attr("fill", COLOURS.planet.name)
                    .text(d => d.name)

            //hitbox
            planetGEnter
                .append("rect")
                    .attr("width", planetNameWidth)
                    .attr("height", planetNameHeight)
                    .attr("fill", "transparent")
                    .style("cursor", "pointer")
                    .call(planetDrag);

            //PLANET PROPERTY
            planetGEnter.each(function(planetD, i){
                const propertyDrag = d3.drag()
                    //.on("start", propertyDragStart)
                    //.on("drag", propertyDragged)
                    .on("end", (e,d) => propertyDragEnd(planetD, d));
                //bind
                const propertyG = d3.select(this).selectAll("g.property").data(planetD.properties, d => d.id);
                //enter
                const propertyGEnter = propertyG.enter()
                    .append("g")
                    .attr("class", "property")
                    .attr("transform", (d,i) => "translate(10,"+(5 + planetNameHeight + i*(propertyHeight + propertyMarginBottom)) +")");

                propertyGEnter
                    .append("text")
                        .attr("transform", "translate(5,5)")
                        .attr("dominant-baseline", "hanging")
                        .attr("font-size", 12)
                        .attr("fill", COLOURS.planet.property)
                        .text(d => d.name);

                //hitbox
                propertyGEnter
                    .append("rect")
                        .attr("width", propertyWidth)
                        .attr("height", propertyHeight)
                        .attr("fill", "transparent")
                        .style("cursor", "pointer")
                        .call(propertyDrag);
            })

        })

        function planetDragEnd(e, planet){
            //planet becomes selected
            onSelect(planet)
        }
        function propertyDragEnd(planet, property){
            onSelect(planet, property)
        }
    }

   

    // api
    planets.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return planets;
    };
    planets.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return planets;
    };
    planets.onSelect = function (value) {
        if (!arguments.length) { return onSelect; }
        onSelect = value;
        return planets;
    };
    return planets;
}

