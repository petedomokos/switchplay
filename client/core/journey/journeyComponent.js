import * as d3 from 'd3';
import "snapsvg-cjs";
//import "d3-selection-multi";
import channelsLayout from "./channelsLayout";
import axesLayout from "./axesLayout";
import milestonesLayout from "./milestonesLayout";
import linksLayout from "./linksLayout";
import aimsLayout from './aimsLayout';
import axesComponent from "./axesComponent";
import contractsComponent from "./contractsComponent";
import profileCardsComponent from "./profileCardsComponent";
import linksComponent from "./linksComponent";
import aimsComponent from './aimsComponent';
import menuBarComponent from './menuBarComponent';
import { updatePos } from "./domHelpers"
//import { COLOURS, DIMNS } from "./constants";
import { addWeeks } from "../../util/TimeHelpers"
import { zoomLevel, DEFAULT_D3_TICK_SIZE, WIDGET_WIDTH, WIDGET_HEIGHT, WIDGET_MARGIN, COLOURS, FONTSIZES, DIMNS, AVAILABLE_GOAL_MULTIPLIER, grey10 } from "./constants";
import { pointIsInRect, distanceBetweenPoints, } from './geometryHelpers';
import dragEnhancements from './enhancedDragHandler';
import { getTransformationFromTrans } from './helpers';

/*
    *** = needed for Brian to test the basic design of a canvas (no measures, just planets, aims, and links)
    ** = needed for Brian to test assignment of measures and targs meaningfully (ie user sees targets in nice visuals) (but not hooked up to dataset measures)
    * = needed to 

    
    DOING NOW/NEXT

    new bigs since store
     - new measure form isnt up-to-date ( problem existed before store change)
    checks
     - make sure onClosePlaneForm is called whenever user clicks away from it, for name and targ. same aim form and measures form
     - when saved journey returns from server, do we need any otehr processing except adding id if new?
     - deal with this line about 557  state.journeyData.planets = stateData.journey.planets.map(p => { return p.id === d.id ? d : p });
     (shouldnt mutate state here)
     
     
     have put in place api and server. now need o try it out,
     rename an empty journey canvas, just enough to to 1 letter and see if it saves.
    when it works, then remove saveJurney call from naming functions, until form is closed,
    to limit api calls to one per rename.
    - then, get api /server saving aims, goals etc

    PRIORITY BUGS/ISSUES
    - context menu clicks sometimes stop working - may be to do with dimns of button?

    PERSISTENCE
     - *** api to save a canvas/aims/planets (with a parents array for when it is target of a link / or do we need link for something?)
     - ***persist to mongodb server/database

    DEPLOY
     - chase up azure ppl
     - decide azure or heroku or netlify?

    MILESTONE: BRIAN NOW ABLE TO TEST CANVAS DESIGN 
    (aims, goals, links, measure creation, targets, NOT datapoints or imported measures)
    ----------------------------------------------

    MEASURES AND DATAPOINTS
     - adding datapoints from the canvas -> by dragging bars?
     -importing datasets to use their measures

    

    COMPLETION
     - improve mock comp data function so more flexible
    - planet and aim completion animations (see paper working)
    - show the animation and cmpletion for only 1 measure when 1 measure is selected

    

    OTHER DATA VIEWS (see sketches)
     - carousel with left/right arrows

    TOUCH/IPAD/SAFARI
    - replace dragOver (using mouseover) of ellipse with pointIsInEllipse which uses equation of ellipse

    - ipad testing

    OPEN CHANNELS
    consider removing the whole thing of planets sliding into neaest channel end. Instead, do it like inDesign, where the user is in charge but
    //we help them by highlighting the slot when they get near it, and if its near it then it slides in, and that becomes it's actual date 
    // rather than having an actual and a display date. can do same with others. 
    //basically also we highlight alignments like two aims so they cn be aligned in same way.
    This reduces complexity as we only have to deal with zoom and open channels, but ech goal and aim only has 1 value for each position.
    BUT... leave for now coz the benefit of current approach is as user zooms int o get a weekly view, we can show it meanignfully
    so eventually we will be miving between daily, weekly, monthly an deven annual views.

    //todo - consider the issue when draggin aim when a channel is open, planets at different locations in the aim may be conflicted about 
    //whether to slide left or right to get to nearest channel. if all channels closed, this wont happen.
    But in this case we simply slide teh channel wider too, and then when channel is closed, aim shortens too.
    I mean that is what should happen for an open channel anyway.
    - integrate aim with open channel (and fix the existing bug around this) (and turn openLinks back on)
    (note - need to think about how it will work in context of aims - maybe it just stays the same - but what if zoomed out so 
        goals not displayed, just aim title displayed?)

    BACKLOG:
    - on hover aim, we should sow a deletion icon in the corner, same with planets
    - zooming into goal causes an error
    - implement delate by longpress+drag fast
    - handle user draggin aim top-corner below bottom of aim -> what should happen?
    - aim name margin left should be scaled by zoom scale so it doesnt appear to shoft across to the right
    - replace reference to planets with goals everywhere
    - consider stopping planet and link transitions when loading an existing canvas
     - planet ellipse core-inner solid-bg shows thorugh arounfd teh edge of the one on top
      - when zooming out a lot, can no longer see planet behind it's name form
     - make planet disappear first when converting to aim
     - semantic zoom transitoins - make a transform funcitn which can be called with settings for what kind of transitoin wyou want,
     as well as .translate(x, y) and .scale(k) etc
     - consider this frpom Journey.jsx... journey.modalData(modalData).... could even have a 2nd option to all these settings, which is false by default, which is to update dom 
      //so journey.modalData(modalData, true) would be all we have to do here, instead of call the update again as we do below
    - aims should maybe increase height if a planet is droppped into it but is on the edge?
     
    BUGS & ISSUES
     - learn about the 'media' tag - do we need to specify it in teh html tag so sizes are consistent? Are sizes consistent atm on differnet devices/browsers?
     //decide which devices and browsers to suppport - probably just chrome on all devices, including ipad
     - zoom out aim, planets slide a little before disappearing, so not in sync with aim name disappearing
     - make some links in aims. drag planets around - sometimes teh links refuse to update - seems t be when src-targ flips, or when we have circular refs
      - show aim Nameform when converting it from planet if it is unnamed perhaps
      - if not allowing links to be created from aims, then replace the drag handle corners with just a boundary all the way around each aim
    */

const widgets = [
    { key:"aim", r:10, width:30, height:20, rx:10, ry:10, fill: grey10(5) },
    { key:"profile", r:2, width:20, height:30, rx:2, ry:2, fill: "orange" },
    { key:"contract", r:2, width:20, height:25, rx:2, ry:2, fill: "white", stroke:"orange", opacity:"1" },
]

/*

*/
export default function journeyComponent() {
    // dimensions
    let margin = {left:0, right:0, top: 0, bottom:0};
    let planetMargin = {left:5, right:5, top: 5, bottom:5};
    let width = 4000;
    let height = 2600;
    let screen = { isLarge: false };
    let contentsWidth;
    let contentsHeight;

    //canvas will be a lot bigger than the contentsWidth and contentsHeight
    // of svg container, and can be panned/zoomed
    let canvasWidth;
    let canvasHeight;

    let menuBarData = {};
    let measuresOpen;
    let journeysOpen;
    let menuBarHeight;
    let kpiFormat;

    const widgetsX = 10;
    let widgetsY;

    function updateDimns(){
        contentsWidth = width - margin.left - margin.right;
        contentsHeight = height - margin.top - margin.bottom;
        canvasWidth = contentsWidth;// * 5;
        menuBarHeight = menuBarData.displayedBar ? DIMNS.menuBar.height : 0
        //note- for some reason, reducing canvasHeight doesnt seem to move axis properly, so instead just subtract menuBarHeight for axis translateY
        canvasHeight = contentsHeight;// - menuBarHeight; //this should be lrge enough for all planets, and rest can be accesed via pan
        widgetsY = canvasHeight - DIMNS.xAxis.height - menuBarHeight;
    };

    let aligned = false;
    let withCompletionPaths = false;

    let enhancedZoom = dragEnhancements().longpressThreshold(200);

    const myChannelsLayout = channelsLayout();
    const myAxesLayout = axesLayout();
    const myContractsLayout = milestonesLayout();
    const myProfileCardsLayout = milestonesLayout();
    const myAimsLayout = aimsLayout();
    const myLinksLayout = linksLayout();

    const axes = axesComponent();
    const contracts = contractsComponent();
    const profileCards = profileCardsComponent();
    const links = linksComponent();
    const aims = aimsComponent();
    const openedLinks = {};
    const menuBar = menuBarComponent();

    //api
    let selectedPending;
    let selected;
    let editing;
    let preEditZoom;
    let zoomViewLevel;

    //updating react settings
    let onSetKpiFormat = function(){};
    let onSelectKpiSet = function(){};
    //contracts
    let handleCreateContract = function(){};
    let onDeleteContract = function(){};

    //profiles
    let handleCreateProfile = function(){};
    let onDeleteProfile = function(){};

    let handleCreateAim = function(){};
    let updateAim = function(){};
    let onDeleteAim = function(){};

    let createPlanet = function(){};
    //@todo - change name to updatePlanetState and so on to distinguish from dom changes eg updateplanets could be either
    let updatePlanet = function(){};
    let updatePlanets = function(){};
    let addMeasureToPlanet = function(){};
    let deletePlanet = function (){};
    let onAddLink = function(){};
    let deleteLink = function(){};
    let updateChannel = function(){};
    let setModalData = function(){};
    let setImportingMeasures= function(){};
    let setZoom = function(){};
    let startEditPlanet = function (){};
    let endEditPlanet = function (){};
    let createJourney = function (){};
    let createContract = function (){};
    let createAim = function (){};
    let createProfile = function (){};
    let updateSelected = function (){};
    let setActiveJourney = () => {};

    let updateState = () => {};

    //dom
    let svg;
    let contentsG;
    let axesG;
    let canvasG;
    let widgetsG;

    let data;

    let timeScale;
    let zoomedTimeScale;
    let yScale;
    let zoomedYScale;

    let zoom;
    let applyZoomX;
    let applyZoomY;
    let currentZoom = d3.zoomIdentity;

    //data
    let channelsData;
    let contractsData;
    let profileCardsData;
    let aimsData;
    let goalsData; //note - this is just derived from aimsData merging all planets - will remove
    let linksData;
    let modalData;

    //state
    let hoveredPlanetId;
    let draggedWidget;

    function journey(selection) {
        updateDimns();

        selection.each(function (journeyData) {
            data = journeyData;
            //console.log("journey update...", data)
            if(!svg){
                //enter
                init.call(this);
                update()
            }else{
                //update
                update({ planets:{ transitionUpdate: true  }, links:{ transitionUpdate: true  } })
            }
        })

        function update(settings={}){
            const { changed="" } = settings;
            const options = {
                aims:{
                    goals:{
                        transitionUpdate:!(changed === "zoom")
                    }
                },
                links:{
                    transitionUpdate:!(changed === "zoom")
                }
            }

            svg
                .attr("width", width)
                .attr("height", height)

            const { k } = currentZoom;
            yScale = d3.scaleLinear().domain([0, 100]).range([margin.top, margin.top + contentsHeight])

            //start by showing 5 channels, from channel -1 to channel 3
            const startDisplayedChannelNr = -1;
            const endDisplayedChannelNr = 3;
            const nrDisplayedMonths = endDisplayedChannelNr - startDisplayedChannelNr + 1; //add 1 for channel 0
            const widthPerMonth = contentsWidth / nrDisplayedMonths;

            const domain = [
                addWeeks(-52, data.channels.find(ch => ch.nr === startDisplayedChannelNr).startDate),
                data.channels.find(ch => ch.nr === endDisplayedChannelNr).endDate
            ]
            const range = [
                -widthPerMonth * 12,
                contentsWidth
            ]
            timeScale = d3.scaleTime().domain(domain).range(range)

            zoomedTimeScale = currentZoom.rescaleX(timeScale);
            zoomedYScale = currentZoom.rescaleY(yScale);

            myChannelsLayout.scale(zoomedTimeScale).currentZoom(currentZoom).contentsWidth(contentsWidth);
            channelsData = myChannelsLayout(data.channels);

            const axesData = myAxesLayout(channelsData.filter(ch => ch.isDisplayed));
            axes
                .scale(zoomedTimeScale)
                .tickSize(canvasHeight + DEFAULT_D3_TICK_SIZE)

            //note- for some reason, reducing canvasHeight doesnt seem to move teh xis properly, so instead just subtract menuBarHeight
            axesG
                .attr("transform", "translate(0," +(contentsHeight - DIMNS.xAxis.height - menuBarHeight) +")")
                .datum(axesData)
                .call(axes);

            // Zoom configuration
            //@todo - check extent is correct
            const extent = [[0,0],[canvasWidth, canvasHeight]];
            enhancedZoom
                //.dragThreshold(200) //dont get why this has to be so large
                //.beforeAll(() => { updateSelected(undefined); })
                .onClick(handleCanvasClick)
                .onLongpressStart(function(e,d){
                    if(!enhancedZoom.wasMoved()){
                        handleCanvasClick(e, d, true)
                        //longpress toggles isOpen
                        //const chan = pointChannel({ x:e.sourceEvent.layerX, y:e.sourceEvent.layerY });
                        //if(!chan){ return; }
                        //const { id, isOpen } = chan;
                        //there must be a diff between this code and the udate code above, or the way axis is updwted, because in zoomed state
                        //sometimes the opening of c channel is only corrected on state update
                        //updateChannel({ id, isOpen:!isOpen })
                    }
                })

            zoom = d3.zoom()
                //.scaleExtent([1, 3])
                .extent(extent)
                .scaleExtent([0.125, 10])
                .on("start", enhancedZoom())
                .on("zoom", enhancedZoom(function(e){
                    if(e.sourceEvent){
                        //user has manually zoomed so close selected/editing
                        //selected = undefined;
                        if(editing){
                            endEditPlanet(undefined);
                        }
                        if(selected){
                            updateSelected(undefined);
                        }
                        //editing = undefined;
                        //setModalData(undefined);
                    }
                    currentZoom = e.transform;
                    setZoom(currentZoom);
                    update({changed: "zoom"});
                }))
                .on("end", enhancedZoom())

            //svg.call(zoom)
            contentsG.call(zoom)
                .on("dblclick.zoom", null)
                //.on("dblclick", null)
            //.on("wheel.zoom", null)

            //@todo - change name - split longoress and click , instead of using this shouldCreateGoal thing for longpress
            function handleCanvasClick(e, d, shouldCreateGoal){
                // console.log("canvas click editing", editing)
                // console.log("canvas click aim sel", aims.selected())
                //@todo - either remove selected in journey, or remove selected state in aims.
                
                if(editing){
                    endEditPlanet(d);
                }
                //note - on start editing, selected is already set to undefined
                if(selected || aims.selected().goal || aims.selected().aim){
                    updateSelected(undefined);
                    //if bar open, we dont want the click to propagate through
                }
                //create a goal even if something else was selected
                if(shouldCreateGoal){
                    const x = e.sourceEvent.layerX;
                    const y = e.sourceEvent.layerY; 
                    const goalAim = aimsData
                        .filter(a => a.id !== "main")
                        .find(a => pointIsInRect({ x, y }, { x: a.displayX, y:a.y, width: a.displayWidth, height:a.height }))

                    createPlanet(zoomedTimeScale.invert(trueX(e.sourceEvent.layerX)), zoomedYScale.invert(e.sourceEvent.layerY), goalAim?.id)
                }
            }

            //ELEMENTS
            //helpers
            const { trueX, pointChannel } = channelsData;

            //zoomViewLevel
            const newZoomViewLevel = zoomLevel(currentZoom.k);
            if(newZoomViewLevel !== zoomViewLevel){ zoomViewLevel = newZoomViewLevel; }

            //data
            updateContractsData();
            updateProfileCardsData();
            updateAimsData();
            updateLinksData();
            //components
            updateContracts();
            updateProfileCards();
            updateAims();
            updateLinks();

            //if adding a new planet, we must select on next update once x and y pos are defined, as they are used for form position
            if(selectedPending){
                const goal = goalsData.find(p => p.id === selectedPending);
                selectedPending = undefined;
                editing = goal;
                //updateSelected(goal);
                updateModalData(goal);
            }

            function updateContractsData(){
                //note - planetsLayout was also taking in .selected for siSelected n planets, but not needed
                myContractsLayout
                    .aligned(aligned);
                
                contractsData = myContractsLayout(data.contracts);
                //console.log("contractsData",contractsData);
            }

            function updateProfileCardsData(format){
                //note - planetsLayout was also taking in .selected for siSelected n planets, but not needed
                myProfileCardsLayout
                    .format(kpiFormat)
                    .aligned(aligned)
                    .datasets(data.datasets)
                    .info(data.userInfo);
                
                profileCardsData = myProfileCardsLayout(data.profiles);
                //console.log("profileCardsData",profileCardsData);
            }

            function updateAimsData(){
                //note - planetsLayout was also taking in .selected for siSelected n planets, but not needed
                myAimsLayout
                    .aligned(aligned)
                    .canvasDimns({ width:canvasWidth, height: canvasHeight })
                    .currentZoom(currentZoom)
                    .timeScale(zoomedTimeScale)
                    .yScale(zoomedYScale)
                    .channelsData(channelsData);
                
                aimsData = myAimsLayout(data);
                //console.log("aimsData", aimsData)
                //temp - until we remove places that use it as a dependency
                goalsData = aimsData.map(a => a.planets).reduce((a, b) => [...a, ...b], []);

            }


            function updateLinksData(){
                //data
                myLinksLayout
                    .selected(selected?.id)
                    .currentZoom(currentZoom)
                    .channelsData(channelsData)
                    .aimsData(aimsData);

                linksData = myLinksLayout(data.links);
                //console.log("linksData", linksData)

            }

            function updateContracts(){
                //component
                contracts
                    .xScale(zoomedTimeScale)
                    .yScale(zoomedYScale)
                    .width(DIMNS.contract.width * k)
                    .height(DIMNS.contract.height * k)
                    .fontSizes(FONTSIZES.contract(k))
                    .onDragEnd(function(e,d){
                        const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                        const _contract = { 
                            id:d.id,
                            date:zoomedTimeScale.invert(translateX),
                            yPC:zoomedYScale.invert(translateY)
                        }

                        updateState({ contracts:[_contract] })
                        
                    })
                    .onDelete(id => {
                        selected = undefined;
                        editing = undefined;
                        onDeleteContract(id);
                    });

                //render
                //@todo - prob need to move links to above aims but below planets somehow
                //otherwise they will be hidden by any background of the aims
                //or maybe have a separate links component for each aim, unless we are allowing links from a goal
                //in one aim to a goal in another aim
                const contractsG = canvasG.selectAll("g.contracts").data([contractsData])
                contractsG
                    .join("g")
                    .attr("class", "contracts")
                    .call(contracts, options.contracts)
            }

            function updateProfileCards(){
                //component
                profileCards
                    .width(DIMNS.profile.width * k)
                    .height(DIMNS.profile.height * k)
                    .kpiHeight(10 * k)
                    .fontSizes(FONTSIZES.profile(k))
                    .xScale(zoomedTimeScale)
                    .yScale(zoomedYScale)
                    .onCtrlClick((e,d) => {
                        onSetKpiFormat(d.key)
                    })
                    .onDblClickKpi((e,d) => {
                        console.log("dbl click kpi", d)
                        onSelectKpiSet(d);
                    })
                    .onDragEnd(function(e,d){
                        const { translateX, translateY } = getTransformationFromTrans(d3.select(this).attr("transform"));
                        const _profile = { 
                            id:d.id,
                            date:zoomedTimeScale.invert(translateX),
                            yPC:zoomedYScale.invert(translateY)
                        }

                        updateState({ profiles:[_profile] })
                        
                    })
                    .onDelete(id => {
                        selected = undefined;
                        editing = undefined;
                        onDeleteProfile(id);
                    });

                //render
                //@todo - prob need to move links to above aims but below planets somehow
                //otherwise they will be hidden by any background of the aims
                //or maybe have a separate links component for each aim, unless we are allowing links from a goal
                //in one aim to a goal in another aim
                const profileCardsG = canvasG.selectAll("g.profile-cards").data([profileCardsData])
                profileCardsG
                    .join("g")
                    .attr("class", "profile-cards")
                    .call(profileCards, options.profileCards)
            }
            

            function updateAims(){
                //helper
                const getView = () => {
                    switch(zoomViewLevel){
                        case -1:{ return { name: true }; }
                        case 0:{ return { name: true, goals:{}} }
                        case 1 :{ return { name: true, goals: { details: true }} }
                        default:{ return; }
                    }
                }
    
                aims
                    .view(getView())
                    //.selected(selected) dont want to overide selections each time
                    .selectedMeasure(measuresOpen?.find(m => m.id === menuBar.selected()))
                    .contentsToShow(aim => modalData?.d.id === aim.id ? "none" : "basic")
                    .goalContentsToShow(g => modalData?.d.id === g.id ? "none" : "basic")
                    .timeScale(zoomedTimeScale)
                    .yScale(zoomedYScale)
                    .channelsData(channelsData)
                    .linksData(linksData)
                    .nameSettings(d => {
                        let fontSize;
                        let width;
                        let height;
                        let margin;
                        if(d.id === "main"){
                            fontSize = FONTSIZES.journey.name;
                            width = DIMNS.journey.name.width
                            height = DIMNS.journey.name.height
                            //shift left to avoid burger menu when smaller screen
                            margin = { 
                                ...DIMNS.journey.name.margin,
                                left: screen.isLarge ? DIMNS.journey.name.margin.left : DIMNS.burgerBarWidth 
                            } 
                        } else if(getView().goals){
                            //name is top-left
                            fontSize = d3.max([k * FONTSIZES.aim.name.standard, FONTSIZES.aim.name.min]);
                            width =  d3.max([k * DIMNS.aim.name.width.standard, DIMNS.aim.name.width.min]); 
                            height = d3.max([k * DIMNS.aim.name.height.standard, DIMNS.aim.name.height.min]);
                            margin = DIMNS.aim.name.margin;
                        } else {
                            //name is centred
                            fontSize = d3.max([k * FONTSIZES.aim.centredName.standard, FONTSIZES.aim.centredName.min]);
                            width =  d3.max([k * DIMNS.aim.name.width.standard, DIMNS.aim.centredName.width.min]); 
                            height = d3.max([k * DIMNS.aim.name.height.standard, DIMNS.aim.centredName.height.min]);
                            margin = DIMNS.aim.name.margin;
                        }
                        return { fontSize, width, height, margin }
                    })
                    .planetSettings({
                        fontSize: d3.max([FONTSIZES.planet.name.min, k * FONTSIZES.planet.name.standard]),
                        availablePlanetSizeMultiplier: AVAILABLE_GOAL_MULTIPLIER / k
                    })
                    .onDeleteAim((aimId) => {
                        selected = undefined;
                        editing = undefined;
                        onDeleteAim(aimId);
                    })
                    .onSetEditing((d) => {
                        editing = d;
                        updateModalData(d);
                    })
                    //.onUpdateAim(function(){ })
                    //.onClick(handleCanvasClick)
                    .onLongpressStart((e,d) => handleCanvasClick(e, d, true))
                    .onDragStart(function(e, d){
                        //aim is raised already in aimComponent
                    })
                    //.onDblClickName((e,d) => {
                        //editing = d;
                        //updataModalData(d); 
                        //updateSelected(d); 
                    //})
                    .onDrag(function(e, aim){
                        //links
                        //this is the dragged aim, so we get the planets from it
                        d3.select(this.parentNode).selectAll("g.planet")
                            .each(function(p){
                                //update links with this planet as src
                                d3.selectAll("g.link")
                                    .filter(l => l.src.id === p.id)
                                    .selectAll("line") //comp line too
                                    .call(updatePos, { x1:() => p.x, y1: () => p.y }, false)

                                //update links with this planet as targ
                                d3.selectAll("g.link")
                                    .filter(l => l.targ.id === p.id)
                                    .selectAll("line") //can do comp line too
                                    .call(updatePos, { x2:() => p.x, y2: () => p.y }, false)

                            })
                    })
                    .onDragEnd(function(e, d, outsidePlanetsToUpdate){
                        const { id, displayWidth, height, displayX, y } = d;

                        //grab the latest planet x and y's from dom, as teh aim d.planets have not been updated
                        const insidePlanetsToUpdate = d3.select(this.parentNode).selectAll("g.planet").data()
                            .map(p => ({
                                id:p.id,
                                targetDate:zoomedTimeScale.invert(trueX(p.x)), 
                                yPC:zoomedYScale.invert(p.y)
                            }));

                        const endX = displayX + displayWidth;
                        const endY = y + height;

                        //update aim
                        //problem - which we update first, the other will have an update with old data!
                        // unless we specify useEffect dependencies,
                        // or just have one state object
                        const _aim = { 
                            id:d.id,
                            startDate:zoomedTimeScale.invert(displayX),
                            endDate:zoomedTimeScale.invert(endX),
                            startYPC:zoomedYScale.invert(y),
                            endYPC:zoomedYScale.invert(endY)
                        }

                        const _goals = [ ...insidePlanetsToUpdate, ...outsidePlanetsToUpdate ];

                        updateState({ aims:[_aim], goals:_goals })
                    })
                    .onResizeDragEnd(function(e, aim, planetDs){
                        //turn off transitions in the aim comp
                        aims.transitionsOn(false);
                        //use the latest planetDs from dom, as the aim d.planets have not been updated
                        const _goals = planetDs.map(p => ({ id:p.id, aimId:p.aimId }));

                        //update aim
                        const { id, displayWidth, height, displayX, y } = aim;
                        //we now set the actual width to be the displaywidth which was set to be users drag
                        const endX = displayX + displayWidth;
                        const endY = y + height;

                        //problem - startDate not updating
                        
                        const _aim = { 
                            id:aim.id, 
                            startDate:zoomedTimeScale.invert(displayX),
                            endDate:zoomedTimeScale.invert(endX),
                            startYPC:zoomedYScale.invert(y),
                            endYPC:zoomedYScale.invert(endY)
                        };
                        updateState({ aims:[_aim], goals:_goals })
                    })
                    //.onMouseover(() => {})
                    //.onMouseout(() => {})
                    .onDblClickGoal((e,d) => {
                        editing = d;
                        updateModalData(d);
                        //updateSelected(d); 
                    })
                    //@TODO WARNING - may cause touch issues as drag handlers are updated - need this to not update planetsComp or at least not teh drag handlers
                    .onDragGoalStart(function(){ 
                        //console.log("drg goal start")
                        updateSelected(undefined); })
                    .onDragGoal(function(e , d, /*shouldUpdateSelected = true*/){ //pass in onDragGoal
                        //console.log("journey drgGoal")
                        //if(shouldUpdateSelected){
                            //updateSelected(undefined);
                            //warning - may interrupt drag handling with touch
                            //links layout needs updated planet position and targetDate
                        //}
                        //temp
                        data.goals = data.goals.map(p => { return p.id === d.id ? d : p });
                        //update aimsData, which also updates goalsData
                        updateAimsData();
                        updateLinksData(); //uses the new goalsData
                        canvasG.selectAll("g.links")
                            .data([linksData])
                            .join("g")
                            .attr("class", "links")
                            .call(links, { transitionUpdate: false }) //no transitions

                    })
                    .onDragGoalEnd(function(e , d){
                        //console.log("journey drgGoalEnd", d.id, d.x)
                        selected = undefined;

                        //targetDate must be based on trueX
                        //updatePlanet({ id:d.id, targetDate:timeScale.invert(trueX(d.x)), yPC:yScale.invert(d.y) });
                        updatePlanet({ 
                            id:d.id,
                            aimId:d.aimId,
                            targetDate:zoomedTimeScale.invert(trueX(d.x)), 
                            yPC:zoomedYScale.invert(d.y)
                        });
                    })
                    //todo - move to aims - planet has seelctedmeasure so when it is hovered, it can work out 
                    //whetehr or not to highlight. so no need fro journeyComponwnt to know about a mouseoverGoal
                    //can be doen in planetsComponent, just need to pass it draggedMeasure too. ATM it only has selectedMeasure.
                    /*
                    .onMouseoverGoal(function(e,d){
                        const selectedMeasureIsInPlanet = !!d.measures.find(m => m.id === bar.selected());
                        if(bar.selected() && (selectedMeasureIsInPlanet || bar.dragged())){
                            hoveredPlanetId = d.id;
                            //planets.highlight(hoveredPlanetId, bar.dragged());
                            aim.highlightPlanet(hoveredPlanetId);
                        }
                    })
                    .onMouseoutGoal(function(e,d){
                        if(hoveredPlanetId){
                            hoveredPlanetId = undefined;
                            planets.unhighlight(d.id);
                        }
                    })
                    */
                    .deletePlanet(id => {
                        selected = undefined;
                        editing = undefined;
                        deletePlanet(id);
                    })
                    .updatePlanet(updatePlanet)
                    .startEditPlanet(startEditPlanet)
                    .onAddLink((d1, d2) => {
                        //check its not a link between a goal and its own aim
                        if(d1?.aimId === d2.id || d2.aimId === d1.id) { return; }

                        const date = d => d.dataType === "planet" ? d.targetDate : d.startDate;
                        const src = d3.least([d1,d2], d => date(d)).id;
                        const targ = src === d1.id ? d2.id : d1.id;
                        onAddLink({ src, targ })
                    })

                //render
                const aimsG = canvasG.selectAll("g.aims").data([aimsData]);
                aimsG.enter()
                    .append("g")
                    .attr("class", "aims")
                    .merge(aimsG)
                    .call(aims, options.aims)

            }

            function updateLinks(){
                //component
                links
                    .withCompletion(withCompletionPaths)
                    .selectedMeasure(measuresOpen?.find(m => m.id === menuBar.selected()))
                    .yScale(zoomedYScale)
                    //.timeScale(timeScale)
                    .timeScale(zoomedTimeScale)
                    .strokeWidth(k * 0.5)
                    .deleteLink(id => {
                        selected = undefined;
                        deleteLink(id);
                    })
                    .onClick((e,d) => { updateSelected(d);})

                //render
                //@todo - prob need to move links to above aims but below planets somehow
                //otherwise they will be hidden by any background of the aims
                //or maybe have a separate links component for each aim, unless we are allowing links from a goal
                //in one aim to a goal in another aim
                const linksG = canvasG.selectAll("g.links").data([linksData])
                linksG.enter()
                    .insert("g", "g.aims")
                        .attr("class", "links")
                        .merge(linksG)
                        .call(links, options.links)
            }
            
            //openedLink
            /*
            const openedLinkWidth = 80 * k;
            const openedLinkHeight = 30 * k;
            const openedLinkG = canvasG.selectAll("g.opened-link").data(linksData.filter(l => l.isOpen), l => l.id)
            openedLinkG.enter()
                .append("g")
                .attr("class", "opened-link")
                .attr("opacity", 0)
                .each(function(d) { 
                    openedLinks[d.id] = openedLinkComponent();
                    d3.select(this)
                        .transition()
                            .delay(200)
                            .duration(200)
                            .attr("opacity", 1)
                 })
                .merge(openedLinkG)
                .attr("transform", d => "translate("+ (d.centre[0])+ "," + (d.centre[1]- openedLinkHeight/2) +")")
                .each(function(d) {
                    d3.select(this)
                        .call(openedLinks[d.id]
                            .width(openedLinkWidth)
                            .height(openedLinkHeight)
                            .barChartSettings({
                                labels : { fontSize:5 * k, width:30 * k },
                                axis: { show:false }
                                //{ show: true, ticks: { fontSize: 8 * (k ** 2) } }
                            })
                            .onMouseover(function(linkId, goalId){
                                //@todo - make this same goal highlighted in othe rlinks that it is in too
                                for (const [id, openedLink] of Object.entries(openedLinks)) {
                                //Object.entries(openedLinks).forEach((id, openedLink) => {
                                    if(id !== linkId && openedLink.activeGoalId()){
                                        openedLink.activeGoalId(undefined);
                                    }
                                }
                            }))
                })

            openedLinkG.exit()
                .transition()
                    .duration(200)
                    .attr("opacity", 0)
                    .on("end", function(){ d3.select(this).remove() });

            */

            //todo - enter measuresG here with measures component.
            //transition it in and out with data([measuresOpen]) or soemthing like that so its empty
            //and removes if no measuresOpen. Note, could be all measuires open or just one goals' measures

            const { displayedBar } = menuBarData;
            let displayedMenuBarData = [];
            if(displayedBar === "measures"){
                displayedMenuBarData.push({
                    key:"measures",
                    title:"Measures",
                    subtitle:"All", //this will show the goal or path etc if restricted
                    itemsData:menuBarData.data
                })
            }else if(displayedBar === "journeys"){
                displayedMenuBarData.push({
                    key:"journeys",
                    title:"Journeys",
                    subtitle:"All", //this will show the goal or path etc if restricted
                    //menuBar expects items to have an id not an _id
                    itemsData:menuBarData.data.map(j => ({ ...j, id:j._id })),
                    //cant create new if temp already exists as that is new
                    //@todo - pass this in as a setting func instead
                    withNewButton:!menuBarData.data.find(j => j._id === "temp")
                })
                //set selected to be the current journey
                menuBar.selected(data._id)
            }

            let prevDraggedOverPlanet;
            let menuItemWasMoved = false;

            const menuBarG = contentsG.selectAll("g.menu-bar").data(displayedMenuBarData, d => d.key)
            menuBarG.enter()
                .append("g")
                    .attr("class", "menu-bar")
                    .merge(menuBarG)
                    //.attr("transform", "translate(0," + contentsHeight +")")
                    //note - in journey component, margin bottom is used for the axis. 
                    .attr("transform", "translate(0," +(contentsHeight - menuBarHeight) +")")
                    .call(menuBar
                        .width(contentsWidth)
                        .height(menuBarHeight)
                        .getItemsDraggable(d => d.key === "measures")
                        .openImportItemsComponent(() => {
                            //note - eventually will have option to pass in filter settings eg tags like fitness, or groupId
                            setModalData({ importing: true, filters:[] })
                        })
                        //why update aims???
                        .onUpdateSelected(updateAims)
                        .onNewItemButtonClick((item) => {
                            if(displayedBar === "measures"){
                                updateAims();
                                //setModalData({ measureOnly: true });
                            }else{
                                createJourney();
                            }
                        })
                        .onItemClick((e, item) => {
                            if(displayedBar === "measures"){
                                //setModalData({ measureOnly: true, d:item });
                            }else{
                                //journeys
                                //open journey
                                setActiveJourney(item._id);
                            }
                        })
                        .onItemDragStart((e, m) => {
                            updateSelected(undefined);
                            aims.stopShowingAvailabilityStatus(goalsData);
                            //goalIsAvailable = !goalContainsMeasure(m);
                            //todo - move to aims, and work out why measure not being added to goal
                            //planets.withRing(false);
                        })
                        .onItemDrag((e, m) => {
                            //for now, offsetX and y are used to convert sourceEvent pos to canvas pos
                            const pt = { x: e.sourceEvent.offsetX, y: e.sourceEvent.offsetY };
                            const planetInnerCircleRadius = d3.min([DIMNS.planet.width, DIMNS.planet.height]);
                            const draggedOverPlanet = goalsData.find(p => distanceBetweenPoints(pt, p) < planetInnerCircleRadius);

                            //@todo - fix enhancedDrag so it only calls dragStart when its a drag, then can do the following in dragStart
                            if(!menuItemWasMoved){
                                //first drag event
                                aims.stopShowingAvailabilityStatus(goalsData);
                                menuItemWasMoved = true;
                                prevDraggedOverPlanet = draggedOverPlanet;
                                return;
                            }

                            //next drag events
                            //PREV
                            //stop showing status of available draggedOverPlanet
                            if(prevDraggedOverPlanet && prevDraggedOverPlanet.id !== draggedOverPlanet?.id){
                                aims.stopShowingAvailabilityStatus([prevDraggedOverPlanet]);
                            }
                            //NEW
                            //show draggedOverPlanet as available if it is
                            if(draggedOverPlanet && draggedOverPlanet.id !== prevDraggedOverPlanet?.id){
                                aims.showAvailabilityStatus([draggedOverPlanet]);
                            }
                            //update
                            prevDraggedOverPlanet = draggedOverPlanet;
                            //todo - lookinti what m is  -and follow teh updateProcess to see why measures stays as []
                            //planets.withRing(true);
                        })
                        .onItemDragEnd((e, m) => {
                            //stop showing unavailability
                            //aims.stopShowingAvailabilityStatus(goalsData.filter(p => !goalIsAvailable(p)));
                            //stop showing availability of draggedOverPlanet
                            //todo - return a Promise instead of using cbs
                            aims.stopShowingAvailabilityStatus(goalsData, () => {
                                //@todo - add
                                if(prevDraggedOverPlanet){
                                    const { id, measures } = prevDraggedOverPlanet;
                                    const updatedPlanetMeasures = [ ...measures, { id: m.id}]
                                    //addMeasureToPlanet(prevDraggedOverPlanet.id, m.id);
                                    updatePlanet({ id, measures:updatedPlanetMeasures });
                                    updateSelected({ ...prevDraggedOverPlanet, measures:updatedPlanetMeasures })
                                    //clean-up
                                    prevDraggedOverPlanet = undefined;
                                }
                            })
                            menuItemWasMoved = false;
                        }))
            
            menuBarG.exit().remove();      
        }

        updateWidgets();

        function updateWidgets(){
            const widgetDrag = d3.drag()
                .on("start", dragWidgetStart)
                .on("drag", draggedWidget)
                .on("end", dragWidgetEnd);
            //bg

            widgetsG.attr("transform", "translate("+widgetsX +"," +widgetsY +")");

            const widgetG = widgetsG.selectAll("g.widget").data(widgets, d => d.key)
            widgetG.enter()
                .append("g")
                    .attr("class", "widget")
                    .each(function(d, i){
                        const widgetG = d3.select(this)
                            .attr("fill", d.fill)
                            .attr("stroke", d.stroke || "none")
                            .attr("stroke-width", 0.3)
                            .style("cursor", "pointer")
                            .attr("opacity", d.opacity || 0.5);

                        //aim
                        if(d.key === "aim"){
                            widgetG
                                .append("rect")
                                    .attr("x", (WIDGET_WIDTH - d.width) / 2)
                                    .attr("width", d.width)
                                    .attr("height", d.height)
                                    .attr("rx", d.rx)
                                    .attr("ry", d.ry)
                                    
                        }
                        if(d.key === "profile"){
                            widgetG
                                .append("rect")
                                    .attr("x", (WIDGET_WIDTH - d.width) / 2)
                                    .attr("width", d.width)
                                    .attr("height", d.height)
                                    .attr("rx", d.rx)
                                    .attr("ry", d.ry);
                        }
                        if(d.key === "contract"){
                            widgetG
                                .append("rect")
                                    .attr("x", (WIDGET_WIDTH - d.width) / 2)
                                    .attr("width", d.width)
                                    .attr("height", d.height)
                                    .attr("rx", d.rx)
                                    .attr("ry", d.ry);
                        }
                    })
                    .merge(widgetG)
                    .attr("transform", (d,i) => "translate(0," +((- (i + 1) * WIDGET_HEIGHT) + WIDGET_MARGIN.top) +")")
                    .call(widgetDrag)

                    let cloneG;
                    let wasMoved = false;
                    function dragWidgetStart(e,d){
                        //create a clone 
                        cloneG = d3.select(this)
                            .clone(true)
                            .attr("opacity", 1)
                    }
                    function draggedWidget(e,d){
                        wasMoved = true;
                        const { translateX, translateY } = getTransformationFromTrans(cloneG.attr("transform"));
                        const newX = translateX + e.dx;
                        const newY = translateY + e.dy;
                        //drag the clone
                        cloneG.attr("transform", "translate("+newX +"," +newY +")");
                    }
                    function dragWidgetEnd(e,d){
                        // console.log("drag end", d)
                        //remove the clone
                        cloneG.remove();

                        const startingHeight = d.key === "aim" ? DIMNS.aim.initHeight : DIMNS.profile.height;

                        //cant use e as the finishing position, as need to add the widgetsG position
                        //(could have made widgetsG the drag continer, but then would have had to subtract it from the first dx/dy
                        const widgetsTrans = getTransformationFromTrans(d3.select("g.widgets").attr("transform"));
                        const widgetTransX = widgetsTrans.translateX;
                        const widgetTransY = widgetsTrans.translateY;
                        let pos;
                        if(!wasMoved){
                            const xShift = d.key === "aim" ? WIDGET_WIDTH + 30 : WIDGET_WIDTH + 30 + DIMNS.profile.width/2;
                            pos = { x: widgetTransX + xShift, y: widgetTransY - startingHeight };
                        }else{
                            pos = { x: widgetTransX + e.x, y: widgetTransY + e.y };
                            //reset
                            wasMoved = false;
                        }
                        if(d.key === "aim"){
                            createAim(pos);
                        }else if(d.key === "profile"){
                            createProfile(pos);
                        }else if(d.key === "contract"){
                            createContract(pos);
                        }
                    }
        }

        function init(){
            svg = d3.select(this)
                
            svg
                .append("defs")
                .call(appendDefs);

            contentsG = svg
                .append("g")
                    .attr("class", "contents")
                    .attr("transform", "translate(" +margin.left +"," +margin.top +")");

            canvasG = contentsG.append("g").attr("class", "canvas");

            //canvas rect
            canvasG 
                .append("rect")
                    .attr("width", canvasWidth)
                    .attr("height", canvasHeight * 5)
                    .attr("fill", COLOURS?.canvas || "#FAEBD7");

            axesG = contentsG.append("g").attr("class", "axes");

            widgetsG = contentsG.append("g").attr("class", "widgets")

            widgetsG
                .append("rect")
                    .attr("class", "bg")
                    .attr("y", - widgets.length * WIDGET_HEIGHT)
                    .attr("width", WIDGET_WIDTH)
                    .attr("height", widgets.length * WIDGET_HEIGHT)
                    .attr("fill", COLOURS?.canvas || "#FAEBD7")
                    //.attr("stroke", "black");

        }

        //defs
        function appendDefs(defs){
            // shadow filter def
            const filter = defs.append("filter")
                .attr("id", "drop-shadow")
                .attr("height", "140%");
    
            filter.append("feDropShadow")
                .attr("in", "SourceAlpha")
                .attr("stdDeviation", 10)
                .attr("dy", 10)
                .attr("flood-opacity", 0.6)
                .attr("result", "shadow");
    
            const feMerge = filter.append("feMerge");
    
            feMerge.append("feMergeNode")
                .attr("in", "shadow");
    
            feMerge.append("feMergeNode")
                .attr("in", "SourceGraphic");
        }

        updateSelected = (d) => {
            // console.log("updatesel", d)
            //@todo - choose between storing selected her ein journey or in aims and links 
            selected = d;
            if(d?.dataType === "planet" || d?.dataType === "aim"){
                aims.selected(d);
            }
            if(!d){
                if(aims.selected().goal || aims.selected().aim){
                    aims.selected(null);
                    //manually call if not editing as no modal data change will not trigger re-render
                    if(!editing) { canvasG.selectAll("g.aims").call(aims); }
                }
                return;
            }

            if(editing){
                updateModalData();
            }
        }

        function updateModalData(d){
            if(!d) {
                setModalData(null);
                return; 
            }
            //open name form too, but as selected rather than editing
            const measureIsOnPlanet = d.dataType === "planet"? d.measures.find(d => d.id === menuBar.selected()) : false;
            const measure = measureIsOnPlanet && measuresOpen?.find(m => m.id === menuBar.selected());
            //could be an aim or a planet
            const modalData = measure ? { d, measure, nameAndTargOnly: true } : { d, nameOnly:true };
            setModalData(modalData);
        }

        //helpers
        applyZoomX = x => (x + currentZoom.x) / currentZoom.k;
        applyZoomY = y => (y + currentZoom.y) / currentZoom.k;
        startEditPlanet = (d) => {
            //hide nameform immediately
            setModalData(undefined);
            editing = d;
            updateSelected(undefined);
            preEditZoom = currentZoom;

            svg.selectAll("g.planet")
                .filter(p => p.id !== d.id)
                .transition()
                    .duration(200)
                    .attr("opacity", 0);

            svg.selectAll("g.link")
                .transition()
                    .duration(200)
                    .attr("opacity", 0);
            
            svg.selectAll("g.opened-link")
                .transition()
                    .duration(200)
                    .attr("opacity", 0);

            svg.transition().duration(750).call(
                zoom.transform, 
                d3.zoomIdentity.translate(
                    applyZoomX(-d.x + d.rx(contentsWidth)/3), 
                    applyZoomY(-d.y + d.ry(contentsHeight)/3)
                ))
                .on("end", () => {
                    //error - this now uses currentZoom instead of the new position
                    setModalData(d);
                })
        }

        endEditPlanet = (d) => {
            setModalData(undefined)
            editing = undefined;
            //zoom is only applied for full edit, not if its nameOnly
            /*
            if(preEditZoom){
                svg.transition().duration(750).call(
                    zoom.transform, 
                    d3.zoomIdentity
                        .translate(preEditZoom.x, preEditZoom.y)
                        .scale(preEditZoom.k))
                        .on("end", function(){
                            if(d){
                                svg.selectAll("g.planet")
                                    .filter(p => p.id !== d.id)
                                    .transition()
                                        .duration(300)
                                        .attr("opacity", 1)
                                
                                svg.selectAll("g.link")
                                    .transition()
                                        .duration(200)
                                        .attr("opacity", 1)
                                    
                                svg.selectAll("g.opened-link")
                                    .transition()
                                        .duration(200)
                                        .attr("opacity", 1)
                            }
                        })
            }
            */
            //updateSelected(undefined);
            //reset
            //preEditZoom = undefined;
        }

        createAim = function(pos){
            //todo - transition from icon dimns
            const width = DIMNS.aim.initWidth
            const height = DIMNS.aim.initHeight;
            const aim = {
                startDate:zoomedTimeScale.invert(pos.x - WIDGET_WIDTH/2),
                endDate:zoomedTimeScale.invert(pos.x + width),
                startYPC:zoomedYScale.invert(pos.y - WIDGET_HEIGHT/2),
                endYPC:zoomedYScale.invert(pos.y + height)
            }

            //calculate here which planets are in based on the actual x (not displayX)
            const planetIdsInAim = d3.selectAll("g.planet")
                .filter(g => pointIsInRect(g, { x: pos.x, y:pos.y, width, height }))
                .data()
                .map(g => g.id);

            updateSelected(undefined);       
            handleCreateAim(aim, planetIdsInAim);   
        }

        createContract = function(pos){
            const contract = {
                date:zoomedTimeScale.invert(pos.x),
                yPC:zoomedYScale.invert(pos.y)
            }

            updateSelected(undefined);       
            handleCreateContract(contract);   
        }

        createProfile = function(pos){
            const profile = {
                date:zoomedTimeScale.invert(pos.x),
                yPC:zoomedYScale.invert(pos.y)
            }

            updateSelected(undefined);       
            handleCreateProfile(profile);   
        }

        return selection;
    }

    //api
    journey.margin = function (value) {
        if (!arguments.length) { return margin; }
        margin = { ...margin, ...value};
        return journey;
    };
    journey.width = function (value) {
        if (!arguments.length) { return width; }
        width = value;
        return journey;
    };
    journey.height = function (value) {
        if (!arguments.length) { return height; }
        height = value;
        return journey;
    };
    journey.screen = function (value) {
        if (!arguments.length) { return screen; }
        screen = value;
        return journey;
    };
    journey.selected = function (goalId, selectOnNextUpdate = true) {
        if (!arguments.length) { return selected; }
        //note - must get goal from goalsData so it has x and y
        if(selectOnNextUpdate){
            selectedPending = goalId;
        }else{
            updateSelected(goalsData.find(g => g.id === goalId));
        }
        //selected = value;
        return journey;
    };
    journey.menuBarData = function (value) {
        if (!arguments.length) { return menuBarData; }
        const { displayedBar, data } = value;
        menuBarData = value;
        measuresOpen = displayedBar === "measures" ? data : undefined;
        journeysOpen = displayedBar === "journeys" ? data : undefined;
        return journey;
    };
    journey.measuresOpen = function (value) {
        if (!arguments.length) { return measuresOpen; }
        measuresOpen = value;
        return journey;
    };
    journey.modalData = function (value) {
        if (!arguments.length) { return modalData; }
        modalData = value;
        return journey;
    };
    journey.aligned = function (value) {
        if (!arguments.length) { return aligned; }
        aligned = value;
        return journey;
    };
    journey.withCompletionPaths = function (value) {
        if (!arguments.length) { return withCompletionPaths; }
        withCompletionPaths = value;
        return journey;
    };
    journey.kpiFormat = function (value) {
        if (!arguments.length) { return kpiFormat; }
        kpiFormat = value;
        return journey;
    };
    journey.onSetKpiFormat = function (value) {
        if (!arguments.length) { return onSetKpiFormat; }
        if(typeof value === "function"){
            onSetKpiFormat = value;
        }
        return journey;
    };
    journey.onSelectKpiSet = function (value) {
        if (!arguments.length) { return onSelectKpiSet; }
        if(typeof value === "function"){
            onSelectKpiSet = value;
        }
        return journey;
    };
    journey.createJourney= function (value) {
        if (!arguments.length) { return createJourney; }
        if(typeof value === "function"){
            createJourney = value;
        }
        return journey;
    };
    journey.updateState = function (value) {
        if (!arguments.length) { return updateState ; }
        if(typeof value === "function"){
            updateState = value;
        }
        return journey;
    };
    journey.handleCreateAim = function (value) {
        if (!arguments.length) { return handleCreateAim; }
        if(typeof value === "function"){
            handleCreateAim = value;
        }
        return journey;
    };
    journey.handleCreateContract = function (value) {
        if (!arguments.length) { return handleCreateContract; }
        if(typeof value === "function"){
            handleCreateContract = value;
        }
        return journey;
    };
    journey.onDeleteContract = function (value) {
        if (!arguments.length) { return onDeleteContract; }
        if(typeof value === "function"){
            onDeleteContract = value;
        }
        return journey;
    };
    journey.handleCreateProfile = function (value) {
        if (!arguments.length) { return handleCreateProfile; }
        if(typeof value === "function"){
            handleCreateProfile = value;
        }
        return journey;
    };
    journey.onDeleteProfile = function (value) {
        if (!arguments.length) { return onDeleteProfile; }
        if(typeof value === "function"){
            onDeleteProfile = value;
        }
        return journey;
    };
    journey.updateAim = function (value) {
        if (!arguments.length) { return updateAim; }
        if(typeof value === "function"){
            updateAim = value;
        }
        return journey;
    };
    journey.onDeleteAim = function (value) {
        if (!arguments.length) { return onDeleteAim; }
        if(typeof value === "function"){
            onDeleteAim = value;
        }
        return journey;
    };
    journey.createPlanet = function (value) {
        if (!arguments.length) { return createPlanet; }
        if(typeof value === "function"){
            createPlanet = value;
        }
        return journey;
    };
    journey.updatePlanet = function (value) {
        if (!arguments.length) { return updatePlanet; }
        if(typeof value === "function"){
            updatePlanet = value;
        }
        return journey;
    };
    journey.updatePlanets = function (value) {
        if (!arguments.length) { return updatePlanets; }
        if(typeof value === "function"){
            updatePlanets = value;
        }
        return journey;
    };
    journey.addMeasureToPlanet = function (value) {
        if (!arguments.length) { return addMeasureToPlanet; }
        if(typeof value === "function"){
            addMeasureToPlanet = value;
        }
        return journey;
    };
    journey.deletePlanet = function (value) {
        if (!arguments.length) { return deletePlanet; }
        if(typeof value === "function"){
            deletePlanet = value;
        }
        return journey;
    };
    journey.onAddLink = function (value) {
        if (!arguments.length) { return onAddLink; }
        if(typeof value === "function"){
            onAddLink = value;
        }
        return journey;
    };
    journey.deleteLink = function (value) {
        if (!arguments.length) { return deleteLink; }
        if(typeof value === "function"){
            deleteLink = value;
        }
        return journey;
    };
    journey.setModalData = function (value) {
        if (!arguments.length) { return setModalData; }
        if(typeof value === "function"){
            setModalData = value;
        }
        return journey;
    };
    journey.setActiveJourney = function (value) {
        if (!arguments.length) { return setActiveJourney; }
        if(typeof value === "function"){
            setActiveJourney = value;
        }
        return journey;
    };
    journey.setImportingMeasures = function (value) {
        if (!arguments.length) { return setImportingMeasures; }
        if(typeof value === "function"){
            setImportingMeasures = value;
        }
        return journey;
    };
    journey.setZoom = function (value) {
        if (!arguments.length) { return setZoom; }
        if(typeof value === "function"){
            setZoom = value;
        }
        return journey;
    };
    journey.updateChannel = function (value) {
        if (!arguments.length) { return updateChannel; }
        if(typeof value === "function"){
            updateChannel = value;
        }
        return journey;
    };
    journey.endEditPlanet = function(){ endEditPlanet() }
    return journey;
}
