import * as d3 from 'd3';
import { DIMNS, grey10, COLOURS, PROFILE_PAGES, OVERLAY, TRANSITIONS } from "./constants";
import dragEnhancements from './enhancedDragHandler';
// import menuComponent from './menuComponent';
import profileInfoComponent from './profileInfoComponent';
import kpisComponent from './kpis/kpisComponent';
import goalComponent from './goal/goalComponent';
import { Oscillator } from './domHelpers';
import { getTransformationFromTrans } from './helpers';
import { AllOutSharp } from '@material-ui/icons';
const noop = () => {};

const CONTENT_FADE_DURATION = TRANSITIONS.KPI.FADE.DURATION;
const AUTO_SCROLL_DURATION = TRANSITIONS.KPIS.AUTO_SCROLL.DURATION;

const trapeziumD = "M31.3,28H0.8c-0.2,0-0.5-0.1-0.6-0.3C0,27.5,0,27.3,0,27L6.5,4.5C6.6,4.2,6.9,4,7.3,4h17.5c0.3,0,0.6,0.2,0.7,0.5L32,27 c0.1,0.2,0,0.5-0.1,0.7C31.7,27.9,31.5,28,31.3,28z M1.7,26.5h28.5l-6.1-21H7.8L1.7,26.5z"
/*

*/
export default function profileCardsComponent() {
    //API SETTINGS
    // dimensions
    let width = DIMNS.profile.width;
    let height = DIMNS.profile.height;
    let margin = { top:0, bottom: 0, left:0, right:0 }
    let contentsWidth;
    let contentsHeight;

    let kpiHeight;

    let profileCtrlsWidth = 150;
    let profileCtrlsHeight = 40;

    let getTextInfoHeight = d => 0;
    let getTopHeight = d => 0;
    let getBottomHeight = d => 0;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;

        const withMedia = d => d.isCurrent || currentPage.key === "goal";
        getTopHeight = d => withMedia(d) ? contentsHeight/2 : 0;
        getBottomHeight = d => withMedia(d) ? contentsHeight/2 : contentsHeight;
        getTextInfoHeight = d => {
            const borderHeight = d3.max([45, getTopHeight(d) * 0.2]);
            return withMedia(d) ? borderHeight : 0;
        };
    }

    let fontSizes = {
        info:{
            name:9,
            age:11,
            position:8,
            date:5
        },
        kpis:{
            name:9,
            values:9,
            ctrls:8
        }
    };

    let ctrls = () => ({
        topLeft: [],
        topRight: [],
        botLeft: [],
        botRight: [],
    });

    //state
    let kpiFormat = "actual";
    let expanded = [];
    let selected = "";
    let selectedKpiKey = "";
    let editable = false;
    let movable = true;
    let scrollable = false;
    let currentPage = PROFILE_PAGES[0];

    let transformTransition = { enter: null, update: null };

    let xScale = x => 0;
    let xKey = "date";
    let yScale = x => 0;
    let yKey = "yPC";
    let calcX = d => typeof d.x === "number" ? d.x : xScale(d[xKey]);
    let calcY = d => typeof d.y === "number" ? d.y : yScale(d[yKey]);

    //API CALLBACKS
    let onClick = function(){};
    let onCtrlClick = () => {};
    let onClickKpi = () => {};
    let onDblClickKpi = function(){};

    let onDblClick = function(){};
    let onDragStart = function() {};
    let onDrag = function() {};
    let onDragEnd = function() {};
    let onLongpressStart = function() {};
    let onLongpressDragged = function() {};
    let onLongpressEnd = function() {};
    let onMouseover = function(){};
    let onMouseout = function(){};
    let onDelete = function() {};
    let onSaveValue = function(){};
    let onUpdateSelectedKpi = function(){};

    let onCreateStep = function(){};
    let onEditStep = function(){};
    let onUpdateStep = function(){};
    let onUpdateSteps = function(){};
    let onDeleteStep = function(){};

    let onStartEditingPhotoTransform = function(){};
    let onEndEditingPhotoTransform = function(){};
    let onSetEditing = function(){};

    let onMilestoneWrapperPseudoDragStart = function(){};
    let onMilestoneWrapperPseudoDrag = function(){};
    let onMilestoneWrapperPseudoDragEnd = function(){};

    let onClickInfo = function(){};

    let enhancedDrag = dragEnhancements();
    //@todo - find out why k=1.05 makes such a big increase in size
    let oscillator = Oscillator({k:1});

    let longpressed;

    //dom
    let containerG;

    //components
    let profileInfoComponents = {};
    let kpisComponents = {};
    let goalComponents = {};

    function profileCards(selection, options={}) {
        const { transitionEnter=true, transitionUpdate=true, log=false } = options;

        if(d3.select("svg#milestones-bar").select(`#profile-card-clip`).empty()){
            d3.select("svg#milestones-bar").select('defs')
                .append('clipPath')
                    .attr('id', `profile-card-clip`)
                        .append('rect');
        }
            // expression elements
        selection.each(function (data) {
            updateDimns();
            //plan - dont update dom twice for name form
            //or have a transitionInProgress flag
            containerG = d3.select(this);
            //can use same enhancements object for outer and inner as click is same for both
            enhancedDrag
                .onDblClick(onDblClick)
                .onClick(onClick)
                .onLongpressStart(longpressStart)
                .onLongpressDragged(longpressDragged)
                .onLongpressEnd(longpressEnd);

            const drag = editable ? () => {} : d3.drag()
                .on("start", enhancedDrag(dragStart))
                .on("drag", enhancedDrag(dragged))
                .on("end", enhancedDrag(dragEnd))
                /*.container(function(){
                    console.log("this p p", this.parentNode.parentNode.parentNode)
                    return this.parentNode.parentNode.parentNode
                });*/ 

            const profileCardG = containerG.selectAll("g.profile-card").data(data, d => d.id);
            profileCardG.enter()
                .append("g")
                    .attr("class", d => `milestone profile-card milestone-${d.id} profile-card-${d.id}`)
                    .each(function(d,i){
                        //@todo - decide if we need this for anything, or do we just turn off all interacitons inside
                        //a profile unless the profile is first selected so the profile itself can be used for longpress to delete/drag
                        
                        //ctrls above the card
                        const profileCtrlsG = d3.select(this)
                            .append("g")
                                .attr("class", "profile-ctrls")
                                .attr("display", "none");

                        profileCtrlsG
                            .append("rect")
                            .attr("fill", "transparent");
                        
                        profileCtrlsG
                            .append("path")
                            .attr("fill", "none")
                            .attr("stroke", grey10(5))
                            .attr("opacity", 0.1)
                            .attr("d", trapeziumD)
                            .attr("transform", "scale(3 1.2)")

                        profileInfoComponents[d.id] = profileInfoComponent();
                        kpisComponents[d.id] = kpisComponent();
                        goalComponents[d.id] = goalComponent();
                        //ENTER
                        const contentsG = d3.select(this)
                            .append("g")
                                .attr("class", "contents profile-card-contents")
                        
                        const innerContentsG = contentsG
                            .append("g")
                                .attr("class", "inner-contents profile-card-inner-contents");

                        //bg rect
                        contentsG
                            .append("rect")
                                .attr("class", "profile-card-border")
                                .attr("rx", 3)
                                .attr("ry", 3)
                        innerContentsG
                            .append("rect")
                                .attr("class", "profile-card-bg")
                                .attr("rx", 3)
                                .attr("ry", 3)
                                .call(updateFill, { 
                                    fill:d => d.id === selected ? COLOURS.selectedMilestone : COLOURS.milestone
                                })

                        const topG = innerContentsG.append("g").attr("class", "top").attr("transform", "translate(0,0)")
                        //set transform here rather than update so it doesnt reset whilst a kpi is selected
                        //alternative is ot update it based on selectedKpi too
                        const bottomG = innerContentsG.append("g").attr("class", "bottom")
                            //.attr("transform", "translate(0," +(getBottomHeight(d)) +")")

                        innerContentsG.append("g").attr("class", "top-right-ctrls")
                        innerContentsG.append("g").attr("class", "bot-right-ctrls")

                        //d3.select(this).append("rect").attr("class", "overlay")
                            //.attr("display", "none");

                        topG.append("g").attr("class", "info");
                        bottomG.append("g").attr("class", "kpis-area")
                        //overlays
                        topG.append("rect").attr("class", "overlay top-overlay")
                            .attr("display", "none");
                        bottomG.append("rect").attr("class", "overlay bottom-overlay")
                            .attr("display", "none");

                        innerContentsG.attr('clip-path', "url(#profile-card-clip)")

                
                    })
                    .style("cursor", editable ? "default" : "grab")
                    //.call(transform, { x: d => d.x, y:d => d.y }, transitionEnter && transitionsOn)
                    .call(updateTransform, { 
                        x:calcX, 
                        y:calcY, 
                        scale:d => expanded.find(m => m.id === d.id)?.k || 1,
                        transition:transformTransition.enter 
                    })
                    .merge(profileCardG)
                    // .on("click", () => { console.log("prof card click native")})
                    //.call(drag)
                    .call(updateTransform, { 
                        x:calcX, 
                        y:calcY,
                        scale:d => expanded.find(m => m.id === d.id)?.k || 1,
                        transition:transformTransition.update 
                    })
                    .each(function(d){
                        const topHeight = getTopHeight(d);
                        const bottomHeight = getBottomHeight(d);

                        const profileCtrlsG = d3.select(this).select("g.profile-ctrls")
                            .attr("transform", `translate(${-(profileCtrlsWidth/3)}, ${-contentsHeight/2 - profileCtrlsHeight+5})`)
                            .call(drag)

                        profileCtrlsG.select("rect")
                            .attr("width", profileCtrlsWidth)
                            .attr("height", profileCtrlsHeight);

                        const profileInfo = profileInfoComponents[d.id]
                            .currentPage(currentPage)
                            .width(contentsWidth)
                            .height(topHeight)
                            .fontSizes(fontSizes.info)
                            .editable(editable)
                            .onStartEditingPhotoTransform(onStartEditingPhotoTransform)
                            .onEndEditingPhotoTransform(onEndEditingPhotoTransform)
                            .onClick(onClickInfo)
                            .onMilestoneWrapperPseudoDragStart(onMilestoneWrapperPseudoDragStart)
                            .onMilestoneWrapperPseudoDrag(onMilestoneWrapperPseudoDrag)
                            .onMilestoneWrapperPseudoDragEnd(onMilestoneWrapperPseudoDragEnd);

                        const goal = goalComponents[d.id]
                            .width(contentsWidth)
                            .height(bottomHeight)
                            .fontSizes(fontSizes.goal)
                            //.editable(editable)
                            //.scrollable(scrollable)
                            .editable(false)
                            .scrollable(false)
                            .onCtrlClick(onCtrlClick)


                        const kpis = kpisComponents[d.id]
                            .width(contentsWidth)
                            .height(bottomHeight) //will be full contentsheight if no media at top
                            //textinfoHeight is 0 if no media so its full contentsHeight in that case, same as bottomHeight
                            .expandedHeight(contentsHeight - getTextInfoHeight(d))
                            .kpiHeight(kpiHeight) //may be undefined
                            .fontSizes(fontSizes.kpis)
                            .kpiFormat(kpiFormat)
                            .editable(editable)
                            .scrollable(scrollable)
                            .profileIsSelected(selected === d.id)
                            .onUpdateSelected((profileId, kpiKey, shouldUpdateScroll, shouldUpdateDom, dimns) => {
                                selectedKpiKey = kpiKey;
                                //in reality, if profile pages have no media except the current page, then only that will updatedimns
                                //the 2nd condition checks if kpis are on the page, as otherwise it wont need to open anything
                                const profileDimnsShouldUpdate = profile => {
                                    const profileContainsKpis = currentPage.key === "profile" || profile.id === "current";
                                    return profileContainsKpis && getTopHeight(profile) !== 0;
                                }; 

                                data.filter(p => p.id !== profileId).forEach(p => {
                                    kpisComponents[p.id].selected(kpiKey, shouldUpdateScroll, shouldUpdateDom);
                                })

                                //slide stuff up on every card that needs to update (atm will only be current card)
                                containerG.selectAll("g.profile-card").filter(d => profileDimnsShouldUpdate(d)).selectAll("g.top")
                                    .transition()
                                    .duration(AUTO_SCROLL_DURATION)
                                    .delay(CONTENT_FADE_DURATION)
                                        .attr("transform", d => `translate(0,${kpiKey ? -contentsHeight/2 + getTextInfoHeight(d) : 0})`);
                                
                                containerG.selectAll("g.profile-card").filter(d => profileDimnsShouldUpdate(d)).selectAll("g.bottom")
                                    .transition()
                                    .duration(AUTO_SCROLL_DURATION)
                                    .delay(CONTENT_FADE_DURATION)
                                       .attr("transform", d => `translate(0,${kpiKey ? getTextInfoHeight(d) : getTopHeight(d)})`);

                                //parent needs to know so it can control how to handle the wrapperClick event
                                const profile = data.find(p => p.id === profileId);
                                const _dimns = !profile ? null : {
                                    widths:dimns.widths,
                                    margins:dimns.margins,
                                    heights: { ...dimns.heights, textInfo:getTextInfoHeight(profile) },
                                    profile: { x: profile.x, y:profile.y, width:profile.width, height:profile.height }
                                }
                                onUpdateSelectedKpi(profileId, kpiKey, _dimns);
                            })
                            .onCreateStep(onCreateStep)
                            .onEditStep((id, dimns) => {
                                //console.log("editStep selcetdProfile", selected)
                                //assume only one selected milestone
                                const profile = data.find(p => p.id === selected);
                                //console.log("profile-------", profile)
                                const _dimns = {
                                    ...dimns,
                                    profile: { x: profile.x, y:profile.y, width:profile.width, height:profile.height },
                                    heights: { 
                                        ...dimns.heights, 
                                        textInfo:getTextInfoHeight(profile) 
                                    }
                                }
                                onEditStep(id, _dimns)
                            })
                            .onUpdateStep(onUpdateStep)
                            .onUpdateSteps(onUpdateSteps)
                            .onDeleteStep(onDeleteStep)
                            .onCtrlClick(function(newDisplayFormat){
                                data.filter(profile => profile.id !== d.id).forEach(p => {
                                    kpisComponents[p.id].displayFormat(newDisplayFormat);
                                })
                                //trigger update across all cards
                                containerG.call(profileCards)
                                //pass to parent
                                onCtrlClick(newDisplayFormat);
                            })
                            .onSaveValue((valueObj, profileId, datasetKey, statKey, kpiKey, key) => {
                                //if profileid is current, swap it for the first future profile
                                const requiredProfileId = profileId === "current" ? data.find(p => p.isFuture).id : profileId;
                                onSaveValue(valueObj, requiredProfileId, datasetKey, statKey, kpiKey, key);
                            })
                            .onSetEditing(onSetEditing)
                            //pass scroll events on any kpiComponent to all other kpiComponents
                            .onZoomStart(function(e){
                                data.filter(p => p.id !== d.id).forEach(p => {
                                    kpisComponents[p.id].handleZoomStart.call(this, e)
                            })
                            })
                            .onZoom(function(e){
                                data.filter(p => p.id !== d.id).forEach((p,i) => {
                                    kpisComponents[p.id].handleZoom.call(this, e, i)
                            })
                            })
                            .onZoomEnd(function(e){
                                data.filter(p => p.id !== d.id).forEach(p => {
                                    kpisComponents[p.id].handleZoomEnd.call(this, e)
                            })
                            })
                            //.onClickKpi(onClickKpi)
                            .onDblClickKpi(onDblClickKpi);

                        //ENTER AND UPDATE
                        //overlays
                        /*
                        d3.select(this).select("rect.overlay")
                            .attr("width", width)
                            .attr("height", height)
                            .attr("x", -width/2)
                            .attr("y", -height/2)
                            .style("fill", OVERLAY.FILL)
                            .style("opacity", OVERLAY.OPACITY)*/
                        
                        d3.select(this).select("rect.top-overlay")
                            .attr("width", width)
                            .attr("height", topHeight)
                            .style("fill", OVERLAY.FILL)
                            .style("opacity", OVERLAY.OPACITY)
                            
                        d3.select(this).select("rect.bottom-overlay")
                            .attr("width", width)
                            .attr("height", bottomHeight)
                            .style("fill", OVERLAY.FILL)
                            .style("opacity", OVERLAY.OPACITY)

                        const contentsG = d3.select(this).select("g.profile-card-contents")
                            .attr("transform", d =>  `translate(${-contentsWidth/2},${-contentsHeight/2})`)
                        
                        const innerContentsG = contentsG.select("g.profile-card-inner-contents")

                        //status
                        //const currentColorSchemeOrange = "#D4AF37"
                        const lightGold = "#c9b037";
                        //const darkGold = "#af9500"
                        const lightSilver = "#d7d7d7";
                        //const darkSilver = "b4b4b4";
                        const gold = lightGold;
                        const silver = lightSilver;
                        const stroke = {
                            "fullyAchieved":{ stroke:gold, strokeWidth:15 },
                            "fullyOnTrack":{ stroke:gold, strokeWidth:10 },
                            "mostlyOnTrack":{ stroke:silver, strokeWidth:10 },
                            "partlyOnTrack":{ stroke:silver, strokeWidth:2.5 },
                            "offTrack":{ stroke:"none", strokeWidth:0 },
                            "severelyOffTrack":{ stroke:"none", strokeWidth:0 }
                        }

                        //rect sizes
                        innerContentsG.selectAll("rect.profile-card-bg")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)
                            .attr("stroke", "none")
                            .call(updateFill, { 
                                fill:d => d.id === selected ? COLOURS.selectedMilestone : COLOURS.milestone,
                                transition:{ duration: 300 }
                            })

                        //from https://www.schemecolor.com/gold-silver-and-bronze-color-palette.php#download
                        contentsG.selectAll("rect.profile-card-border")
                            .attr("width", contentsWidth)
                            .attr("height", contentsHeight)
                            .attr("stroke-width", stroke[d.profileProgressInfo?.status]?.strokeWidth || 0)
                            .attr("stroke", stroke[d.profileProgressInfo?.status]?.stroke || "none")
                            .call(updateFill, { fill:d => "none", transition:{ duration: 300 } })
                            .attr("filter", "url(#shine)")
                            
                    
                        // why is this too far down
                        innerContentsG.selectAll("g.info")
                            .attr("display", topHeight === 0 ? "none" : null)
                            .datum(d.info)
                            .call(profileInfo)

                        //the issue is this causes it to junp dwn when selctedmilestone changes, even if 
                        //a kpi is still selected
                        //soln 1 - used now - just do on enter
                        //soln 2 - could get selectedKpi from kpiscomponent, and adjust transform here accordingly
                        //for soln 2, prob best to move selectedKpi to this level too, and pass it through

                        //The cod below is because we need to keep the openKpi positions if an update occurs eg if user closes the card 
                        //but teh kpi is still selected -> then we want it to stay in the slided-up state
                        //FOR NOW, we copy the code from updateSelectedKpi handler above, but need to sort this.
                        //Also it may cause an issue with an update
                        const profileDimnsShouldUpdate = profile => {
                            const profileContainsKpis = currentPage.key === "profile" || profile.id === "current";
                            return profileContainsKpis && getTopHeight(profile) !== 0;
                        }; 
                        containerG.selectAll("g.profile-card").filter(d => profileDimnsShouldUpdate(d)).selectAll("g.top")
                            //.transition()
                            //.duration(AUTO_SCROLL_DURATION)
                            //.delay(CONTENT_FADE_DURATION)
                                .attr("transform", d => `translate(0,${selectedKpiKey ? -contentsHeight/2 + getTextInfoHeight(d) : 0})`);
                                
                        containerG.selectAll("g.profile-card").filter(d => profileDimnsShouldUpdate(d)).selectAll("g.bottom")
                            //.transition()
                            //.duration(AUTO_SCROLL_DURATION)
                            //.delay(CONTENT_FADE_DURATION)
                                .attr("transform", d => `translate(0,${selectedKpiKey ? getTextInfoHeight(d) : getTopHeight(d)})`);

                        const bottomG = innerContentsG.select("g.bottom")
                        //THIS WAS COMMENTED OUT!!!!!!!!!!!!!! MAYBE IT CAUSES A JUMP
                            .attr("transform", "translate(0," +(topHeight) +")");

                        const kpisG = bottomG.select("g.kpis-area").selectAll("g.kpis").data(currentPage.key === "profile" || d.isCurrent ? [1] : []);
                        kpisG.enter()
                            .append("g")
                                .attr("class", "kpis")
                                .merge(kpisG)
                                .datum(d.kpis)
                                .call(kpis);

                        kpisG.exit().remove();

                        const goalG = bottomG.selectAll("g.goal").data(currentPage.key === "goal" && !d.isCurrent ? [1] : []);
                        goalG.enter()
                            .append("g")
                                .attr("class", "goal")
                                .merge(goalG)
                                .datum(d.goal)
                                .call(goal);
                        
                        goalG.exit().remove();

                        //top right ctrls (dependent on each card)
                        let btnWidth = 25;
                        let btnHeight = 25;

                        const topRightBtnG = innerContentsG.select("g.top-right-ctrls")
                            .attr("transform", `translate(${contentsWidth}, ${0})`)
                            .selectAll("g.top-right-btn")
                            .data(ctrls(d).topRight, b => b.label)
                    
                        topRightBtnG.enter()
                            .append("g")
                                .attr("class", "top-right-btn")
                                .each(function(b){
                                    d3.select(this)
                                        .append("rect")
                                            .attr("fill", "transparent");

                                    d3.select(this)
                                        .append("path")
                                            .attr("transform", b.icon.transform || null)
                                            .attr("fill", COLOURS.btnIcons.default)
                                            .attr("stroke", COLOURS.btnIcons.default)
                                })
                                .merge(topRightBtnG)
                                .attr("transform", (b,i) => `translate(${-(i + 1) * btnWidth})`)
                                .each(function(b){
                                    d3.select(this).select("rect")
                                        .attr("x", -20)
                                        .attr("width", btnWidth + 20)
                                        .attr("height", btnHeight + 20);

                                    d3.select(this).select("path")
                                        .attr("transform", `translate(-15,10)`)
                                        .attr("d", b.icon.d)
                                })
                                .style("cursor", "pointer")
                                .on("click",(e,b) => { if(b.onClick){ b.onClick(b)} })
                                .on("mouseover", (e,b) => { if(b.onMouseover){ b.onMouseover(b)} })
                                .on("mouseout", (e,b) => { if(b.onMouseout){ b.onMouseout(b)} })

                        topRightBtnG.exit().remove(); 

                        const botRightBtnG = innerContentsG.select("g.bot-right-ctrls")
                            .attr("transform", `translate(${contentsWidth * 0.96}, ${(contentsHeight * 0.98) - btnHeight})`)
                            .selectAll("g.bot-right-btn")
                            .data(ctrls(d).botRight, b => b.label)
                    
                        botRightBtnG.enter()
                            .append("g")
                                .attr("class", "bot-right-btn")
                                .each(function(b){
                                    d3.select(this)
                                        .append("rect")
                                            .attr("fill", "transparent");

                                    d3.select(this)
                                        .append("g")
                                            .attr("class", "icon")
                                            //.attr("fill", COLOURS.btnIcons.default)
                                            //.attr("stroke", COLOURS.btnIcons.default)
                                })
                                .merge(botRightBtnG)
                                .attr("transform", (b,i) => `translate(${-(i + 1) * btnWidth})`)
                                .each(function(b){
                                    d3.select(this).select("rect")
                                        .attr("width", btnWidth * 1.1) //@todo - replqce x1.1 with proper measurements
                                        .attr("height", btnHeight * 1.1)

                                    d3.select(this).select("g.icon")
                                        //.style("stroke", b.styles.stroke)
                                        .style("fill", b.styles.fill)
                                        .html(b.icon.html)
                                })
                                .style("cursor", "pointer")
                                .on("click",(e,b) => { 
                                    //e.stopPropagation(); doesnt work
                                    //e.stopImmediatePropagation()2
                                    if(b.onClick){ b.onClick(b)} 
                                })
                                .on("mouseover", (e,b) => { if(b.onMouseover){ b.onMouseover(b)} })
                                .on("mouseout", (e,b) => { if(b.onMouseout){ b.onMouseout(b)} })

                        botRightBtnG.exit().remove(); 
                    })
                    //.call(updateHighlighted)
                    //.call(drag)
                    .each(function(d){

                    })
            profileCardG.exit().remove();

            d3.select("svg#milestones-bar").select(`#profile-card-clip`)
                .select("rect")
                    .attr("width", contentsWidth)
                    .attr("height", contentsHeight)

            function updateTransform(selection, options={}){
                const { x = d => d.x, y = d => d.y, scale = d => 1, transition, cb = () => {} } = options;
                let maxK = 1;
                selection.each(function(d){
                    const k = scale(d);
                    //set maxK so we know whether or not to scale up the formContainer
                    if(k > maxK){
                        maxK = k;
                    }
                    const scaledContentsWidth = contentsWidth * k;
                    const scaledContentsHeight = contentsHeight * k

                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${k})`)
                                .on("end", cb);

                        //react milestones - we dont apply scale as a transform because it effects the margin
                        //instead, use scaledValues
                        d3.select(`div#milestone-${d.id}`)
                            .transition()
                            .duration(200)
                                /*
                                .style("width", `${scaledContentsWidth}px`)
                                .style("height", `${scaledContentsHeight/2}px`)
                                .style("left", `${x(d) - scaledContentsWidth/2}px`)
                                .style("top", `${y(d)}px`)
                                */
                                .style("width", `${contentsWidth}px`)
                                .style("height", `${height/2 - 50}px`)
                                .style("left", `${x(d) - contentsWidth/2}px`)
                                .style("top", `${y(d)}px`)
                                .style("transform-origin", "top center")
                                .style("transform", ` scale(${k})`)

                    }else{
                        d3.select(this)
                            .attr("transform", `translate(${x(d)} , ${y(d)}) scale(${k})`);

                        //react milestones
                        d3.select(`div#milestone-${d.id}`)
                            /*
                            .style("width", `${scaledContentsWidth}px`)
                            .style("height", `${scaledContentsHeight/2}px`)
                            .style("left", `${x(d) - scaledContentsWidth/2}px`)
                            .style("top", `${y(d)}px`)
                            */
                            .style("width", `${contentsWidth}px`)
                            .style("height", `${height/2 - 50}px`)
                            .style("left", `${x(d) - contentsWidth/2}px`)
                            .style("top", `${y(d)}px`)
                            .style("transform-origin", "top center")
                            .style("transform", ` scale(${k})`)
                        
                        cb.call(this);
                    }
                })

                //form-container (there is only one of these)
                //note - scale is performed on outer-container so it is from same centre as the d3 card
                //@todo - not sure why transform-origin is different then for milestone div above
                if(transition){
                    d3.select(`div.form-outer-container`)
                        .transition()
                        .duration(200)
                            .style("transform", ` scale(${maxK})`)
                }else{
                    d3.select(`div.form-outer-container`)
                        .style("transform", ` scale(${maxK})`)
                }
            }

            function updateFill(selection, options={}){
                const { fill = d => d.colour || "none", transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(transition.duration || 200)
                                .attr("fill", fill(d))
                                .on("end", cb);
                    }else{
                        d3.select(this).attr("fill", fill(d))
                        cb.call(this);
                    }
                })
            }

            function updatePosition(selection, options={}){
                //console.log("uRD options", options)
                const { x = d => d.x || 0, y = d => d.y || 0, transition, cb = () => {} } = options;
                selection.each(function(d){
                    if(transition){
                        d3.select(this)
                            .transition()
                            .duration(200)
                                .attr("x", x(d))
                                .on("end", cb);
                    }else{
                        d3.select(this)
                            .attr("transform", y(d));
                        
                        cb.call(this);
                    }
                })
            }

            //EXIT
            profileCardG.exit().each(function(d){
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

            function dragStart(e , d){
                if(movable){
                    d3.select(this).raise();
                }
                onDragStart.call(this, e, d)
            }
            function dragged(e , d){
                //controlled components
                if(movable){
                    const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                    d3.select(this)
                        .attr("transform", "translate(" + (translateX +e.dx) +"," + (translateY + e.dy) +")")
                        //.call(updateTransform, { x: d => d.displayX })
                }
        
                //onDrag does nothing
                onDrag.call(this, e, d)
            }
    
            //note: newX and Y should be stored as d.x and d.y
            function dragEnd(e, d){
                //console.log("dragEnd", d.x)
                //on next update, we want aim dimns/pos to transition
                //shouldTransitionAim = true;
    
                if(enhancedDrag.isClick()) { return; }
    
                onDragEnd.call(this, e, d);
            }

            //DELETION
            let deleted = false;
            const svg = d3.select("svg");

            //longpress
            function longpressStart(e, d) {
                console.log("lp start")
                //todo - check defs appended, and use them here, then longopressDrag should trigger the delete of a goal
                //then do same for aims and links
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .attr("flood-opacity", 0.6)
                    .attr("stdDeviation", 10)
                    .attr("dy", 10);
                */
                d3.select(this).select("rect.profile-card-bg")
                    //.style("filter", "url(#drop-shadow)")
                    //.call(oscillator.start);

                longpressed = d;
                containerG.call(profileCards);

                onLongpressStart.call(this, e, d)
            };
            function longpressDragged(e, d) {
                if(deleted) { return; }

                //@todo - call dragged first, so that even as it disappears, it is moving away
                if(enhancedDrag.distanceDragged() > 200 && enhancedDrag.avgSpeed() > 0.08){
                    d3.select(this)
                        //.style("filter", "url(#drop-shadow)")
                        .call(oscillator.stop);

                    deleted = true;
                    d3.select(this)
                        .transition()
                        .duration(50)
                            .attr("opacity", 0)
                            .on("end", () => {
                                onDelete(d.id)
                            })
                }else{
                    dragged.call(this, e, d)
                }

                onLongpressDragged.call(this, e, d)
            };

            function longpressEnd(e, d) {
                console.log("lp end")
                if(deleted){ 
                    deleted = false;
                    return; 
                }
                /*
                svg.select("defs").select("filter").select("feDropShadow")
                    .transition("filter-transition")
                    .duration(300)
                        .attr("flood-opacity", 0)
                        .attr("stdDeviation", 0)
                        .attr("dy", 0)
                        .on("end", () => {
                            d3.select(this).style("filter", null);
                        });*/

                d3.select(this)
                    //.style("filter", "url(#drop-shadow)")
                    //.call(oscillator.stop);
                
                onLongpressEnd.call(this, e, d)
            };
        })
        //remove one-off settings
        longpressed = null;

        return selection;
    }
    
    //api
    profileCards.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return profileCards;
    };
    profileCards.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return profileCards;
    };
    profileCards.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = value;
        return profileCards;
    };
    profileCards.kpiHeight = function (value) {
        if (!arguments.length) { return fixedKpiHeight; }
        kpiHeight = value;
        return profileCards;
    };
    profileCards.fontSizes = function (values) {
        if (!arguments.length) { return fontSizes; }
        fontSizes = { ...fontSizes, ...values };
        return profileCards;
    };
    profileCards.currentPage = function (value) {
        if (!arguments.length) { return currentPage; }
        currentPage = value;
        return profileCards;
    };
    profileCards.expanded = function (value) {
        if (!arguments.length) { return expanded; }
        expanded = value;
        return profileCards;
    };
    profileCards.editable = function (value) {
        if (!arguments.length) { return editable; }
        editable = value;
        return profileCards;
    };
    profileCards.scrollable = function (value) {
        if (!arguments.length) { return scrollable; }
        scrollable = value;
        return profileCards;
    };
    profileCards.movable = function (value) {
        if (!arguments.length) { return movable; }
        movable = value;
        return profileCards;
    };
    profileCards.selected = function (value) {
        //console.log("profileCards selected....", value)
        if (!arguments.length) { return selected; }
        selected = value;
        return profileCards;
    };
    profileCards.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return profileCards;
    };
    profileCards.ctrls = function (f) {
        if (!arguments.length) { return ctrls; }
        ctrls = d => {
            const _ctrls = f(d);
            return {
                topLeft:_ctrls.topleft || [],
                topRight:_ctrls.topRight || [],
                botLeft:_ctrls.botleft || [],
                botRight:_ctrls.botRight || [],
            }
        }
        return profileCards;
    };
    profileCards.longpressed = function (value) {
        if (!arguments.length) { return longpressed; }
        longpressed = value;
        return profileCards;
    };
    profileCards.transformTransition = function (value) {
        if (!arguments.length) { return transformTransition; }
        //console.log("setting trans...", value)
        transformTransition = { 
            enter:value.enter,// || transformTransition.enter,
            update:value.update// || transformTransition.update
        }
        //console.log("Trans is now", transformTransition)
        return profileCards;
    };
    profileCards.yScale = function (value, key) {
        if (!arguments.length) { return yScale; }
        yScale = value;
        if(key) { yKey = key; }
        calcY = y => typeof d.y === "number" ? d.y : yScale(d[yKey]);

        return profileCards;
    };
    profileCards.xScale = function (value, key) {
        if (!arguments.length) { return xScale; }
        xScale = value;
        if(key) { xKey = key; }
        calcX = x => typeof d.x === "number" ? d.x : xScale(d[xKey]);

        return profileCards;
    };
    profileCards.onClick = function (value) {
        if (!arguments.length) { return onClick; }
        onClick = value;
        return profileCards;
    };
    profileCards.onClickInfo = function (value) {
        if (!arguments.length) { return onClickInfo; }
        onClickInfo = value;
        return profileCards;
    };
    profileCards.onClickKpi = function (value) {
        if (!arguments.length) { return onClickKpi; }
        if(typeof value === "function"){
            onClickKpi = value;
        }
        return profileCards;
    };
    profileCards.onDblClickKpi = function (value) {
        if (!arguments.length) { return onDblClickKpi; }
        onDblClickKpi = value;
        return profileCards;
    };
    profileCards.onCtrlClick = function (value) {
        if (!arguments.length) { return onCtrlClick; }
        onCtrlClick = value;
        return profileCards;
    };
    profileCards.onDblClick = function (value) {
        if (!arguments.length) { return onDblClick; }
        onDblClick = value;
        return profileCards;
    };
    profileCards.onDragStart = function (value) {
        if (!arguments.length) { return onDragStart; }
        if(typeof value === "function"){
            onDragStart = value;
        }
        return profileCards;
    };
    profileCards.onDrag = function (value) {
        if (!arguments.length) { return onDrag; }
        if(typeof value === "function"){
            onDrag = value;
        }
        return profileCards;
    };
    profileCards.onDragEnd = function (value) {
        if (!arguments.length) { return onDragEnd; }
        if(typeof value === "function"){
            onDragEnd = value;
        }
        return profileCards;
    };
    profileCards.onLongpressStart = function (value) {
        if (!arguments.length) { return onLongpressStart; }
        if(typeof value === "function"){
            onLongpressStart = value;
        }
        return profileCards;
    };
    profileCards.onLongpressDragged = function (value) {
        if (!arguments.length) { return onLongpressDragged; }
        if(typeof value === "function"){
            onLongpressDragged = value;
        }
        return profileCards;
    };
    profileCards.onLongpressEnd = function (value) {
        if (!arguments.length) { return onLongpressEnd; }
        if(typeof value === "function"){
            onLongpressEnd = value;
        }
        return profileCards;
    };
    profileCards.onMouseover = function (value) {
        if (!arguments.length) { return onMouseover; }
        if(typeof value === "function"){
            onMouseover = value;
        }
        return profileCards;
    };
    profileCards.onMouseout = function (value) {
        if (!arguments.length) { return onMouseout; }
        if(typeof value === "function"){
            onMouseout = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDragStart = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragStart; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragStart = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDrag = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDrag; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDrag = value;
        }
        return profileCards;
    };
    profileCards.onMilestoneWrapperPseudoDragEnd = function (value) {
        if (!arguments.length) { return onMilestoneWrapperPseudoDragEnd; }
        if(typeof value === "function"){
            onMilestoneWrapperPseudoDragEnd = value;
        }
        return profileCards;
    };
    profileCards.onDelete = function (value) {
        if (!arguments.length) { return onDelete; }
        if(typeof value === "function"){
            onDelete = value;
        }
        return profileCards;
    };
    profileCards.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){ onAddLink = value; }
        return profileCards;
    };
    profileCards.onSaveValue = function (value) {
        if(typeof value === "function"){
            onSaveValue = value;
        }
        return profileCards;
    };
    profileCards.onStartEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onStartEditingPhotoTransform = value;
        }
        return profileCards;
    };
    profileCards.onEndEditingPhotoTransform = function (value) {
        if(typeof value === "function"){
            onEndEditingPhotoTransform = value;
        }
        return profileCards;
    };
    profileCards.onSetEditing = function (value) {
        if (!arguments.length) { return onSetEditing; }
        if(typeof value === "function"){
            onSetEditing = value;
        }
        return profileCards;
    };
    profileCards.onUpdateSelectedKpi = function (value) {
        if(typeof value === "function"){
            onUpdateSelectedKpi = value;
        }
        return profileCards;
    };
    profileCards.onCreateStep = function (value) {
        if (!arguments.length) { return onCreateStep; }
        onCreateStep = value;
        return profileCards;
    };
    profileCards.onEditStep = function (value) {
        if(typeof value === "function"){
            onEditStep = value;
        }
        return profileCards;
    };
    profileCards.onUpdateStep = function (value) {
        if (!arguments.length) { return onUpdateStep; }
        onUpdateStep = value;
        return profileCards;
    };
    profileCards.onUpdateSteps = function (value) {
        if (!arguments.length) { return onUpdateSteps; }
        onUpdateSteps = value;
        return profileCards;
    };
    profileCards.onDeleteStep = function (value) {
        if (!arguments.length) { return onDeleteStep; }
        onDeleteStep = value;
        return profileCards;
    };
    profileCards.applyOverlay = function(selection, options={}){
        const { include, onClick=() => {} } = options;
        selection.selectAll("rect.overlay")
            .filter(function(){
                if(!include){ return true; }
                const className = d3.select(this).attr("class");
                let shouldInclude = false;
                include.forEach(nameToInclude => {
                    if(className.includes(nameToInclude)){
                        shouldInclude = true;
                    }
                })
                return shouldInclude;
            })
            .attr("display", null)
            .on("click", onClick)
    }
    profileCards.removeOverlay = function(selection, include){
        selection.selectAll("rect.overlay").attr("display", "none");
    }
    profileCards.endEditing = function(milestoneId){
        profileInfoComponents[milestoneId].endEditing();
    }
    return profileCards;
}
