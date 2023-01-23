import React, { useEffect, useState, useRef, useCallback } from 'react'
//import { useStateWithCallbackLazy } from 'use-state-with-callback';
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'

import { withLoader } from '../../util/HOCs';

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
import { DIMNS, FONTSIZES, grey10 } from './constants';
//import { openFullScreen } from "./domHelpers"

const newJourney = { _id:"temp", contracts:[], profiles:[], aims:[], goals:[], links:[], measures:[]}

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
    border:"1px solid #C0C0C0",
    position:"absolute",
    background:grey10(9),
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
const Journey = ({ data, datasets, availableJourneys, screen, width, height, save, setActive, closeDialog, takeOverScreen, releaseScreen, onStoreValue, onSaveValue }) => {
  //console.log("Journey.......")
  //console.log("Journey avail", availableJourneys)
  const { _id, userId, name, contracts, profiles, aims, goals, links, measures, kpis } = data;
  const [journey, setJourney] = useState(null);
  const [channels, setChannels] = useState(initChannels);
  const [withCompletionPaths, setWithCompletionPath] = useState(false);
  const [aligned, setAligned] = useState(false);
  const [modalData, setModalData] = useState(undefined);
  //for now, displayedBar is always milestones
  const [displayedBar, setDisplayedBar] = useState("milestones");
  //const [displayedBar, setDisplayedBar] = useState("");
  const [kpiFormat, setKpiFormat] = useState("actual");
  const selectedKpi = typeof displayedBar === "object" && displayedBar.kpi ? displayedBar.kpi : null;
  //KpiView will display an entire kpiSet, keyed by milestoneId
  const selectedKpiSet = selectedKpi?.kpiSet;
  const shouldShowOverlay = displayedBar === "milestones" || selectedKpiSet;

  //kpiViewData is based on selectedKpiSet, profiles and 
  //todo - finish this - needs the datasetId and the measureId from the kpi. kaybe just grab it from the first profile
  const kpiSetName = kpi => {
    const { datasetId, statId } = kpi;
    const dataset = datasets.find(dset => dset._id === datasetId);
    const stat = dataset?.measures.find(m => m._id === statId);
    return stat?.fullNameLong
  }
  //need to know which date/profile is selected too -
  // this also comes from teh kpi that is passed through, as it will have that date
  /*
  const kpiViewData = !selectedKpiSet ? null : profiles.map(p =>  ({
    ...p.kpis.find(kpi => kpi.kpiSet === selectedKpiSet),
    date:p.date,
    //key can just be the milestoneId in this case
    key:p.id,
  }));
  */

  const shouldD3UpdateRef = useRef(true);

  const ctrlsHeight = 0;//10;
  const journeyWidth = width - DIMNS.journey.margin.left - DIMNS.journey.margin.right
  const journeyHeight = height - DIMNS.journey.margin.top - DIMNS.journey.margin.bottom - ctrlsHeight;
  let styleProps = {}
  /*
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
  */

  //console.log("styleProps", styleProps)
  const classes = useStyles(styleProps) 
  const containerRef = useRef(null);
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const modalDimnsRef = useRef({ width:500, height:700 });

  //@todo - make a more robust id function - see my exp builder code
  const nrGoalsCreated = useRef(goals.length);

  const handleCreateProfile = useCallback((props) => {
    const profile = {
      //put in some default values in case not specified
      yPC:50,
      dataType:"profile",
      colour:"orange",
      id:createId(profiles.map(p => p.id)),
      userId,
      ...props
    }
    const _profiles = [ ...profiles, profile];
    save({ ...data, profiles:_profiles });
    
  }, [JSON.stringify(data), userId]);

  const handleCreateContract = useCallback((props) => {
    const contract = {
      //put in some default values in case not specified
      yPC:50,
      dataType:"contract",
      id:createId(contracts.map(c => c.id)),
      userId,
      ...props
    }
    const _contracts = [ ...contracts, contract];
    save({ ...data, contracts:_contracts });
    
  }, [JSON.stringify(data), userId]);

  const handleCreateMilestone = useCallback((dataType, date) => {
    if(dataType === "profile"){
      handleCreateProfile({ date });
    }else{
      handleCreateContract({ date });
    }
  }, [JSON.stringify(data), userId]);

  const handleDeleteProfile = useCallback((id) => {
    //todo - must delete link first, but when state is put together this wont matter
    const _profiles = profiles.filter(p => p.id !== id);
    save({ ...data, profiles:_profiles });
  }, [JSON.stringify(data)]);

  const handleDeleteMilestone = useCallback((dataType, id) => {
    if(dataType === "profile"){
      handleDeleteProfile(id);
    }else{
      //handleDeleteContract(id);
    }
  }, [JSON.stringify(data)]);

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
 /*
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

    //const containerHeight = d3.select(containerRef.current).attr("height")
    //console.log("journey containerHeight", containerHeight)

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
            save({ ...data, contracts:_contracts, profiles:_profiles, aims:_aims, goals:_goals, links:_links, measures:_measures })
            //@todo - make createId handle prefixes so all ids are unique
        })
        .handleCreateContract(handleCreateContract)
        .handleCreateProfile(handleCreateProfile)
        .handleCreateAim(function(aim, planetIds){
          const id = createId(aims.map(a => a.id));
          const colour = createColour(aims.length);
          //updates
          const _aims = [ ...aims, { id , colour, dataType:"aim", ...aim }];
          const _goals = goals.map(p => planetIds.includes(p.id) ? { ...p, aimId: id } : p);
          //setAims(prevState => ([ ...prevState, { id , colour, dataType:"aim", ...aim }]))
          //setPlanets(prevState => prevState.map(p => planetIds.includes(p.id) ? { ...p, aimId: id } : p))
          save({ ...data, aims:_aims, goals:_goals });
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
          const _goals = [ ...data.goals,  newGoal];
          save({ ...data, goals:_goals });

          journey.selected(newGoal.id);
          //setNrPlanetsCreated(prevState => prevState + 1);
          nrGoalsCreated.current = nrGoalsCreated.current + 1;
        })
        .updatePlanet((props, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _goals = updatedState(goals, props);
          save({ ...data, goals:_goals });
        })
        .updatePlanets((planetsToUpdate, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _goals = goals.map(p => {
              const propsToUpdate = planetsToUpdate.find(planet => planet.id === p.id) || {};
              return { ...p, ...propsToUpdate }
          });
          save({ ...data, goals:_goals });
        })
        .updateAim((props, shouldD3Update=true) => {
          if(!shouldD3Update){ shouldD3UpdateRef.current = shouldD3Update; }
          //updates
          const _aims = updatedState(aims, props);
          save({ ...data, aims:_aims });
        })
        .onDeleteContract(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _contracts = contracts.filter(p => p.id !== id);
          save({ ...data, contracts:_contracts });
        })
        .onDeleteProfile(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _profiles = profiles.filter(p => p.id !== id);
          save({ ...data, profiles:_profiles });
        })
       .onDeleteAim(aimId => {
          //this doesnt work - it deltes a planet instead!
          //@todo - create a Dialog to see if user wants goals deleted too (if aiim has goals), or to cancel
          setModalData(undefined);
          const _aims = aims.filter(a => a.id !== aimId);
          const _goals = goals.map(p => ({ ...p, aimId: p.aimId === aimId ? undefined : p.aimId }));
          save({ ...data, aims:_aims, goals:_goals });
       })
        .deletePlanet(id => {
          setModalData(undefined);
          //must delete link first, but when state is put together this wont matter
          const _links = links.filter(l => l.src !== id && l.targ !== id);
          const _goals = goals.filter(p => p.id !== id);
          save({ ...data, goals:_goals, links:_links });
        })
        .onAddLink(props => {
          const newLink = {
            ...props,
            id:props.src + "-" + props.targ,
            dataType:"link"
          }
          const _links = [ ...links, newLink];
          save({ ...data, links:_links });
        })
        .deleteLink(id => {
          const _links = links.filter(l => l.id !== id);
          save({ ...data, links:_links });
        })
        .updateChannel(props => {
          setChannels(prevState => updatedState(prevState, props, (other, updated) => other.nr < updated.nr))
        })
        .setModalData((newModalData) => {
          if(modalData && !newModalData){
            //save data to server - changes have already been added to state on change
            save(data);
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
      .datum({ ...data, channels, datasets })
      //.datum({ canvas, aims, planets, links, channels, measures })
      .call(journey)

  }, [JSON.stringify(data), journey, aligned, withCompletionPaths, displayedBar, modalData, kpiFormat, width, height, screen ])

  */
  const toggleCompletion = () => {
      setWithCompletionPath(prevState => !prevState);
  }

  const toggleAligned = () => {
    setAligned(prevState => !prevState);
  }

  //for now, we just open or close all measures
  const toggleMeasuresOpen = useCallback((planetId) => {
        setDisplayedBar(prevState => prevState === "measures" ? "" : "measures");
  }, [JSON.stringify(data)]);

  //for now, we just open or close all user's journeys
  const toggleJourneysOpen = useCallback(() => {
      setDisplayedBar(prevState => prevState === "journeys" ? "" : "journeys");
  }, [JSON.stringify(data)]);

  const toggleMilestonesOpen = useCallback(() => {
    setDisplayedBar(prevState => prevState === "milestones" ? "" : "milestones");
  }, [JSON.stringify(data)]);

  //for now, we just open or close all measures
  const openNewJourney = useCallback((planetId) => {
      //create a new journey, immediately save it to store and it will become the activeJourney
      // (but not to server yet until first change),
      setDisplayedBar("");
  }, [JSON.stringify(data)]);

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
      save({ ...data, goals:_goals }, false);
  }

  const onUpdateAimForm = (name, value) => {
      //console.log("update aim form")
      const { d } = modalData;
      if(d.id === "main"){
        //dont want to persist name change to db yet
        save({ ...data, [name]: value }, false)
      }else{
        const props = { id:d.id, [name]: value };
        const _aims = updatedState(aims, props)
        save({ ...data, aims:_aims }, false);
      }
  }

  const onSaveMeasureForm = (details, planetId, isNew) => {
      if(isNew){
        //any newly created measure from this form must be open as this form comes from the measures bar
        addNewMeasure(details, planetId)
        setDisplayedBar("measures");
      }else{
        const _measures = updatedState(measures, details)
        save({ ...data, measures:_measures })
      }
      () => setModalData(undefined);
  }

  const onClosePlanetForm = () => {
      journey.endEditPlanet();
      setModalData(undefined);
      //now we want it to persist the changes that have been made
      save(data);
  }

  const onCloseAimForm = () => {
      //console.log("close aim form")
      //@todo - journey.endEditAim();
      setModalData(undefined);
      //now we want it to persist the changes that have been made
      save(data);
  }

  const addNewMeasure = (details, /*planetId*/) => {
      const { name, desc } = details;
      const newMeasureId = createId(measures.map(m => m.id));
      //name and desc are same for all planets where this measure is used
      const _measures = [ ...data.measures, { id: newMeasureId, name, desc }]
      save({ ...data, measures:_measures })
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
  const handleDragEnter = e => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.setData("text", e.target.id);
  };
  const handleDragLeave = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDragOver = e => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e,d) => {
    e.preventDefault();
    e.stopPropagation();
    let dt = e.dataTransfer
    let files = dt.files
    const input = files[0];
    //console.log("input", input)
    const reader = new FileReader();
    reader.onload = function (e) {
      var parsed = d3.csvParse(e.target.result);
      //console.log("parsed", parsed);
      if(input.name.includes("datasets")){
        //console.log("save datasets")
      }else if(input.name.includes("datapoints")){
        //console.log("save datapoints")
      }
      else if(input.name.includes("users")){
        //console.log("save users")
      }
      else if(input.name.includes("groups")){
        //console.log("save groups")
      }
  
      //identify what the fle is about,
      //call api action to save rows eg as datapoints, datasets, users or groups
    };
    reader.readAsText(input);
    /*
    d3.csv(f1).then(function(data) {
      console.log("d3 csv data", data);
    });
    */
    //([...files]).forEach(uploadFile)
  };
  /*
  function uploadFile(file) {
    let url = 'YOUR URL HERE'
    let formData = new FormData()
  
    formData.append('file', file)
  
    fetch(url, {
      method: 'POST',
      body: formData
    })
    .then(() => { }) //done - inform user
    .catch(() => { }) //error - handle and inform user
  }
  */
  //@todo -  openFullScreen when user clicks to get into a journey
  return (
    <div className={classes.root}>
        <div className={`${classes.overlay} overlay`} ref={overlayRef}>
          {displayedBar === "milestones" &&
            <MilestonesBar 
              data={data}
              datasets={datasets}
              onSelectKpiSet={kpi => setDisplayedBar({kpi, prev:"milestones"})}
              kpiFormat={kpiFormat} 
              setKpiFormat={setKpiFormat}
              onCreateMilestone={handleCreateMilestone}
              onDeleteMilestone={handleDeleteMilestone}
              takeOverScreen={takeOverScreen}
              releaseScreen={releaseScreen}
              onStoreValue={onStoreValue}
              onSaveValue={onSaveValue}
              screen={screen}
              availWidth={width}
              availHeight={height}
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

//export default Journey;
export default withLoader(Journey, ["allDatasetsFullyLoaded"] )

Journey.defaultProps = {
  datasets:[],
  availableJourneys:[],
  screen: {},
  width: 0,
  height: 0,
  save:() => {}
}
