import * as d3 from 'd3';
import ctrlsComponent from './ctrlsComponent';
import { grey10 } from "./constants";

export function addMilestonePlaceholderContents(selection, width, height, onClick){
    selection.each(function(){
        //use contentsG to reposition from centre to top-left, with no margin
        const placeholderContentsG = d3.select(this)
            .append("g")
                .attr("class", "placeholder-contents")
                .attr("transform", `translate(${-width/2}, ${-height/2})`)

        placeholderContentsG
            .append("rect")
                .attr("class", "placeholder-bg")
                .attr("width", width)
                .attr("height", height)
                .attr("fill", grey10(3))
        
        const margin = { left: width * 0.1, right: width * 0.1, top: height * 0.2, bottom: height * 0.2 }
        
        const btnData = [
            { key:"create", label: "CREATE" },
            //{ key:"contract", label: "CONTRACT" },
            { key:"cancel", label: "CANCEL" }
        ]

        console.log("btnData", btnData)
        placeholderContentsG
            .datum({ btnData })
            .call(ctrlsComponent()
                .width(width)
                .height(height)
                .margin(margin)
                .onClick((e,d) => { onClick(d.key) }))

        })
}

export function removeMilestonePlaceholderContents(){ 
    d3.select(this).remove();
}