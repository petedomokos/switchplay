import * as d3 from 'd3';
import { grey10, COLOURS, TRANSITIONS, DIMNS } from "./constants";
import { trophyIcon } from "../../../assets/icons/milestoneIcons.js"
import { fadeIn, fadeInOut, remove } from '../journey/domHelpers';
const { GOLD } = COLOURS;

export default function trophyComponent() {
    //API SETTINGS
    // dimensions
    let width = 300;
    let height = 100
    let margin = { left: 0, right: 0, top: 0, bottom: 0 };
    let contentsWidth;
    let contentsHeight;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
    }
    let DEFAULT_STYLES = {
    }
    let _styles = () => DEFAULT_STYLES;

    let iconTransform = { x:0, y:0 }

    let onClick = null;

    let containerG;
    let contentsG;

    function trophy(selection, options={}) {
        const { } = options;
       
        updateDimns();
        // expression elements
        selection.each(function (data) {
            //console.log("trophy", data.completion)
            containerG = d3.select(this);

            if(containerG.select("g.trophy-contents").empty()){
                init(data);
            }

            update(data);

            function init(data){

                //contents
                contentsG = containerG.append("g")
                    .attr("class", "trophy-contents")
                    .attr("transform", `translate(${margin.left},${margin.top})`);

                contentsG.append("rect").attr("class", "trophy-bg")
                    .attr("fill", "none")

                contentsG
                    .append("g")
                        .attr("class", "non-completed-trophy")
                            .append("path");

                contentsG
                    .append("g")
                        .attr("class", "completed-trophy")
                            .append("path");
                
                containerG.append("rect")
                    .attr("class", "trophy-hitbox")
                    .attr("fill", "transparent")
                    //.attr("stroke-width", 0.05)
                    //.attr("stroke", grey10(10))

                //@todo - make the svg available in environment
                d3.select("svg#decks-svg").select("defs")
                    .append("clipPath")
                        .attr("id", `trophy-${data.id}`)
                            .append("rect")
            }

            function update(data, options={}){
                //console.log("trophy update", data)
                const { } = options;
                const { id, completion } = data

                //hitbox
                containerG
                    .select("rect.trophy-hitbox")
                        .attr("width", width)
                        .attr("height", height)
                        .attr("pointer-events", !onClick ? "none" : null)
                        .on("click", !onClick ? null : function(e){ 
                            e.stopPropagation();
                            onClick.call(this, e, data); 
                        });

                contentsG.select("rect.trophy-bg")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)

                //contents
                contentsG
                    .transition("trophy-contents")
                    .duration(TRANSITIONS.MED)
                        .attr("transform", `translate(${margin.left}, ${margin.top})`)

                //dimns
                const actualIconWidth = 85;
                const iconScale = contentsWidth/actualIconWidth;
                const completedIconG = contentsG.select("g.completed-trophy")
                completedIconG.select("path")
                    .attr("d", trophyIcon.pathD)
                    .attr("fill", GOLD)
                    .attr("transform", `translate(${iconTransform.x},${iconTransform.y}) scale(${iconScale})`);

                //console.log("id", id)
                //next - fix completionPoint - look at hitbox, is trophy centred?
                //need to look at why hitbox is lower - as if the whole containerG is lower - why - fix it!
                const completionPoint = contentsHeight * (1 - completion);
                //console.log("ch comp", contentsHeight, completionPoint)
                d3.select(`clipPath#trophy-${id}`).select("rect")
                    .attr("y", completionPoint)
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight - completionPoint)


                completedIconG.attr('clip-path', `url(#trophy-${id})`);

                //non-completed icon
                contentsG.select("g.non-completed-trophy").select("path")
                    .attr("d", trophyIcon.pathD)
                    .attr("fill", grey10(6))
                    .attr("transform", `translate(${iconTransform.x},${iconTransform.y}) scale(${iconScale})`);

            }

        })

        return selection;
    }
    
    //api
    trophy.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return trophy;
    };
    trophy.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return trophy;
    };
    trophy.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return trophy;
    };
    trophy.iconTransform = function (value) {
        if (!arguments.length) { return iconTransform; }
        iconTransform = { ...iconTransform, ...value };
        return trophy;
    };
    trophy.styles = function (value) {
        if (!arguments.length) { return _styles; }
        if(typeof value === "function"){
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value(d,i) });
        }else{
            _styles = (d,i) => ({ ...DEFAULT_STYLES, ...value });
        }
        
        return trophy;
    };
    trophy.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return trophy;
    };
    return trophy;
}
