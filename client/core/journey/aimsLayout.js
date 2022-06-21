import * as d3 from 'd3';
import { PLANET_RING_MULTIPLIER, COLOURS, DIMNS } from './constants';
import { findNearestChannelByEndDate } from "./helpers";

export default function aimsLayout(){
    let canvasDimns = { width: 800, height: 600 };
    let timeScale = x => 0;
    let yScale = x => 0;
    let currentZoom = d3.zoomIdentity;

    //let selected;

    let channelsData;
    let trueX = x => x;
    let adjX = x => x;
    let pointChannel = () => {};
    let dateChannel = () => {};
    let nearestChannelByEndDate = () => {};

    function updateChannelsData(newChannelsData){
        channelsData = newChannelsData;
        nearestChannelByEndDate = findNearestChannelByEndDate(channelsData);
    }
    //goal radii
    const rx = width => currentZoom.k * width * 0.8 / 2;
    const ry = height => currentZoom.k * height * 0.8 / 2;

    function update(data){
        const planetsData = data.goals || [];
        const aimsData = data.aims || [];
        const linksData = data.links || [];
        const planets = planetsData.map(p => {
            //todo - findNearestChannel needs to take account of open channels too
            const channel = nearestChannelByEndDate(p.targetDate);
            const { axisRangeShift } = channel;
            //on drag , targetX jumps up
            //targetX should be the same as the d.x in planetDrag, not trueX
            //problem - nrPtrevOpenChannels doesnt include itself when it is open
            //but we have already stored that
            const targetX = timeScale(p.targetDate) + axisRangeShift;
            //const targetX = timeScale(p.targetDate) + nrPrevOpenChannels * scaledExtWidth;

            //only coerce targ if it exists, as we dont want it to become NaN in that case or it will display
            const measures = p.measures.map(m => {
                return { ...m, targ:typeof m.targ === "string" ? +m.targ : undefined }
            })

            return {
                ...p,
                dataType: "planet",
                aimId: p.aimId || "main",
                channel,
                displayDate:p.unaligned ? p.targetDate : channel.endDate,
                x:p.unaligned ? targetX : channel.endX, //planets positioned on channel end line
                y: yScale(p.yPC),
                targetX,
                rx,
                ry,
                ringRx:width => rx(width) * PLANET_RING_MULTIPLIER,
                ringRy:height => ry(height) * PLANET_RING_MULTIPLIER,
                //isSelected:selected === p.id,
                measures,
                isMilestone:measures.length === 0 && linksData.find(l => l.targ === p.id),
            }
        });

        const subAims = aimsData.map(aim => {
            const { startDate, endDate, startYPC, endYPC } = aim;
            const aimMargin = DIMNS.aim.margin;
            const aimPlanets = planets.filter(p => p.aimId === aim.id);
            //for now, we can assume all planets same size, using dimns.planet.width for planet width
            let planetRX = rx(DIMNS.planet.width);
            const planetExtent = d3.extent(aimPlanets, p => p.x);

            const planetBounds = [
                planetExtent[0] - planetRX - DIMNS.aim.margin.left, 
                planetExtent[1] + planetRX + DIMNS.aim.margin.right
            ];
            //console.log("timeScale startDate", timeScale(startDate))
            //console.log("timeScale endDate", timeScale(endDate))
            const actualX = timeScale(startDate);
            const actualX2 = timeScale(endDate);
            const y = yScale(startYPC);
            const width = timeScale(endDate) - actualX;
            const height = yScale(endYPC) - y;
            //console.log("aimBounds", aimBounds)
            //increase aim size if planets dont fit in when displayed
            const displayX = d3.min([actualX, planetBounds[0]]);
            const displayX2 = d3.max([actualX2, planetBounds[1]])
            const displayWidth = d3.max([width, displayX2 - displayX])
            return {
                ...aim,
                planets:aimPlanets,
                actualX,
                y,
                width,
                height,
                displayX,//:planetBounds[0],
                displayWidth,//: planetBounds[1] - planetBounds[0],
                //note - planets have alreayd been configured for the visual
            }
        })
        //todo - check it works to render the aim
            //amend the dragEnd handlers that update aim, so they send the inverted values to state
        const mainAim = {
            id:"main",
            planets:planets.filter(p => p.aimId === "main"),
            name:data.name,
            dataType:"aim",
            actualX:0,
            displayX:0,
            y:0,
            width:canvasDimns.width,
            height:canvasDimns.height
        }
    
        const aims = [ mainAim, ...subAims ]
            .map(aim => ({
                ...aim,
                //add latest planets, overiding the previous
                //add aim-related planet properties
                planets:planets
                    .filter(p => p.aimId === aim.id)
                    .map(p=> ({
                        ...p,
                        fill:p.colour || aim.colour || COLOURS.planet
                    }))

            }));

        return aims;
    }
    update.canvasDimns = function (value) {
        if (!arguments.length) { return canvasDimns; }
        canvasDimns = { ...canvasDimns, ...value };
        return update;
    };
    update.timeScale = function (value) {
        if (!arguments.length) { return timeScale; }
        timeScale = value;
        return update;
    };
    update.yScale = function (value) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        return update;
    };
    update.channelsData = function (value) {
        if (!arguments.length) { return channelsData; }
        updateChannelsData(value);
        return update;
    };
    update.currentZoom = function (value) {
        if (!arguments.length) { return currentZoom; }
        currentZoom = value;
        return update;
    };/*
    update.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return update;
    };
    */

    return update;
}