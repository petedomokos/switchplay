import * as d3 from 'd3';
import barChartLayout from "./barChartLayout";
import { getGoalsData } from '../../data/planets';
import { distanceBetweenPoints, angleOfRotation, angleOfElevation, toRadians } from './geometryHelpers';

export default function linkslayout(){
    //const barChartWidth = 100;
    //const barChartHeight = 100; 
    //move bar dimns to linksCompo

    let currentZoom = d3.zoomIdentity;
    let selected;

    let channelsData = [];
    let planetsData = [];
    function update(data){
        return data.map((l,i) => {
            const src = planetsData.find(p => p.id === l.src);
            const targ = planetsData.find(p => p.id === l.targ);

            //const theta = 
            //we want all visible channels to show, even if actual targetDate is not after, so we use x to get channels not dates
            //include teh src and targ channels, plus any in between
            //const channels = channelsData.filter(ch => src.channel.nr === ch.nr || targ.channel.nr === ch.nr || ch.startX >= src.x && ch.endX <= targ.x);
            //const channels = channelsData.filter(ch => ch.startX >= src.channel.startX && ch.endX <= targ.channel.endX);
            const channels = channelsData.filter(ch => src.channel.endX <= ch.startX && ch.endX <= targ.channel.endX);
            const isOpen = !!channels.find(ch => ch.isOpen);
            /*
            console.log("src", src)
            console.log("link", l)
            console.log("channels", channels)
            console.log("isOpen", isOpen)
            */
            //@todo - bug - when opening a channel, the next links also show as being open
            //because of the above line
            //@todo - bug - centre jumps up when dragging from one channel into another if its open
            const centre = [
                ((src.x + targ.x)/2),// - barChartWidth/2,
                ((src.y + targ.y)/2),// - barChartHeight/2
            ]
            //pass the targ planet, along with mock goals, and the src targetDate as the startDate, to the bar layout
            const barChartData = barChartLayout({ ...targ, startDate:src.targetDate, goals: getGoalsData(l.id)})
            
            const tooltipData = barChartData.map(g => ({
                id:g.id,
                title:g.title,
                colHeadings:["start", "now", "proj", "targ"],
                rowHeadings:["date", "score"],
                //@todo - allow for wider column by giving a width enum to each row/col object
                //cols:[{ title:"start" }, { title: "now"}, {title: "proj / targ"}],
                //rows:[{ title: "date" }, { title: "score" }],
                datapoints:[
                    { col:"start", row:"date", value:g.startDate || "02/03/22" },
                    { col:"now", row:"date", value:/*new Date()*/ "17/04/22" },
                    { col:"proj", row:"date", value:g.endDate || "31/04/22" },
                    { col:"targ", row:"date", value:g.endDate || "31/04/22" },
                    //{ col:"proj / targ", row:"date", value:g.endDate || "31/04/22" },
                    { col:"start", row:"score", value:g.startValue || "25" },
                    { col:"now", row:"score", value:g.value || "36" }, //doesnt exist yet as its all done by pc
                    //{ col:"proj / targ", row:"score", value:(""+g.projValue || "42") +" / " +(""+g.targ || "51") } //or projPCValue
                    { col:"proj", row:"score", value:g.projValue || "42" }, //or projPCValue
                    { col:"targ", row:"score", value:g.targ || "51" }
                ]
            }));
            const goalsData = { barChartData, tooltipData };
            const overallProgressPC = d3.mean(barChartData, g => g.pcValue);

            const { cos, sin } = Math;

            //const theta = angleOfRotation(src, targ);
            //console.log("theta", theta)
            const { quad, theta } = angleOfElevation(src, targ)
            //console.log("elev", theta)
            const lineLength = distanceBetweenPoints(src, targ);
            //console.log("lineLength", lineLength)
            //console.log("overallPC", overallProgressPC)
            //console.log("compX", cos(toRadians(theta)))
            const compX = src.x + (overallProgressPC / 100) * lineLength * cos(toRadians(theta));
            //subtract y as its reversed in svg coods
            const compY = src.y - (overallProgressPC / 100) * lineLength * sin(toRadians(theta));
            const rotation = angleOfRotation(src, targ);
            return { 
                ...l, 
                src, 
                targ,
                compX,
                compY,
                isOpen, 
                goalsData,
                overallProgressPC,
                centre,
                isSelected:selected === l.id,
                rotation
            }
        });
    }

    update.channelsData = function (value) {
        if (!arguments.length) { return channelsData; }
        channelsData = value;
        return update;
    };
    update.planetsData = function (value) {
        if (!arguments.length) { return planetsData; }
        planetsData = value;
        return update;
    };
    update.currentZoom = function (value) {
        if (!arguments.length) { return currentZoom; }
        currentZoom = value;
        return update;
    };
    update.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return update;
    };

    return update;

}