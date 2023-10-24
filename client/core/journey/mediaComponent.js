import * as d3 from 'd3';
import { DIMNS, PROFILE_PAGES, grey10, OVERLAY, TRANSITIONS } from "./constants";
import container from './kpis/kpi/container';
import dragEnhancements from './enhancedDragHandler';
import { icons } from '../../util/icons';
import { fadeIn, remove } from '../journey/domHelpers';

//helpers
const isSportsman = () => true;// personType => ["footballer", "athlete", "boxer"].includes(personType);
//note - for some user eg adults, the profile pages wont even render this info component
const shouldShowTextInfo = (pageKey, personType) => pageKey === "profile" && (isSportsman(personType) || personType === "child");

/*

*/
export default function mediaComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height / 2;
    let withTextInfo = true;
    let textInfoHeight;
    let photoWidth;
    let photoHeight;

    function updateDimns(data){
        textInfoHeight = withTextInfo ? d3.max([45, height * 0.2]) : 0;
        photoWidth = width/2;
        photoHeight = height;// - textInfoHeight;
    }

    let fontSizes = {
        name:9,
        age:11,
        position:8,
        date:8
    };

    let editable;
    let beingEdited = "";
    let initZoomApplied = false;

    //API CALLBACKS
    let onClick = function(){};
    let onDblClick = function(){};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onStartEditingPhotoTransform = function(){};
    let onEndEditingPhotoTransform = function(){};

    let onMilestoneWrapperPseudoDragStart = function(){};
    let onMilestoneWrapperPseudoDrag = function(){};
    let onMilestoneWrapperPseudoDragEnd = function(){};

    //let enhancedDrag = dragEnhancements();
    let dateIntervalTimer;
    let showDateCount = false;
    let currentPage = PROFILE_PAGES[1];

    //dom
    let containerG;

    const photoZoom = d3.zoom();
    const photoDrag = d3.drag();
    const enhancedDrag = dragEnhancements();
    function media(selection, options={}) {
        //console.log("profileinfo", height)
        const { transitionEnter=true, transitionUpdate=true } = options;

        /*next - bring in cardsHeader as we will beed date and title, 
        even tho title may be different to card title

        but first, need to diecide ont design - how to incorporate photo with increments
         - we dont really want parts of the photo shoiwing through - maybe just have the phots
         only appear on the front card? so its a bit dynamic.

         //will teh date relate to a specific session - no, its all sessions and date from the date range
         //but this can be adjusted in settings to show a specific session


        */

        // expression elements
        selection.each(function (data) {
            const pageKey = data.isCurrent ? "profile" : currentPage.key;
            withTextInfo = shouldShowTextInfo(pageKey, data.personType)
            updateDimns(data);
            containerG = d3.select(this);
            //update
            update(data);
        })

        function update(data){
            //console.log("data", withTextInfo, data)
            const { id, firstname, surname, age, position, isCurrent, isFuture, settings, personType } = data;
            const photosData = isCurrent ? data.photos["profile"] : data.photos[currentPage.key];

            const bgRect = containerG.selectAll("rect.info-bg").data([1]);
            bgRect.enter()
                .append("rect")
                    .attr("class", "info-bg")
                    .merge(bgRect)
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", "none")
                    .attr("stroke", grey10(5))
                    .attr("stroke-width", 0.03)

            const photoG = containerG.selectAll("g.photo").data(photosData, d => d.key);
            photoG.enter()
                .append("g")
                    .attr("class", "photo")
                    .call(fadeIn, { transition:{ duration:700 } })
                    .each(function(d){
                        const photoG = d3.select(this);
                        d3.select("svg#milestones-bar").select('defs')
                            .append('clipPath')
                                .attr('id', `photo-clip-${id}`)
                                    .append('rect');
                            
                        photoG
                            .insert("image","text");
                        
                        photoG
                            .attr('clip-path', `url(#photo-clip-${id})`)

                        photoG.append("rect")
                            .attr('class', "photo-border")

                        photoG
                            .append("g")
                                .attr("class", "video-icon")
                                    .append("path")
                                        .attr("fill", grey10(7));
                    })
                    .merge(photoG)
                    .attr("transform", (d,i) => `translate(${i * photoWidth}, 0)`)
                    .each(function(d){
                        const photoG = d3.select(this);

                        d3.select("svg#milestones-bar").select(`#photo-clip-${id}`)
                            .select("rect")
                                .attr("width", photoWidth)
                                .attr("height", photoHeight)

                        photoG.select("rect.photo-border")
                            .attr("width", photoWidth)
                            .attr("height", photoHeight)
                            .attr("fill", "none")
                            .attr("stroke", beingEdited === "photo" ? "orange" : "none")
                            .attr("stroke-width", 5)

                        photoG.select("image")  
                            //.attr("width", width)
                            .attr("xlink:href", d.url)
                            .attr("transform", d.transform)
                            //.attr("height", photoHeight)

                        const videoIconG = photoG.select("g.video-icon")
                            .attr("transform", `translate(${photoWidth/2 - 2},${photoHeight - 5})`);

                        videoIconG.select("path").attr("transform", `scale(0.02)`)
                            .attr("d", icons.video.d)

                        //console.log("actual w h", img.attr("width"), img.attr("height"))

                        //mit kereset isten a napallimban (sarga)
                    })
                    //.on("click", (e,d) => {
                        //console.log("native photo click")
                        //const locationKey = isCurrent ? "profile" : currentPage.key;
                        //onClick.call(this, e, d, data, "photo", locationKey) 
                    //})
                    /*.on("contextmenu", (e) => { 
                        //console.log("photo contextmenu event")
                        e.preventDefault(); 
                    })
                    .call(photoDrag)
                    .call(photoZoom);
                    */
        
            /*
            photoZoom.on("zoom", function(e, d){
                
                if(beingEdited !== "photo"){ return; }
                //origin is centre otherwise if its based on sourceEvent it jumps
        
                //const cX = width/2;
                //const cY = photoHeight/2;
                const { x, y, k } = e.transform;
                d3.select(this).select("image")
                    //.attr("transform-origin",`${cX} ${cY}`)
                    .attr("transform", `translate(${x},${y}) scale(${k})`)

                //todo - apply transfrorm in same way as below and see if this means teh transfrom objkect is correct
                //when saving at the end in milestonesBarComponent
            })
            //init zoom
            //for now, we just assume there is only one photo
            if(!initZoomApplied){
                beingEdited = "photo";
                const { x=0, y=0, k=1 } = photosData[0];
                const identity = d3.zoomIdentity;
                const requiredTransformState = identity.translate(x, y).scale(k);
                containerG.select("g.photo").call(photoZoom.transform, requiredTransformState)
                //flags
                beingEdited = "";
                initZoomApplied = true;
            }


            enhancedDrag
                .onClick((e,d) => {
                    const locationKey = isCurrent ? "profile" : currentPage.key;
                    onClick.call(this, e, d, data, "photo", locationKey) 
                })
                .onLongpressStart(startEditing);

            function startEditing(){
                onStartEditingPhotoTransform(id, currentPage.key);
                beingEdited = "photo";
                update(data);
            }
            //todo - make this available via api
            function endEditing(){
                //shouldnt call parent if its being triggered from the parent
                onEndEditingPhotoTransform(id, currentPage.key);
                beingEdited = "";
                update(data);
            }


            photoDrag
                .on("start", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDragStart.call(this, e, d);
                        return;
                    }
                }))
                .on("drag", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDrag.call(this, e, d)
                        return;
                    }
                    if(beingEdited === "photo"){
                        const transformState = d3.zoomTransform(this);
                        //console.log("transformState", transformState)
                        //need to divide to undo the scale effect to keep the drag effect consistent
                        const { k } = transformState;
                        const newTransformState = transformState.translate(e.dx/k, e.dy/k);
                        d3.select(this)
                            .call(photoZoom.transform, newTransformState)
                    }
                }))
                .on("end", enhancedDrag(function(e, d){
                    if(!beingEdited){
                        onMilestoneWrapperPseudoDragEnd.call(this, e, d)
                        return;
                    }
                }))*/

            photoG.exit().call(remove);
        }

        return selection;
    }
    
    //api
    media.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return media;
    };
    media.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return media;
    };
    media.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return media;
    };
    media.currentPage = function (value) {
        if (!arguments.length) { return currentPage; }
        currentPage = value;
        initZoomApplied = false;
        return media;
    };
    media.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return media;
    };
    media.onStartEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onStartEditingPhotoTransform = value;
        }
        return media;
    };
    media.onEndEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onEndEditingPhotoTransform = value;
        }
        return media;
    };
    media.onMilestoneWrapperPseudoDragStart = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragStart; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragStart = value;
        }
        return media;
    };
    media.onMilestoneWrapperPseudoDrag = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDrag; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDrag = value;
        }
        return media;
    };
    media.onMilestoneWrapperPseudoDragEnd = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragEnd; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragEnd = value;
        }
        return media;
    };
    media.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return media;
    };
    media.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return media;
    };
    media.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return media;
    };
    media.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return media;
    };
    media.endEditing = function (){
        beingEdited = "";
        containerG.call(media)
    }
    return media;
}
