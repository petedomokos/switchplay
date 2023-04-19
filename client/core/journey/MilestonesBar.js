import React, { useEffect, useState, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import { makeStyles } from '@material-ui/core/styles'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Button from '@material-ui/core/Button'
import SelectDate from "../../util/SelectDate";
import Settings from "../../util/Settings";
import Goal from "./Goal";
import MilestoneDate from "./MilestoneDate";
import Photos from "./Photos";
import StepForm from "./StepForm";
import milestonesLayout from "./milestonesLayout";
import milestonesBarComponent from "./milestonesBarComponent";
import { DIMNS, FONTSIZES, grey10, JOURNEY_SETTINGS_INFO, OVERLAY, getURLForUser } from './constants';
import { sortAscending, sortDescending } from '../../util/ArrayHelpers';
import { createId } from './helpers';
import { isNumber } from '../../data/dataHelpers';

const useStyles = makeStyles((theme) => ({
  root: {
    position:"relative",
    //couldnt the height just be the full journey height always for now?
    //until we allow a bar to be shown above the jorney canvas
    //border:"2px solid #C0C0C0",
    width:"100%",
    height:"100%",//props => props.height,
    display:"flex",
    flexDirection:"column",
    //marginLeft:DIMNS.profiles.margin.left, 
    //marginRight:DIMNS.profiles.margin.right,
    //marginTop:DIMNS.profiles.margin.top, 
    //marginBottom:DIMNS.profiles.margin.bottom
  },
  formOverlay:{
    background:"black", 
    opacity:0.5, 
    width:"100%", 
    height:"100%", 
    position:"absolute"
  },
  svg:{
    //position:"absolute"
    display:props => props.svg.display
  },
  ctrls:{
    width:"100%",//DIMNS.milestonesBar.ctrls.width,
    height:props => props.bottomCtrlsBarHeight,
    alignSelf:"center",
    display:props => props.sliderEnabled && props.bottomCtrlsBarHeight !== 0 ? "flex" : "none",
    justifyContent:"center",
    alignItems:"center",
  },
  iconBtn:{
    color:grey10(2),
    marginLeft:"10px",
    marginRight:"10px"
  },
  icon:{
    width:40,
    height:40,
  },
  outerReactContainer:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:"100%",
    height:"100%",
    overflow:"hidden",
    pointerEvents:"none"
  },
  reactComponentContainer:{
    width:0,
    height:0,
    position:"absolute",
    display: props => props.reactComponentContainer.display,
  },
  reactComponentItem:{
    position:"absolute",
    //pointerEvents:"none",
  },
  reactComponentItemOverlay:{
    position:"absolute",
    left:"0px",
    top:"0px",
    width:"100%",
    height:"100%",
    background:OVERLAY.FILL,
    opacity:OVERLAY.OPACITY,
  },
  formOuterContainer:{
    position:"absolute",
    display:props => props.formOuterContainer.display,
    left:props => props.formOuterContainer.left,
    top:props => props.formOuterContainer.top,
    width:props => props.formOuterContainer.width || null,
    height:props => props.formOuterContainer.height || null,
    pointerEvents:"none",
  },
  formContainer:{
    //opacity:0.5,
    position:"absolute",
    //dimns may be null if we dont want it to render beyond/between its chidren components
    width:props => props.formContainer.width || "90%",
    height:props => props.formContainer.height || null,
    margin:props => props.formContainer.margin || null,
    left:props => props.formContainer.left,
    top:props => props.formContainer.top,
    pointerEvents:"all"
  },
  textField: {
    //marginLeft: theme.spacing(1),
    //marginRight: theme.spacing(1),
    width: "150px",
  },
  inputColor:{
    color:"black",
    fill:"white",
    backgroundColor: grey10(2),
  },
  dateContainer:{
  },
  formCtrls:{
    width:"150px",
    marginTop:"5px",
    display:"flex",
    justifyContent:"center"
  },
  submit:{
    width:"60px",
    margin:"5px",
    fontSize:"12px",
  },
  cancel:{
    width:"60px",
    margin:"5px",
    fontSize:"12px"
  },
  openedKpi:{
    position:"absolute",
    left:props => `${props.openedKpi.left}px`,
    top:props => `${props.openedKpi.top}px`,
    width:props => `${props.openedKpi.width}px`,
    height:props => `${props.openedKpi.height}px`
  }
}))

const MilestonesBar = ({ user, data, datasets, asyncProcesses, kpiFormat, setKpiFormat, onSelectKpiSet, onCreateMilestone, onUpdateMilestone, onDeleteMilestone, takeOverScreen, releaseScreen, screen, availWidth, availHeight, onSaveValue, onSaveInfo, onSaveSetting, onSavePhoto }) => {
  const { media=[], player={}, profiles=[], contracts=[], settings=[] } = data;
  const allMilestones = [ ...profiles, ...contracts ];
  const currentProfile = profiles.find(p => p.id === "current");
  const allJourneySteps = currentProfile.kpis.map(kpi => kpi.steps).reduce((a,b) => [...a, ...b], []);
  const allKpiSteps = (kpiKey, milestoneId) => {
    const kpiSteps = currentProfile.kpis.find(kpi => kpi.key === kpiKey).steps;
    return milestoneId ? kpiSteps.filter(s => s.milestoneId === milestoneId) : kpiSteps;
  } 
  //local state
  const [firstMilestoneInView, setFirstMilestoneInView] = useState(0);
  const [bgMenuLocation, setBgMenuLocation] = useState("");
  const [sliderEnabled, setSliderEnabled] = useState(true);
  const [selectedMilestone, setSelectedMilestone] = useState("");
  const [selectedKpi, setSelectedKpi] = useState(null);
  //console.log("selKPI", selectedKpi)
  const [reactComponent, setReactComponent] = useState(null);
  const [editingReactComponent, setEditingReactComponent] = useState("");
  const [editingSVGComponent, setEditingSVGComponent] = useState(null);
  const [form, setForm] = useState(null);
  //console.log("MBar", form)
  const formMilestone = allMilestones.find(m => m._id === form?.milestoneId);
  let getSelectedPhotoId = () => {
    if(!form?.formType === "photo"){ return ""; }
    if(form.milestoneId === "current"){
      //use top level journey media
      return media.find(m => m.locationKey === form.location)?.mediaId || "";
    }
    const milestone = allMilestones.find(m => m.id === form.milestoneId);
    return milestone.media.find(m => m.locationKey === form.location)?.mediaId || "";
  }

  const dragStartXRef = useRef(null);

  const moreSettings = sortAscending(settings
    .filter(s => s.key !== "currentValueDataMethod")
    .filter(s => s.positionInCurrentCardSettings), 
    d => d.positionInCurrentCardSettings
  )
  
  const shouldAutosaveForm = form?.formType === "date" ? false : true;

  const [layout, setLayout] = useState(() => milestonesLayout());
  const [milestonesBar, setMilestonesBar] = useState(() => milestonesBarComponent());

  const bottomCtrlsBarHeight = screen.isLarge ? DIMNS.milestonesBar.ctrls.height : 0;
  //helpers
  /*
  const calcOpenedKpiX = dimns => {
    const { margins, profile, offset } = dimns;
    return profile.x - profile.width/2 + offset + margins.kpi.left;
  }
  const calcOpenedKpiY = dimns => {
    const { heights, margins, profile } = dimns;
    return d3.sum(Object.values(heights)) + margins.kpi.top + profile.y - profile.height/2;
  }
  //apply the bottom margin to the top of openedKpi too so its even (note: the top margin is above the d3 component)
  const extraMarginAboveOpenedKpi = selectedKpi ? selectedKpi.dimns.margins.kpi.bottom : 0;
  const calcOpenedKpiWidth = dimns => {
    const { margins, profile } = dimns;
    return profile.width - margins.kpi.left - margins.kpi.right;
  }
  const calcOpenedKpiHeight = dimns => {
    const { heights, margins, profile, heightsBelow } = dimns;
    const totalHeightAbove = d3.sum(Object.values(heights)) - heights.topBar + margins.kpi.top;
    const totalHeightBelow = d3.sum(Object.values(heightsBelow)) + margins.kpi.bottom;
    return profile.height - totalHeightAbove - totalHeightBelow - extraMarginAboveOpenedKpi;
  }
  */
  let styleProps = { 
    bottomCtrlsBarHeight, 
    sliderEnabled, 
    formOuterContainer:{
      display:form ? null : "none",
      left: form?.outerContainerLeft || 0, 
      top: form?.outerContainerTop || 50,
      width: form?.formType === "photo" ? "90%" : form?.outerContainerWidth,
      height: form?.formType === "photo" ? "80%" : form?.outerContainerHeight,
    },
    formContainer:{
      left: form?.left || 0, 
      top: form?.top || 50,
      width: form?.formType === "photo" ? "90%" : form?.width,
      height: form?.formType === "photo" ? "80%" : form?.height,
      margin: form?.formType === "photo" ? "10% 5%" : form?.margin,
    }, //50 so it doesnt go over burger bar
    reactComponentContainer: {
      //hide if photo form is showing so it doesnt scroll the screen
      display:reactComponent && form?.formType !== "photo" ? null : "none",
      left: reactComponent?.transform[0] || 0, 
      top: reactComponent?.transform[1] || 0 
    },
    svg:{
      //hide if photo form is showing so it doesnt scroll the screen
      display:form?.formType === "photo" ? "none" : null,
    },
    openedKpi:{
      left:0,//selectedKpi ? selectedKpi.dimns.margins.kpi.left : 0,
      top:0,//selectedKpi ? extraMarginAboveOpenedKpi : 0,
      width:0,//selectedKpi ? calcOpenedKpiWidth(selectedKpi.dimns) : 0,
      height:0//selectedKpi ? calcOpenedKpiHeight(selectedKpi.dimns) : 0,
    }
  };
  //console.log("styleProps", styleProps.formOuterContainer)
  const openedKpiDisplay = milestone => (selectedKpi && (milestone.isCurrent || reactComponent?.componentType === "profile")) ? null : "none";
  const classes = useStyles(styleProps);
  const reactComponentRef = useRef(null);
  const formRef = useRef(null);
  const containerRef = useRef(null);
  const openedKpiRef = useRef(null);

  const stringifiedProfiles = JSON.stringify(profiles);

  const handleDateChange = useCallback(dateKey => e => {
    if(!e.target?.value){ return; }
    const dateValue = e.target.value; //must declare it before the setform call as the cb messes the timing of updates up
    if(dateKey === "startDate"){
      //save it as a startdate and a custom date too
      setForm(prevState => ({ ...prevState, hasChanged:true, value:{ ...prevState.value, startDate:dateValue, customStartDate:dateValue } }))
    }else{
      //its just a date
      setForm(prevState => ({ ...prevState, hasChanged:true, value:{ ...prevState.value, date:dateValue } }))
    }
  }, [form]);

  const handleClickSettingOption = useCallback((key, value) => {
    onSaveSetting({ key, value })
  }, [form]);

  const onClickMoreSettings = useCallback(() => {
    setForm(prevState => ({ ...prevState, shouldShowMoreSettings:true }))
  }, [form]);

  //const onSetEditingReactComponent = useCallback((newEditing) => {
  const onSetEditingReactComponent = newEditing => {
    const changedProfile = editingReactComponent?.milestoneId !== newEditing?.milestoneId;
    const changedKey = editingReactComponent?.key !== newEditing?.key;
    //save any existing value
    if(editingReactComponent && (changedProfile || changedKey)){
      const { milestoneId, key, value } = editingReactComponent;
      onSaveInfo(milestoneId, key)(value);
    }
    //update
    setEditingReactComponent(newEditing)
  }
  //}, [editingReactComponent]);

  const handleSaveForm = useCallback(e => {
      if(form.formType === "step"){
        handleUpdateStep(form.milestoneId, form.kpiKey, form.value)
      }
      //????????if current, it will have already saved when button pressed?????
      if(form.milestoneId === "current"){
        handleCancelForm();
        return; 
      }
      if(form.formType === "date"){
        console.log("save form", form)
        const newStartDateValue = form.value.startDate;
        const newDateValue = form.value.date;
        //new pos of milestone
        const now = new Date();
        const newDate = new Date(newDateValue);
        newDate.setUTCHours(21);
        const newStartDate = new Date(newStartDateValue);
        newStartDate.setUTCHours(21);
        if(newDate < newStartDate){
          alert("The start date must be earlier than the target date.")
          return;
        }

        //adjust the card order if required
        const newDateIsPast = newDate < now;
        let newPosition;
        if(newDateIsPast){
          const otherPastMilestones = allMilestones
            .filter(m => m.id !== form.milestoneId && m.id !== "current")
            .filter(m => m.isPast);
          //@todo - bring this numbering methid together with the way it is done in milestonesLayout
          const sorted = sortDescending([ ...otherPastMilestones, { id: form.milestoneId, date: newDate }], d => d.date)
          newPosition = -(sorted.map(m => m.id).indexOf(form.milestoneId) + 1)
        }else{
          const otherFutureMilestones = allMilestones
            .filter(m => m.id !== form.milestoneId && m.id !== "current")
            .filter(m => m.isFuture);
          
          const sorted = sortAscending([...otherFutureMilestones, { id: form.milestoneId, date: newDate }], d => d.date)
          newPosition = sorted.map(m => m.id).indexOf(form.milestoneId) + 1
        }
      
        milestonesBar
          .requiredSliderPosition(newPosition)
          .updateDatesShown(allMilestones);

        setForm(null);
        if(form.value.customStartDate){
          //startDate has been changed so save it as a custom, aswell as the date in case it has changed
          onSaveInfo(form.milestoneId, "date")({ date:newDate, customStartDate:newStartDate });
        }else{
          //only the date has changed
          onSaveInfo(form.milestoneId, "date")({ date:newDate });
        }
        return;
      }
      //all other cases, just cancel
      handleCancelForm();
      return; 
  }, [form]);

  const handleCancelForm = useCallback(e => {
    milestonesBar.updateDatesShown(allMilestones);
    setForm(null);
  }, [form]);

  const handleCreateStep = useCallback((milestoneId, kpiKey) => {
    const updatedSteps = [
      ...allKpiSteps(kpiKey, milestoneId),
      { id:createId(allJourneySteps.map(s => s.id), "steps"), }
    ];
    onUpdateMilestone(milestoneId, "steps", kpiKey, updatedSteps)
  }, [allJourneySteps]);

  const handleUpdateStep = useCallback((milestoneId, kpiKey, updatedStep) => {
    const updatedSteps = allKpiSteps(kpiKey, milestoneId)
      .map(step => step.id === updatedStep.id ? updatedStep : step);
    onUpdateMilestone(milestoneId, "steps", kpiKey, updatedSteps)
  }, [allJourneySteps, form]);

  const handleUpdateSteps = useCallback((milestoneId, kpiKey, updatedSteps) => {
    onUpdateMilestone(milestoneId, "steps", kpiKey, updatedSteps)
  }, [allJourneySteps]);

  const handleDeleteStep = useCallback((milestoneId, kpiKey, stepId) => {
    const updatedSteps = allKpiSteps(kpiKey, milestoneId).filter(step => step.id !== stepId);
    onUpdateMilestone(milestoneId, "steps", kpiKey, updatedSteps)
  }, [allJourneySteps]);

  //keypresses
  useEffect(() => {
    d3.select("body").on("keypress", (e) => {
      if(e.keyCode === "13" || e.key === "Enter"){
        e.preventDefault();
        if(form){
          handleSaveForm()
        }
        if(editingReactComponent){
          //this will save and exit the form
          onSetEditingReactComponent(null);
        }
      }
    })
  }, [form, stringifiedProfiles, editingReactComponent, onSaveInfo, handleSaveForm])

  //init
  //decide what needs to update on setSelectedMilestone, and only have that inteh depArray 
  //or alternatively only have that processed in milestoneslayout/kpiLayout
  //so we are not doing teh epensive operations each time
  useEffect(() => {
    //console.log("uE layout-------------")
    if(asyncProcesses.creating.datapoints){ 
      //saving datapoint so dont update
      return; 
    }
    layout
      .format(kpiFormat)
      .datasets(datasets)
      .info(player)
      .getURL(getURLForUser(user._id));

    //profiles go before contracts of same date
    const orderedData = sortAscending([ ...profiles, ...contracts], d => d.date);

    d3.select(containerRef.current).datum(layout(orderedData))

  }, [stringifiedProfiles, kpiFormat])

  useEffect(() => {
    if(asyncProcesses.creating.datapoints){ 
      //saving datapoint so dont update
      return; 
    }
    const totalAvailHeightStr = d3.select("div.milestone-bar-root").style("height");
    const totalAvailHeight = totalAvailHeightStr.slice(0, totalAvailHeightStr.length - 2);
    const height = d3.min([DIMNS.milestonesBar.maxHeight, totalAvailHeight - bottomCtrlsBarHeight])

    milestonesBar
      .width(availWidth)
      .height(height)
      .styles({
        phaseLabel:{

        },
        profile:{
          
        },
        contract:{

        }
      })
      .kpiFormat(kpiFormat)
      //.height(kpiListHeight)
      //.profileCardDimns(profileCardDimns)
      //.contractDimns(contractDimns)
      .onTakeOverScreen(takeOverScreen)
      .onReleaseScreen(releaseScreen)
      .onSetSelectedMilestone(setSelectedMilestone)
      .selectedKpi(selectedKpi?.key)
      .onSetSelectedKpi(setSelectedKpi)
      .onSetKpiFormat(setKpiFormat)
      .onSelectKpiSet((e,kpi) => { 
          onSelectKpiSet(kpi); 
      })
      .onToggleSliderEnabled(() => setSliderEnabled(prevState => !prevState))
      .onCreateMilestone(onCreateMilestone)
      .onUpdateMilestone((id, desc, locationKey, updates) => {
          setEditingSVGComponent(null);
          onUpdateMilestone(id, desc, locationKey, updates);
      })
      .onDeleteMilestone(onDeleteMilestone)
      .onSaveValue(onSaveValue)
      //.onCreateMilestone(function(e,d){
        //if(!bgMenuLocation){
          // setBgMenuLocation(e.x);
        //}else{
          //get the two dates either side of it, and find middle
          //addProfile
        //}
      //})
      .onCreateStep(handleCreateStep)
      .onUpdateStep(handleUpdateStep)
      .onUpdateSteps(handleUpdateSteps)
      .onDeleteStep(handleDeleteStep)
      .setForm(newForm => {
        //todo - handle if current - value is not set, and also may need the key??
        if(!newForm){ milestonesBar.updateDatesShown(allMilestones); }
        //first, always reset to null so SelectDate unmounts and default value is ready to be reloaded
        //@todo - find a better wy of clearing the defaultValue within the SelectDate component instead
        setForm(null);
        setForm(newForm);
      })
      .setReactComponent(newComponent => {
        //even if same compn, it could be the transform that is updating
        //if(newComponent?.componentType === reactComponent?.componentType) { return; }
        //first, always reset to null so component unmounts and state is reset
        setReactComponent(null);
        setReactComponent(newComponent);
      })
      .onSetEditingReactComponent(onSetEditingReactComponent)
      .onSetEditingSVGComponent(setEditingSVGComponent)
      .onMouseover(function(e,d){
        //console.log("mover")
      })
      .onMouseout(function(e,d){
        //console.log("mout")
      })//)

  }, [stringifiedProfiles, screen, form, reactComponent, editingReactComponent])

  useEffect(() => {
    //it mustnt be swipable when we want it to be scrollable
    //on large screen, we always want it to be scrollable. 
    milestonesBar.swipable((selectedMilestone || screen.isLarge ? false : true))
  }, [selectedMilestone, screen.isLarge])

  //render
  //@todo - consider having a shouldRender state, and this could also contain info on transition requirements
  useEffect(() => {
    if(asyncProcesses.creating.datapoints){ 
      //saving datapoint so dont update
      return; 
    }
    d3.select(containerRef.current).call(milestonesBar);
  }, [selectedMilestone, stringifiedProfiles, screen, kpiFormat])

  const onCtrlsAreaClick = () => {
    if(editingSVGComponent){
      milestonesBar.endMilestoneEdit();
    }else if(editingReactComponent){
      onSetEditingReactComponent(null);
    }
  }

  useEffect(() => {
    console.log("reactdragUseEff")
    //todo - need to have the sme logic as in milestonesbarComponent for determining if its slideForward or back or nothing,
    //and call the relevant functions to slide it
    //This soln seems to work, but it breaks ifyou drag above or below the blue box.
    //simplest soln for now may be to just have a box aboev and below, but teh one below just doesnt extend over the bottom right corner.
    //in longer term, may bring the ctrls to this level - they may aswell be.
    const swipable = (selectedMilestone || screen.isLarge ? false : true);
    const DRAG_THRESHOLD = 50;
    const drag = d3.drag()
      .on("start", e => { 
        //console.log("ds")
        if(!swipable) { return; }
        dragStartXRef.current = e.x;
      })
      .on("drag", e => { 
        //console.log("drg")
        if(!swipable) { return; }
        if(dragStartXRef.current && dragStartXRef.current - e.x > DRAG_THRESHOLD){
          dragStartXRef.current = null;
          milestonesBar.slideForward();
        } else if(dragStartXRef.current && e.x - dragStartXRef.current > DRAG_THRESHOLD){
            dragStartXRef.current = null;
            milestonesBar.slideBack();
        }
      })

    d3.selectAll(`div.milestone`).call(drag)

  }, [selectedMilestone, screen.isLarge])

  const saveStepValue = value => {
    setForm(prevState => ({ ...prevState, value:{ ...prevState.value, desc:value } }))
  }

  return (
    <div className={`milestone-bar-root ${classes.root}`}>
      <div className={classes.outerReactContainer}>
        <div className={classes.reactComponentContainer} id="react-container" ref={reactComponentRef}>
          {
            allMilestones.map(m => (
              <div className={`${classes.reactComponentItem} milestone`} key={`milestone-${m.id}`} id={`milestone-`+m.id}>
                {!m.isCurrent && reactComponent?.componentType === "goal" &&
                  <Goal
                    milestone={m}
                    selectedKpi={selectedKpi}
                    editable={editingSVGComponent === null}
                    editing={editingReactComponent?.milestoneId === m.id ? editingReactComponent : null}
                    setEditing={onSetEditingReactComponent}
                  />
                }
                {/**<div className={classes.openedKpi} id={`opened-kpi-${m.id}`} style={{display:openedKpiDisplay(m)}}>
                    <OpenedKpi milestone={m} selectedKpiInfo={selectedKpi} editable/>
              </div>*/}
                {selectedMilestone && selectedMilestone !== m.id && <div className={classes.reactComponentItemOverlay}></div>}
              </div>
            ))
          }
        </div>
      </div>
      {form && <div className={classes.formOverlay} onClick={handleSaveForm}></div>}
      <div className={`${classes.formOuterContainer} form-outer-container`} ref={formRef}>
        <div className={classes.formContainer}>
            {form?.formType === "step" && 
              <StepForm step={form.value} fontSize={form.height * 0.5} save={saveStepValue} />
            }
            {form?.formType === "date" &&
              (form.milestoneId === "current" ?
                <>
                  <Settings
                      options={JOURNEY_SETTINGS_INFO.currentValueDataMethod.options}
                      selectedValue={settings.find(s => s.key === "currentValueDataMethod").value}
                      moreSettings={moreSettings}
                      shouldShowMoreSettings={form.shouldShowMoreSettings}
                      primaryText={item => item.label}
                      secondaryText={item => item.desc}
                      onClickOption={handleClickSettingOption}
                      onClickMoreSettings={onClickMoreSettings}
                  />
                  {form.more && <div>more.....</div>}
                </>
                :
                <MilestoneDate 
                  date={form.value.date} startDate={form.value.startDate} classes={classes}
                  handleDateChange={handleDateChange} handleCancelForm={handleCancelForm} handleSaveForm={handleSaveForm}
                  hasChanged={form.hasChanged} shouldAutosaveForm={shouldAutosaveForm} />
              )
            }
            {form?.formType === "photo" &&
              <Photos 
                userId={user._id}
                userPhotos={user.photos}
                selectedPhotoId={getSelectedPhotoId()}
                locationKey={form.location} 
                onSavePhoto={onSavePhoto}
                onSelect ={onSaveInfo(form.milestoneId, "photo")}
              />
            }
        </div>
      </div>
      <svg className={classes.svg} ref={containerRef} id={`milestones-bar`}>
        <defs>
          <filter id="shine">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
      {!form && <div className={classes.ctrls} onClick={onCtrlsAreaClick}>
        <IconButton className={classes.iconBtn} onClick={milestonesBar.slideBack}
            aria-label="Home" >
            <ArrowBackIosIcon className={classes.icon}/>
        </IconButton>
        <IconButton className={classes.iconBtn} onClick={milestonesBar.slideForward}
            aria-label="Home" >
            <ArrowForwardIosIcon className={classes.icon}/>
        </IconButton>
      </div>}
    </div>
  )
}

MilestonesBar.defaultProps = {
  contracts:[],
  profiles:[],
  data: { },
  datasets: [], 
  kpiFormat: "actual", 
  setKpiFormat: () => {},
  onSelectKpiSet: () => {},
  onCreateMilestone: () => {},
  onDeleteMilestone: () => {}, 
  takeOverScreen: () => {}, 
  releaseScreen: () => {}, 
  screen: {},
  availWidth: 0, 
  availHeight: 0,
  onSaveValue: () => {},
  onSaveInfo: () => () => {}
}

export default MilestonesBar;