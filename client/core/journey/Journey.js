import React, { useEffect, useState, useRef, useCallback } from 'react'
//import { useStateWithCallbackLazy } from 'use-state-with-callback';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import { createId, createColour, findFirstFuturePlanet, updatedState } from './helpers';
import journeyComponent from "./journeyComponent"
import { addMonths, startOfMonth, idFromDates } from '../../util/TimeHelpers';
import NameForm from "./form/NameForm";
import MeasureForm from "./form/MeasureForm";
import TargetForm from './form/TargetForm';
import Form from "./form/Form";
import ImportMeasures from './ImportMeasures';
import MilestonesBar from './MilestonesBar';
import KpiView from './KpiView';
import { hydrateJourneyData } from "./hydrate";
import { DIMNS, FONTSIZES, grey10 } from './constants';

const mockMeasures = [
	{ id:"mock1", name:"Puts Per Round", desc: "nr of puts in a round" },
	{ id:"mock2", name:"Drive 1", desc: "nr D1s to Fairway" },
	{ id:"mock3", name:"Drive 2", desc: "nr D2s to Fairway" }
]


const mockDatasets = [
  { 
    _id: "606b6aef720202523cc3589d", 
    name:"Press ups", 
    measures:[
      { 
        _id:"606b6aef720202523cc3589e", 
        name:"Reps", 
        unit:"reps", 
        fullNameShort:"Press-ups", 
        fullNameLong:"Nr of Press-ups in 1 Min",
        bands:[ { min:"0", max:"60" } ],
        standards:[ { name:"minimum", value:"0" }],
      }
    ],
    datapoints:[
      { 
        isTarget:false,
        player: "", 
        date:"2021-03-31T18:26:00.000+00:00",
        values:[
          { 
            measure:"606b6aef720202523cc3589e", 
            value:"38" ,
            key:"reps"
          }
        ]
      }
      //add target datapoints here when a future profile card kpi targets
      //only need to create it when we actually have a target set ie on teh lng run, this 
      // will be when user has dragged a kpi bar to vary it. For now, it is when we set it manually here
      // if there is no target kpi for specific date, then the future profile card defaults to the latest datapoint BEFORE the 
      // card date, whether this be a target, ot if no target, then teh latest actual datapoint.
      //also consider, if it is an actaul datapoint, we may want to use teh best score rather than the latest,
      // or the median avg of the previous 3.
    ]
  }
]

const newJourney = { _id:"temp", contracts:[], profiles:[], aims:[], goals:[], links:[], measures:mockMeasures}

const useStyles = makeStyles((theme) => ({
  root: {
    width:"100%",
    height:"100%",
    position:"relative",
    //marginLeft:DIMNS.journey.margin.left, 
    //marginRight:DIMNS.journey.margin.right,
    //marginTop:DIMNS.journey.margin.top, 
    //marginBottom:DIMNS.journey.margin.bottom,
  },
  overlay:{
    //position:"absolute",
    background:grey10(9),
    border:"solid",
    width:"100%",
    height:"100%",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  svg:{
    //position:"absolute"
  },
  btn:{
    width:DIMNS.ctrls.btnWidth,
    height:DIMNS.ctrls.btnHeight,
    marginRight:"5px",
    fontSize:FONTSIZES.ctrls.btn,
  },
  modal:{
      position:"absolute",
      left:props => props.modal?.left,
      top:props => props.modal?.top,
      width:props => props.modal?.width, 
      height:props => props.modal?.height
  },
  targModal:{
    position:"absolute",
    left:0,
    top:props => props.modal?.targTop,
    width:props => props.modal?.width, 
    height:props => props.modal?.height
  },
  ctrls:{
    display:"flex",
    justifyContent:"space-between"
  },
  leftCtrls:{
    display:"flex"
  },
  rightCtrls:{
    display:"flex",
    justifyContent:"flex-end"
  }
}))

const now = new Date();
const startOfCurrentMonth = startOfMonth(now)
const prevMonths = 12;
const futureMonths = 36;

const numberMonths = prevMonths + futureMonths;
const initChannels = d3.range(numberMonths)
  .map(n => n - prevMonths)
  .map(nr => {
    const startDate = addMonths(nr, startOfCurrentMonth);
    const endDate = addMonths(nr + 1, startOfCurrentMonth);
    return {
      nr,
      startDate,
      endDate,
      isOpen:false,
      id:idFromDates([startDate, endDate])
    }
  })

//width and height may be full screen, but may not be
const Journey = ({ data, userInfo, userKpis, datasets, availableJourneys, screen, width, height, save, setActive, closeDialog }) => {
  // console.log("Journey data", data)
  //console.log("Journey avail", availableJourneys)
  const hydratedData = hydrateJourneyData(data, userKpis, datasets);
  const { _id, userId, name, contracts, profiles, aims, goals, links, measures } = hydratedData;
  const [journey, setJourney] = useState(null);
  const [channels, setChannels] = useState(initChannels);
  const [withCompletionPaths, setWithCompletionPath] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [modalData, setModalData] = useState(undefined);
  //for now, displayedBar is always milestones
  const [displayedBar, setDisplayedBar] = useState("milestones");
  //const [displayedBar, setDisplayedBar] = useState("");
  const [kpiFormat, setKpiFormat] = useState("target-completion");
  const selectedKpi = typeof displayedBar === "object" && displayedBar.kpi ? displayedBar.kpi : null;
  //KpiView will display an entire kpiSet, keyed by milestoneId
  const selectedKpiSet = selectedKpi?.kpiSet;
  const shouldShowOverlay = displayedBar === "milestones" || selectedKpiSet;

  //kpiViewData is based on selectedKpiSet, profiles and userKpis
  //todo - finish this - needs the datasetId and the measureId from the kpi. kaybe just grab it from the first profile
  const kpiSetName = kpi => {
    const { datasetId, statId } = kpi;
    const dataset = datasets.find(dset => dset._id === datasetId);
    const stat = dataset?.measures.find(m => m._id === statId);
    return stat?.fullNameLong
  }
  //need to know which date/profile is selected too -
  // this also comes from teh kpi that is passed through, as it will have that date
  const kpiViewData = !selectedKpiSet ? null : profiles.map(p =>  ({
    ...p.kpis.find(kpi => kpi.kpiSet === selectedKpiSet),
    date:p.date,
    //key can just be the milestoneId in this case
    key:p.id,
  }));

  const shouldD3UpdateRef = useRef(true);

  const ctrlsHeight = 0;//10;
  const journeyWidth = width - DIMNS.journey.margin.left - DIMNS.journey.margin.right
  const journeyHeight = height - DIMNS.journey.margin.top - DIMNS.journey.margin.bottom - ctrlsHeight;
  let styleProps = {}

  if(modalData) {
      //todo - handle aim nameOnly case
      const { nameOnly, nameAndTargOnly, d } = modalData;

      if(nameOnly || nameAndTargOnly){
            //could be aim or planet, but use planet width and height as a guide for both
            //@todo - have more rigorous dimns
            const { width, height } = DIMNS.form.single;
            const goalNameX = d => d.x - width/2;
            const goalNameY = d => d.y - height/2;
            const aimNameX = d => (aligned ? d.goalFitX : d.x) + DIMNS.aim.name.margin.left;
            const aimNameY = d => d.y + DIMNS.aim.name.margin.top;

            const journeyNameLeft = screen.isLarge ? DIMNS.journey.name.margin.left : DIMNS.burgerBarWidth;
            const journeyNameTop = DIMNS.journey.name.margin.top;
            const journeyNameWidth = DIMNS.form.journeyName.width;
            const journeyNameHeight = DIMNS.form.journeyName.height;

            styleProps = {
                modal:{
                  width: d.id === "main" ? journeyNameWidth : width,
                  height: d.id === "main" ? journeyNameHeight : height,
                  //@todo - sort this out...for now, planet has x whereas aim has goalFitX potentially
                  left:(d.dataType === "planet" ? goalNameX(d) : (d.id === "main" ? journeyNameLeft : aimNameX(d))) + "px",
                  top:(d.dataType === "planet" ? goalNameY(d) : (d.id === "main" ? journeyNameTop : aimNameY(d))) + "px",
                  targTop:"20px"
                }
            }
      }else{
            //full form
            const width = d3.min([journeyWidth * 0.725, 500]); 
            const height = d3.min([journeyHeight * 0.725, 700]);
            styleProps = {
                modal:{
                  width,
                  height,
                  left:((journeyWidth - width) / 2) + "px",
                  top:((journeyHeight - height) / 2) +"px",
                }
            }
      }
  };

  //console.log("styleProps", styleProps)
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const modalDimnsRef = useRef({ width:500, height:700 });


  //@todo - make a more robust id function - see my exp builder code
  const nrGoalsCreated = useRef(goals.length);

  useEffect(() => {
    const width = d3.min([journeyWidth * 0.725, 500]);
    const height = d3.min([journeyHeight * 0.725, 700]);
    modalDimnsRef.current = { 
      width,
      height,
      left:((journeyWidth - width) / 2) + "px",
      top:((journeyHeight - height) / 2) + "px"
    }
  }, [journeyWidth, journeyHeight])

  //overlay
  useEffect(() => {
    if(!overlayRef.current){return; }
    d3.select(overlayRef.current)
      .style("display", shouldShowOverlay ? "flex" : "none");

    d3.select(containerRef.current)
      .attr("display", shouldShowOverlay ? "none" : "initial");

  }, [shouldShowOverlay])

 //init journey
  useEffect(() => {
    if(!containerRef.current){return; }
    const journey = journeyComponent();
    setJourney(() => journey);
  }, [])

  //render and update journey
  useEffect(() => {
    if(!containerRef.current || !journey){return; }
    if(!shouldD3UpdateRef.current){
      //reset so always true by default on next state update
      shouldD3UpdateRef.current = true;
      return;
    }

    let menuBarData = displayedBar && ["journeys", "measures"].includes(displayedBar) ? { displayedBar } : {};
    if(displayedBar === "journeys"){
      //On first load for a user with no saved journeys, this intial journey is not yet saved to store, so it wont be in availableJourneys, so we add it
      const allUserJourneys = availableJourneys.length === 0 ? [ ...availableJourneys, data] : availableJourneys;
      menuBarData = { ...menuBarData, data: allUserJourneys, hoverEnabled:false };
    }else if(displayedBar === "measures"){
      menuBarData = { ...menuBarData, data: measures }
    }

    // todo - put thes einto here...profilecardsData and contractsData - x and y will depend on whether it is displayed in profiles bar or in canvas
    //also render the overlay always but fade it in and out then in a separate useeffect set display to none/init based on displayedBar property
    //also need to clean it up in the returned object from the use effect
    //profilesbarLayout takes contarctsand profileCards data and merges them into one, 
    //in the order that they will be rendered in teh bar, and assigns new x/y s to them
    //const myProfilesBarLayout = profilesBarLayout()
      //.cardWidth(50)
      //.cardHeight(100);

    //for bar layouts, x and y can also be a funcitn of width and height??

    journey
        .width(journeyWidth)
        .height(journeyHeight)
        .screen(screen)
        .aligned(aligned)
        .withCompletionPaths(withCompletionPaths)
        .menuBarData(menuBarData)
        .measuresOpen(displayedBar === "measures" ? measures : undefined)
        .modalData(modalData)
        .kpiFormat(kpiFormat)
        .onSetKpiFormat(setKpiFormat)
        .createJourney(() => {
          setDisplayedBar("");
          save(newJourney, false); //dont persist until user actually does something. atm , its temp
        })
        .onSelectKpiSet((kpi) => {
          setDisplayedBar({kpi}) 
        })
        .setActiveJourney(setActive)
        .updateState(updates => {
            //can be used to update multiple items, only needed for aims, goals, links and measures
            //for each entity that is updated (eg aims), we replace only the properties defined in the update.
            const _contracts = contracts.map(c => ({ ...c, ...(updates.contracts?.find(cont => cont.id === c.id) || {} ) }))
            const _profiles = profiles.map(p => ({ ...p, ...(updates.profiles?.find(prof => prof.id === p.id) || {} ) }))
            const _aims = aims.map(a => ({ ...a, ...(updates.aims?.find(aim => aim.id === a.id) || {} ) }))
            const _goals = goals.map(g => ({ ...g, ...(updates.goals?.find(goal => goal.id === g.id) || {} ) }))
            const _links = links.map(l => ({ ...l, ...(updates.links?.find(link => link.id === l.id) || {} ) }))
            const _measures = measures.map(m => ({ ...m, ...(updates.measures?.find(meas => meas.id === m.id) || {} ) }))
            save({ ...hydratedData, contracts:_contracts, profiles:_profiles, aims:_aims, goals:_goals, links:_links, measures:_measures })
            //@todo - make createId handle prefixes so all ids are unique
        })
        .handleCreateContract(function(contract){
          const id = createId(contracts.map(p => p.id));
          const colour = "orange";
          //updates
          const _contracts = [ ...contracts, { id , colour, dataType:"contract", ...contract }];
          save({ ...hydratedData, contracts:_contracts });
        })
        .handleCreateProfile(function(profile){
          const id = createId(profiles.map(p => p.id));
          const colour = "orange";
          const _profiles = [ ...profiles, { id , userId, colour, dataType:"profile", ...profile }];
          save({ ...hydratedData, profiles:_profiles });
        })
        .handleCreateAim(function(aim, planetIds){
          const id = createId(aims.map(a => a.id));
          const colour = createColour(aims.length);
          //updates
          const _aims = [ ...aims, { id , colour, dataType:"aim", ...aim }];
          const _goals = goals.map(p => planetIds.includes(p.id) ? { ...p, aimId: id } : p);
          //setAims(prevState => ([ ...prevState, { id , colour, dataType:"aim", ...aim }]))
          //setPlanets(prevState => prevState.map(p => planetIds.includes(p.id) ? { ...p, aimId: id } : p))
          save({ ...hydratedData, aims:_aims, goals:_goals });
        })
        .createPlanet((targetDate, yPC, aimId) => {
          const newGoal = {
              id:"p"+ (nrGoalsCreated.current + 1),
              aimId,
              targetDate,
              yPC,
              dataType:"planet",
              measures:[]
              //goals
          }
          //useStateWithCallback doesnt work as this is called before journeyComponent is updated in the new call to this useEffect
        
          //todo -0 consider just setting it as selected in state, and handling this in journey ie
          //ie if a planet is selected, then updateSelected if not set as selected
          //the below approach may cause an issue if planets hasnt updated yet from the setPlanets call above
          //updates
          const _goals = [ ...hydratedData.goals,  newGoal];
          save({ ...hydratedData, goals:_goals });

          journey.selected(newGoal.id);
          //setNrPlanetsCreated(prevState => prevState + 1);
          nrGoalsCreated.current = nrGoalsCreated.current + 1;
        })
        .updatePlanet((props, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _goals = updatedState(goals, props);
          save({ ...hydratedData, goals:_goals });
        })
        .updatePlanets((planetsToUpdate, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _goals = goals.map(p => {
              const propsToUpdate = planetsToUpdate.find(planet => planet.id === p.id) || {};
              return { ...p, ...propsToUpdate }
          });
          save({ ...hydratedData, goals:_goals });
        })
        .updateAim((props, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _aims = updatedState(aims, props);
          save({ ...hydratedData, aims:_aims });
        })
        .onDeleteContract(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _contracts = contracts.filter(p => p.id !== id);
          save({ ...hydratedData, contracts:_contracts });
        })
        .onDeleteProfile(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _profiles = profiles.filter(p => p.id !== id);
          save({ ...hydratedData, profiles:_profiles });
        })
       .onDeleteAim(aimId => {
          //this doesnt work - it deltes a planet instead!
          //@todo - create a Dialog to see if user wants goals deleted too (if aiim has goals), or to cancel
          setModalData(undefined);
          const _aims = aims.filter(a => a.id !== aimId);
          const _goals = goals.map(p => ({ ...p, aimId: p.aimId === aimId ? undefined : p.aimId }));
          save({ ...hydratedData, aims:_aims, goals:_goals });
       })
        .deletePlanet(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _links = links.filter(l => l.src !== id && l.targ !== id);
          const _goals = goals.filter(p => p.id !== id);
          save({ ...hydratedData, goals:_goals, links:_links });
        })
        .onAddLink(props => {
          const newLink = {
            ...props,
            id:props.src + "-" + props.targ,
            dataType:"link"
          }
          const _links = [ ...links, newLink];
          save({ ...hydratedData, links:_links });
        })
        .deleteLink(id => {
          const _links = links.filter(l => l.id !== id);
          save({ ...hydratedData, links:_links });
        })
        .updateChannel(props => {
          setChannels(prevState => updatedState(prevState, props, (other, updated) => other.nr < updated.nr))
        })
        .setModalData((newModalData) => {
          if(modalData && !newModalData){
            //save data to server - changes have already been added to state on change
            save(hydratedData);
          }
          setModalData(newModalData)
        })
        .setZoom(zoom => {
          if(modalData){
            //@todo - what is this for. Should it be formdata.planet.x? or styleprops.left + zoom.x?
            d3.select(modalRef.current).style("left", (modalData.x + zoom.x) +"px").style("top", (modalData.y + zoom.y) +"px")
          }
        })

    d3.select(containerRef.current)
      .datum({ ...hydratedData, profiles, channels, userInfo, userKpis, datasets })
      //.datum({ canvas, aims, planets, links, channels, measures })
      .call(journey)

  }, [JSON.stringify(hydratedData), journey, aligned, withCompletionPaths, displayedBar, modalData, kpiFormat, width, height, screen ])

  const toggleCompletion = () => {
      setWithCompletionPath(prevState => !prevState);
  }

  const toggleAligned = () => {
    setAligned(prevState => !prevState);
  }

  //for now, we just open or close all measures
  const toggleMeasuresOpen = useCallback((planetId) => {
        setDisplayedBar(prevState => prevState === "measures" ? "" : "measures");
  }, [JSON.stringify(hydratedData)]);

  //for now, we just open or close all user's journeys
  const toggleJourneysOpen = useCallback(() => {
      setDisplayedBar(prevState => prevState === "journeys" ? "" : "journeys");
  }, [JSON.stringify(hydratedData)]);

  const toggleMilestonesOpen = useCallback(() => {
    setDisplayedBar(prevState => prevState === "milestones" ? "" : "milestones");
  }, [JSON.stringify(hydratedData)]);

  //for now, we just open or close all measures
  const openNewJourney = useCallback((planetId) => {
      //create a new journey, immediately save it to store and it will become the activeJourney
      // (but not to server yet until first change),
      setDisplayedBar("");
  }, [JSON.stringify(hydratedData)]);

  const onUpdatePlanetForm = modalType => (name, value) => {
      //console.log("updatePlanetForm")
      const { d , measure } = modalData;
      const planet = goals.find(p => p.id === d.id);
      let props;
      if(modalType === "targOnly"){
        //for now, the only planetMeasureData that can  be updated is that targ.  Everything else that is updated is on the measure itself.
        props = { id:d.id, measures: planet.measures.map(m => m.id === measure.id ? { ...m, targ:value } : m) };
      }else{
        props = { id:d.id, [name]: value };
      }
      const _goals = updatedState(goals, props);
      //dont persist yet until closed
      save({ ...hydratedData, goals:_goals }, false);
  }

  const onUpdateAimForm = (name, value) => {
      //console.log("update aim form")
      const { d } = modalData;
      if(d.id === "main"){
        //dont want to persist name change to db yet
        save({ ...hydratedData, [name]: value }, false)
      }else{
        const props = { id:d.id, [name]: value };
        const _aims = updatedState(aims, props)
        save({ ...hydratedData, aims:_aims }, false);
      }
  }

  const onSaveMeasureForm = (details, planetId, isNew) => {
      if(isNew){
        //any newly created measure from this form must be open as this form comes from the measures bar
        addNewMeasure(details, planetId)
        setDisplayedBar("measures");
      }else{
        const _measures = updatedState(measures, details)
        save({ ...hydratedData, measures:_measures })
      }
      () => setModalData(undefined);
  }

  const onClosePlanetForm = () => {
      journey.endEditPlanet();
      setModalData(undefined);
      //now we want it to persist the changes that have been made
      save(hydratedData);
  }

  const onCloseAimForm = () => {
      //console.log("close aim form")
      //@todo - journey.endEditAim();
      setModalData(undefined);
      //now we want it to persist the changes that have been made
      save(hydratedData);
  }

  const addNewMeasure = (details, /*planetId*/) => {
      const { name, desc } = details;
      const newMeasureId = createId(measures.map(m => m.id));
      //name and desc are same for all planets where this measure is used
      const _measures = [ ...hydratedData.measures, { id: newMeasureId, name, desc }]
      save({ ...hydratedData, measures:_measures })
      /*
      //@todo - use this
      if(planetId){
        //measure is also set on a particular planet
        const planet = planets.find(p => p.id === planetId);
        const planetMeasureData = { measureId:newMeasureId, targ: details.targ};
        setPlanets(prevState => {
          const props = { id: planetId, measures:[...planet.measures, planetMeasureData]};
          return updatedState(prevState, props);
        })
      }
      */
  }

  const importMeasures = measureIds => {
      setMeasures(measures => [...measureIds, ...measures]);
      setModalData(undefined);
  }

  return (
    <div className={classes.root}>
        <div className={`${classes.overlay} overlay`} ref={overlayRef}>
          {displayedBar === "milestones" &&
            <MilestonesBar 
              profiles={profiles} 
              contracts={contracts} 
              datasets={datasets}
              userInfo={userInfo} 
              kpis={userKpis} 
              onSelectKpiSet={kpi => setDisplayedBar({kpi, prev:"milestones"})}
              kpiFormat={kpiFormat} 
              setKpiFormat={setKpiFormat}
              screen={screen} 
            />
          }
          {/**selectedKpiSet && 
            <KpiView 
              name={kpiSetName(selectedKpi)} 
              data={kpiViewData} 
              initSelectedKey={selectedKpi.milestoneId} 
              datasets={datasets} 
              width={screen.width * 0.95} 
              height={screen.height} 
              format={kpiFormat} 
              onClose={() => setDisplayedBar(displayedBar.prev || "")} 
            />
          */}
        </div>
        {/**<svg className={classes.svg} ref={containerRef}></svg>*/}
        {/**
        <div className={classes.ctrls}>
            <div className={classes.leftCtrls}>
                <Button className={classes.btn} color="primary" variant="contained" onClick={toggleMeasuresOpen} >
                  {displayedBar === "measures" ?"Close Measures" : "Measures"}</Button>
                <Button className={classes.btn} color="primary" variant="contained" onClick={toggleJourneysOpen} >
                  {displayedBar === "journeys" ?"Close Journeys" : "Journeys"}</Button>
                <Button className={classes.btn} color="primary" variant="contained" onClick={toggleMilestonesOpen} >
                  {displayedBar === "milestones" ?"Close Milestones" : "Milestones"}</Button>
            </div>
            <div className={classes.rightCtrls}>
                <Button className={classes.btn} color="primary" variant="contained" onClick={toggleAligned} >
                  {aligned ?"Unalign goals" : "Align goals"}</Button>
                <Button className={classes.btn} color="primary" variant="contained" onClick={toggleCompletion} >completion</Button>
            </div>
        </div>
        */}
        {/**modalData && 
          <div ref={modalRef} className={classes.modal}>
             {modalData.d.dataType === "aim" && modalData.nameOnly && 
              <NameForm data={{ 
                  ...modalData, 
                  aim:aims.find(a => a.id === modalData.d.id) || { id: _id, name }
                }}
                onUpdate={onUpdateAimForm} onClose={onCloseAimForm} />}

            {modalData.d.dataType === "planet" && (modalData.nameOnly || modalData.nameAndTargOnly) &&
              <NameForm data={{ ...modalData, planet:goals.find(p => p.id === modalData.d?.id) }}
                onUpdate={onUpdatePlanetForm("nameOnly")} onClose={onClosePlanetForm} />}

            {modalData.nameAndTargOnly &&
              <div className={classes.targModal}>
                <TargetForm data={{ ...modalData, planet:goals.find(p => p.id === modalData.d?.id) }}
                  onUpdate={onUpdatePlanetForm("targOnly")} onClose={onClosePlanetForm} />
              </div>}

            {modalData.importing &&
              <ImportMeasures data={modalData} existing={measures} available={[]}
                onSave={importMeasures} onClose={() => setModalData(undefined)} />}

            {modalData.measureOnly && 
              <MeasureForm data={{ ...modalData, planet:goals.find(p => p.id === modalData.d?.id) }}
              onSave={onSaveMeasureForm} onCancel={() => setModalData(undefined)}
              existingMeasures={measures} />}

            {modalData && !modalData.nameOnly && !modalData.measureOnly && !modalData.nameAndTargOnly && !modalData.importing &&
              <Form 
                  data={{ ...modalData, planet:goals.find(p => p.id === modalData.d?.id) }} 
                  onUpdate={onUpdatePlanetForm("full")} 
                  onClose={onClosePlanetForm}
                  availableMeasures={measures}
                  addNewMeasure={addNewMeasure} />}
          </div>
        */}
    </div>
  )
}

Journey.defaultProps = {
  data:{
    _id:"temp",
    contracts:[],
    profiles:[],
    aims:[],
    goals:[],
    links:[],
    measures:mockMeasures
  },
  userInfo:{},
  userKpis:{},
  datasets:mockDatasets,
  availableJourneys:[],
  screen: {},
  width: 0,
  height: 0,
  save:() => {}
}

export default Journey;
