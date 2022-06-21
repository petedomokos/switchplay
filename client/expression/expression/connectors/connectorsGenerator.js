import * as d3 from 'd3';
import { DIMNS } from "../../constants";
import { sumPrevBlockWidths } from "../../helpers";
import { selConnectorGenerator } from "./selConnectorGenerator"
import { aggConnectorGenerator } from "./aggConnectorGenerator"

/*
    note - downside of merging blockG before pasing through here is ts a bit trickier to do update only
    but we can still do it using and else() after the if statement
*/
export function connectorsGenerator(selection){
    let width;
    let height;
    //connector width is the block margins total
    const blockMarginWidth = DIMNS.block.margin.left + DIMNS.block.margin.right;
    const connectorMargin = DIMNS.exp.connector.margin;
    const connectorContentsWidth = blockMarginWidth - 2 * connectorMargin.horiz;

    let connectors = [];
    function updateConnector(d, i){
        //remove previous
        if(connectors[i]){
            //we don't want to remove the gs themselves, as they are managed via the EUE pattern
            d3.select(this).select("g.contents").remove();
        }
        switch(d[1].func?.id){
            case "sel":{
                connectors[i] = selConnectorGenerator();
                break;
            }
            case "agg":{
                connectors[i] = aggConnectorGenerator();
                break;
            }
            default:{
                //@todo - change this
                connectors[i] = selConnectorGenerator();
            }
        }
    }

    function myConnectors(selection){        
        selection.each(function(chainData){
            if(chainData.length < 2) { return; }
            
            const connectorsData = chainData
                .map((d,i) => i === 0 ? undefined : [chainData[i - 1], d])
                .filter(x => x)

            //@todo - could give each conecotrDatum a uniqueId (not index) that doesnt change
            //even if previous ones ar edeleted. This woyld be 2nd arg of .data
            const connectorG = d3.select(this).selectAll("g.connector").data(connectorsData)

            const connectorGEnter = connectorG.enter()
                .append("g")
                .attr("class", "connector")
                .each(function(d){
                    /*
                    //background rect
                    d3.select(this).append("rect").attr("fill", "blue")
                    */
                })

            connectorG.merge(connectorGEnter)
                .attr("transform", (d,i) => {
                    //2nd block may not have a res so could be undefined
                    if(!d[1].res){ return;}
                    //console.log("d for "+i, d)
                    //todo - add on the blockWidth of teh prev blocks sum of widths and margins
                    //home block has already been accounted for in connectorsG transform
                    //use i + 1 because d is a pair of prev and current
                    const prevBlockWidths = sumPrevBlockWidths(i + 1, chainData) - DIMNS.block.width.homeSel;
                    //connectors are rendered in the block margin
                    const dx = prevBlockWidths + connectorMargin.horiz;// + i * (blockMarginWidth);
                    return "translate("+dx +"," +height/2+")"
                })
                .each(function(d,i){
                    //2nd block may not have a res so could be undefined
                    if(!d[1].res){ return;}
                    /*
                    //background rect
                    d3.select(this).select("rect").attr("y", -height/2).attr("width", connectorContentsWidth).attr("height", height)
                    */
                   //update connector component if required
                    const functionHasChanged = connectors[i]?.funcType !== d[1]?.func?.id;
                    if(functionHasChanged){
                        updateConnector.call(this, d, i);
                    }
                    //render the connector
                    //g is positioned horizontally where connector lines must start, and vertically in the middle.
                    //width is the remainder of the block margin (minus the 2 connectorMargins), and height is the whole block
                    d3.select(this).datum(d).call(connectors[i].width(connectorContentsWidth).height(height))
                })
    
        })
        return selection;
    }

    // api
    myConnectors.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return myConnectors;
        };
    myConnectors.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return myConnectors;
    };
    return myConnectors;

    }
