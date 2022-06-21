import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import SettingsIcon from '@material-ui/icons/Settings';
import SimpleList from '../util/SimpleList';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import { getMeasureConfigForForm } from '../data/measures'
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DoneIcon from '@material-ui/icons/Done';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { DropdownSelector, RadioSelector } from '../util/Selector'

const useStyles = makeStyles(theme => ({
  root:{
    margin: theme.spacing(3),
    width:'calc(100% - '+theme.spacing(3) +'px)',
  },
  measuresTitle:{
    fontSize:'18px'
  },
  buttons:{

  },
  addMeasureButton:{

  },
  currentMeasuresTable:{

  },
  availableMeasuresTable:{
    maxHeight:'400px',
    overflowY:'auto',
  },
  measureConfigBackground:{
    position:'fixed',
    top:"0px",
    left:"0px",
    background:"black",
    width:"100vw", 
    height:"100vh",
    opacity:0.8
  },
  measureConfig:{
    position:'fixed',
    //bottom:'calc( 50vh - 200px)',
    top:'10vh',
    left:'5vw',
    height:'80vh',
    overflowY:'auto',
    width:'90vw',
    background:'aqua',
    border:'solid'
  }
}))


//todo - think about mins and maxes, and left/right side -> 
//do we give user the chance to add these when they select a measure for a dataset
//has dependancy on measureConfig object
export default function CreateDatasetMeasures({ current, available, add, update, remove}) {
    console.log("current", current)
    console.log("available", available)
    const [adding, setAdding] = useState(false);
    const [measureBeingConfigured, setMeasureBeingConfigured] = useState(null);
    const classes = useStyles()

    const saveConfig = config =>{
      console.log("saving config as", config)
      setMeasureBeingConfigured(null);
      update(measureBeingConfigured._id, {...config});
    }
    
    const currentMeasuresItemActions = {
      main:{
        onItemClick:setMeasureBeingConfigured,
        ItemIcon:({}) => <SettingsIcon/>
      },
      other:[{
        onItemClick:remove,
        ItemIcon:({}) => <DeleteIcon/>
      }]
    }

    const availableMeasuresItemActions = {
      main:{
         //give a temp id for manipulating before saved
         //@TODO - make _id a string
        onItemClick:(m,i) => add({...m, _id:Date.now()}),
        ItemIcon:({}) => <AddCircleIcon/>
      }
    }

    //todo - mins and maxes for datasets (these are absolute values fro all possible players - they 
    //are not targets for a group )
    //when user selectes a measure, a second menu pops up fro such questions
    //eg is there a maximum possible value for this measure?
    //also side can be added eg foot -> these will be added by the user when they select it
    //eg is this for left foot, right foot, both, n/a

    const constructSecondaryText = measure => {
      const parts = [measure.custom, measure.side, measure.nr]
        .filter(part => part && !["none", "unspecified"].includes(part))
      return parts.join("-")
    }
    return (
      <div className={classes.root}>
          <Typography variant="h6" className={classes.measuresTitle}>Measures</Typography>
          <div className={classes.currentMeasuresTable}>
              <SimpleList
                  title='Measures selected' 
                  emptyMesg='No measures yet' 
                  items={current}
                  itemActions={currentMeasuresItemActions}
                  primaryText={measure => measure.name}
                  secondaryText={measure=> constructSecondaryText(measure)} />
          </div>
          <div className={classes.buttons}>
              <Button 
                  color="primary" 
                  variant="contained"
                  onClick={() => setAdding(state => !state)} 
                  className={classes.addMeasureBtn}>{adding ? "Finished Measures" : "Add Measures"}</Button>
          </div>
  
          {adding && <div className={classes.availableMeasuresTable}>
                <SimpleList
                    title='Add Measure'
                    emptyMesg='No measures left to add'
                    items={available}
                    itemActions={availableMeasuresItemActions}
                    primaryText={measure => measure.name} />
            </div>}
          {measureBeingConfigured && <div className={classes.measureConfigBackground}></div>}
          {measureBeingConfigured && <div className={classes.measureConfig}>
                <MeasureConfig 
                    measure={measureBeingConfigured} 
                    saveConfig={saveConfig}/>
          </div>}
      </div>
  )
}

CreateDatasetMeasures.defaultProps = {
  availableMeasures:[]
}



const useConfigStyles = makeStyles(theme => ({
  root:{
    height:"100%"
    //margin: theme.spacing(3),
    
  },
  textField:{

  }
}))

const toStr = (value, configKey="") => {
  //(note values are not numbers so 0 = "0")
  switch(value){
    case "":{
      console.log("configkey", configKey)
      return configKey === "side" ? "unspecified" : "none";
    }
    case false:{ return "false";}
    case true:{ return "true";}
    default:{
      return value
    }
  }
}

const toValue = value => {
  switch(value){
    case "unspecified":{ return "";}
    case "none":{ return "";}
    case "false":{ return false;}
    case "true":{ return true;}
    default:{
      return value
    }
  }
}

const formatForServer = values => ({
  ...values,
  nr:toValue(values.nr),
  side:toValue(values.side),
  unit:toValue(values.unit),
  isMain:toValue(values.isMain),
  hidden:toValue(values.hidden)
})

//!had ext dep on measureConfig
const MeasureConfig = ({measure, saveConfig}) =>{
  const { nr, side, custom, unit, order, min, max, notes, isMain, hidden } = measure;
  const classes = useConfigStyles()
  const config = getMeasureConfigForForm(measure.key);
  console.log("measure", measure)
  console.log("config", config)

  const initState = {
    nr:toStr(nr) || toStr(config.nr.default),
    side:toStr(side, "side") || toStr(config.side.default),
    custom:custom || config.custom.default,
    unit:toStr(unit) || toStr(config.unit.default),
    order:order || config.order.default,
    min:min || config.min.default,
    max:max || config.max.default,
    notes:notes || config.notes.default,
    isMain:toStr(isMain) || config.isMain.default,
    hidden:toStr(hidden) || config.hidden.default
  }
  const [values, setValues] = useState(initState);
  const { name } = measure;
  const handleChange = name => event => {
    setValues({ ...values, [name]: event.target.value })
  }

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return function cleanup() {
      document.body.style.overflow = "initial"
    };
  }); 

  return (
    <div style={{margin:30}} className = {classes.root}>
      <div style={{margin:20, fontSize:"20px"}}>{name}</div>
      <RadioSelector
          id="side"
          formLabel='Side'
          options={config.side.options.map(opt => toStr(opt, "side"))}
          defaultOpt={values.side}
          onChange={handleChange("side")} />
       <br/> <br/> <br/>
      <RadioSelector
          id='number'
          formLabel='Number'
          options={config.nr.options.map(opt => toStr(opt))}
          defaultOpt={values.nr}
          onChange={handleChange("nr")} />
      <br/> <br/> <br/>
      {config.unit.options.length !== 0 &&
        <>
          <RadioSelector
            id="unit"
            formLabel='Unit'
            options={config.unit.options.map(opt => toStr(opt))}
            defaultOpt={values.unit}
            onChange={handleChange("unit")} />
          <br/> <br/> <br/>
        </>
      }
      <RadioSelector
        id="order"
        formLabel='Order'
        options={config.order.options.map(opt => toStr(opt))}
        defaultOpt={values.order}
        onChange={handleChange("order")} />
      <br/> <br/> <br/>
      <TextField 
        id="custom" label="Custom Label" 
        className={classes.textField} value={values.custom} 
        onChange={handleChange('custom')} margin="normal" placeholder="none"/>
      <br/>
      <TextField 
        id="min" label="Minimum possible value" 
        className={classes.textField} value={values.min} 
        onChange={handleChange('min')} margin="normal" placeholder="none"/>
      <br/>
      <TextField 
        id="max" label="Maximum possible value" 
        className={classes.textField} value={values.max} 
        onChange={handleChange('max')} margin="normal" placeholder="none"/>
      <br/>
      <TextField 
        id="notes" label="Notes" 
        className={classes.textField} value={values.notes} 
        onChange={handleChange('notes')} margin="normal" placeholder="none"/>
      <br/>
      <RadioSelector
        id="hidden"
        formLabel='Hide'
        options={config.hidden.options.map(opt => toStr(opt))}
        defaultOpt={values.hidden}
        onChange={handleChange("hidden")} />
      <br/> <br/> <br/>
      <RadioSelector
        id="isMain"
        formLabel='Is Main Measure'
        options={config.isMain.options.map(opt => toStr(opt))}
        defaultOpt={values.isMain}
        onChange={handleChange("isMain")} />
      <br/> <br/> <br/>
        <IconButton onClick={() => saveConfig(formatForServer(values))}>
            <DoneIcon style={{width:'50px', height:'50px', margin:"30px"}}/>
      </IconButton>

    </div>
  )
}