import * as d3 from 'd3';
import { initial } from 'lodash';
import { DIMNS } from "./constants";
import contractsComponent from './contractsComponent';
import profileCardsComponent from './profileCardsComponent';
/*

*/
export default function milestonesBarComponent() {
    //API SETTINGS
    // dimensions
    let width;
    let height = DIMNS.milestonesBar.height
    const profileCardDimns = DIMNS.milestonesBar.profile;
    const contractDimns = DIMNS.milestonesBar.contract;
    const barHeight = DIMNS.milestonesBar.height;
    const itemWidth = dataType => dataType === "profile" ? profileCardDimns.width: contractDimns.width;
    const itemHeight = dataType => dataType === "profile" ? profileCardDimns.height: contractDimns.height;

    let xScale = x => 0;
    let selected;

    let containerG;
    let contractsG;
    let profilesG;

    //components
    const contracts = contractsComponent();
    const profiles = profileCardsComponent();

    function milestonesBar(selection, options={}) {
        /*
        todo 
        make kpiHeight higher for milestones bar to allow easy adjusting
        - horizontal scrollimg in div - not working for some reason
        - kpi bars bug - 2nd card doesnt seem to have all the bars




        */
        const { transitionEnter=true, transitionUpdate=true } = options;
        // expression elements
        selection.each(function (data) {
            // console.log("milestones bar update", data)
            containerG = d3.select(this);
            //why not empty>??
            if(containerG.select("g").empty()){
                init();
            }
            function init(){
                contractsG = containerG.append("g").attr("class", "contracts");
                profilesG = containerG.append("g").attr("class", "profiles");
            }
            
            //SCALES
            //normally, xScale domain is a date but here the children pass through i aswell
            const x = (nr) => {
                const item = data[nr];
                const previousMilestonesData = data.filter((m,i) => i < nr);
                const sum = d3.sum(previousMilestonesData, d => itemWidth(d.dataType));
                return d3.sum(previousMilestonesData, d => itemWidth(d.dataType)) + itemWidth(item.dataType)/2;
            }

            //y is just the middle of the bar for all
            const y = () => height/2;

            //call profileCsrds abd contarcts comps, passing in a yscale that centres each one
            contractsG
                .datum(data.filter(m => m.dataType === "contract"))
                .call(contracts
                    .width(DIMNS.milestonesBar.contract.width)
                    .height(DIMNS.milestonesBar.contract.height)
                    .margin(DIMNS.milestonesBar.contract.margin)
                    .xScale(x, "nr")
                    .yScale(y), { log:true });

            profilesG
                .datum(data.filter(m => m.dataType === "profile"))
                .call(profiles
                    .width(DIMNS.milestonesBar.profile.width)
                    .height(DIMNS.milestonesBar.profile.height)
                    .margin(DIMNS.milestonesBar.profile.margin)
                    .kpiHeight(30)
                    .xScale(x, "nr")
                    .yScale(y), { log:true });


            const milestoneG = containerG.selectAll("g.milestone").data(data, d => d.id);
            milestoneG.enter()
                .append("g")
                .attr("class", d => "milestone milestone-"+d.id)
                .each(function(d,i){
                
                })
                .style("cursor", "grab")
                //.call(transform, { x: d => adjX(timeScale(d.targetDate)), y:d => d.y })
                //.call(transform, { x: d => d.x, y:d => d.y }, transitionEnter && transitionsOn)
                .merge(milestoneG)
                .attr("transform", d =>  "translate(" +xScale(d.date) +"," +height/2 +")")
                .each(function(d){
                })
                .each(function(d){

                })

            //EXIT
            milestoneG.exit().each(function(d){
                //will be multiple exits because of the delay in removing
                if(!d3.select(this).attr("class").includes("exiting")){
                    d3.select(this)
                        .classed("exiting", true)
                        .transition()
                            .duration(200)
                            .attr("opacity", 0)
                            .on("end", function() { d3.select(this).remove(); });
                }
            })

        })

        return selection;
    }
    
    //api
    milestonesBar.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return milestonesBar;
    };
    milestonesBar.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return milestonesBar;
    };
    milestonesBar.selected = function (value) {
        if (!arguments.length) { return selected; }
        selected = value;
        return milestonesBar;
    };
    milestonesBar.xScale = function (value) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        return milestonesBar;
    };
    milestonesBar.yScale = function (value) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        return milestonesBar;
    };
    return milestonesBar;
}
