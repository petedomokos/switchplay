import React, { useState, useEffect } from 'react'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import SettingsIcon from '@material-ui/icons/Settings';
import SimpleList from '../util/SimpleList';
import DeleteIcon from '@material-ui/icons/Delete';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField'
import IconButton from '@material-ui/core/IconButton'
import DoneIcon from '@material-ui/icons/Done';
import { DropdownSelector, RadioSelector } from '../util/Selector'

const useStyles = makeStyles(theme => ({
  root:{
    margin: theme.spacing(3),
    width:'calc(100% - '+theme.spacing(3) +'px)',
  },
  calculationsTitle:{
    fontSize:'18px'
  },
  buttons:{

  },
  addCalculationButton:{

  },
  currentCalculationsTable:{

  },
  availableCalculationsTable:{
    maxHeight:'400px',
    overflowY:'auto',
  },
  calculationConfigBackground:{
    position:'fixed',
    top:"0px",
    left:"0px",
    background:"black",
    width:"100vw", 
    height:"100vh",
    opacity:0.8
  },
  calculationConfig:{
    position:'fixed',
    //bottom:'calc( 50vh - 200px)',
    top:'10vh',
    left:'5vw',
    height:'80vh',
    overflowY:'auto',
    width:'90vw',
    background:'aqua',
    border:'solid'
  },
  infobox:{
    padding:"30px",
    border:"solid",
    borderWidth:"thin",
    borderColor:"grey"
  },
  infoboxTitle:{
    margin:"10px"

  },
  infoboxSection:{
    margin:"5px"
  },
  infoboxSectionTitle:{
    margin:"5px"
  },
  //maths
  mathsBtnRow:{
    margin:"5px",
    display:'flex',
    justifyContent:'center',
    border:'solid'
  },
  //other
  measureBtns:{
    margin:"5px",
    display:'flex',
    justifyContent:'space-around',
    alignItems:'center',
    flexWrap:"wrap",
    border:'solid'
  },
  //5 * narrow = 2 * wide
  //tot 300
  narrowBtn:{
    flex:"50px 0 0",
    margin:"5px"
  },
  wideBtn:{
    flex:"200px 0 0",
    margin:"5px",
    fontSize:"12px"
  }
}))


export default function CreateDatasetCalculations({ currentCalculations, measures, add, update, remove}) {
    const classes = useStyles()
    const [adding, setAdding] = useState(false);
    const [calculationBeingConfigured, setCalculationBeingConfigured] = useState(null);
    const [values, setValues] = useState({name:"", formula:""});

    const handleChange = name => event => {
      setValues({ ...values, [name]: event.target.value })
    }

    const saveConfig = config =>{
      console.log("config now", config)
      setCalculationBeingConfigured(null);
      update(calculationBeingConfigured._id, {...config});
    }
    
    const currentCalculationsItemActions = {
      main:{
        onItemClick:setCalculationBeingConfigured,
        ItemIcon:({}) => <SettingsIcon/>
      },
      other:[{
        onItemClick:remove,
        ItemIcon:({}) => <DeleteIcon/>
      }]
    }

    const availableCalculationsItemActions = {
      main:{
         //give a temp id for manipulating before saved 
        onItemClick:(m,i) => add({...m, _id:Date.now()}),
        ItemIcon:({}) => <AddCircleIcon/>
      }
    }

    const constructSecondaryText = calculation => {
      const parts = [calculation.custom, calculation.side, calculation.nr]
        .filter(part => part && !["none", "unspecified"].includes(part))
      return parts.join("-")
    }

    //todo - return formatted so secondary is in span and smaller, lighter
    const constructMeasureText = m => {
      const secondaryParts = [m.custom, m.side, m.nr]
        .filter(part => part && !["none", "unspecified"].includes(part))
      const secondaryText = secondaryParts.length != 0 ? " (" +secondaryParts.join("-") +")" : "";
      return m.name + secondaryText;
    }


    return (
      <div className={classes.root}>
          <Typography variant="h6" className={classes.calculationsTitle}>Calculations</Typography>
          <div className={classes.currentCalculationsTable}>
              <SimpleList
                  title='Calculations selected' 
                  emptyMesg='No calculations yet' 
                  items={currentCalculations}
                  itemActions={currentCalculationsItemActions}
                  primaryText={calculation => calculation.name}
                  secondaryText={calculation=> constructSecondaryText(calculation)} />
          </div>
          <div className={classes.buttons}>
              <Button 
                  color="primary" 
                  variant="contained"
                  onClick={() => setAdding(state => !state)} 
                  className={classes.addCalculationBtn}>{adding ? "Finished Calculations" : "Add Calculations"}</Button>
          </div>
  
          {adding && <div className={classes.availableCalculationsTable}>
                <TextField 
                    id="name" label="Name" 
                    className={classes.textField} value={values.name} 
                    onChange={handleChange('name')} margin="normal" placeholder="none"/><br/>
                <TextField 
                    id="formula" label="Formula" 
                    className={classes.textField} value={values.formula} 
                    onChange={handleChange('formula')} margin="normal" placeholder="none"/><br/>
                <div className={classes.infobox}>
                    <div className={classes.infoboxTitle}>Create formula</div>
                    <div className={classes.infoboxSection}>
                        <div className={classes.measureBtns}>
                            <>
                              {measures.map(m => 
                                <Button
                                    color="primary" 
                                    variant="contained"
                                    onClick={() => {}} 
                                    className={classes.wideBtn}
                                    key={"btn-"+m._id} >
                                      {constructMeasureText(m)}
                                </Button>
                              )}
                            </>
                            <>
                              {currentCalculations.map(c => 
                                <Button
                                    color="primary" 
                                    variant="contained"
                                    onClick={() => {}} 
                                    className={classes.wideBtn}
                                    key={"btn-"+m._id} >
                                      {constructCalculationText(c)}
                                </Button>
                              )}
                            </>
                        </div>
                    </div>
                    <div className={classes.infoboxSection}>
                        <Calculator classes={classes}/>
                    </div>
                    
                    
                </div>
                 
          </div>}
      </div>
  )
}

const Calculator = ({classes}) =>{
  //helper
  const symb = name =>{
    switch(name){
      case "add": return <span>&#43;</span>
      case "minus": return <span>&minus;</span>
      case "multiply": return <span>&times;</span>
      case "divide": return <span>&divide;</span>
      case "(": return <span>&#8317;</span>
      case ")": return <span>&#8318;</span>
      case "square": return <span>X&#178;</span>
      case "square-root": return <span>&radic;</span>
      case "greater-than": return <span>&#62;</span>
      case "less-than": return <span>&#60;</span>
      case "equals": return <span>&#61;</span>
      case "and": return <span>AND</span>
      case "or": return <span>OR</span>
      default: return <span>{name}</span>
    }
  }
  const rows = [
    ["add","minus","multiply", "divide", "DEL"],
    ["(", ")", "square", "square-root", "C"],
    ["less-than", "greater-than", "equals", "AND", "OR"],
    [0, 1, 2, 3, 4],
    [5, 6, 7, 8, 9]
  ]
  return(
    <div>
      {rows.map((row,i) =>
          <div className={classes.mathsBtnRow} key={'row'+i}>
              {row.map(symbolName =>
                <Button
                    color="primary" 
                    variant="contained"
                    onClick={() => {}} 
                    className={classes.narrowBtn}
                    key={"btn-sym"+symbolName} >
                      {symb(symbolName)}
                  </Button>
              )}
        </div>
      )}
    </div>
  )
}


/*
const useConfigStyles = makeStyles(theme => ({
  root:{
    height:"100%"
    //margin: theme.spacing(3),
    
  },
  textField:{

  }
}))

//!had ext dep on calculationConfig
const CalculationConfig = ({calculation, saveConfig}) =>{
  const classes = useConfigStyles()
  const config = calculationConfig;
  //set to the calculations default value for each config item, or else the config item's built in default
  const initState = {
    nr:calculation.nr || config.nr.default,
    side:calculation.side || config.side.default,
    custom:calculation.custom || config.custom.default,
    unit:calculation.unit || config.unit.default,
    order:calculation.order || config.order.default,
    min:calculation.min || config.min.default,
    max:calculation.max || config.max.default,
  }
  const [values, setValues] = useState(initState);
  const { name } = calculation;
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
          options={config.side.options}
          defaultOpt={values.side}
          onChange={handleChange("side")} />
       <br/> <br/> <br/>
      <RadioSelector
          id='number'
          formLabel='Number'
          options={config.nr.options}
          defaultOpt={values.nr}
          onChange={handleChange("nr")} />
      <br/> <br/> <br/>
       <RadioSelector
          id="unit"
          formLabel='Unit'
          options={calculation.unitOptions || config.unit.options}
          defaultOpt={values.unit}
          onChange={handleChange("unit")} />
        <br/> <br/> <br/>
        <RadioSelector
          id="order"
          formLabel='Order'
          options={config.order.options}
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
         <IconButton onClick={() => saveConfig(values)}>
             <DoneIcon style={{width:'50px', height:'50px', margin:"30px"}}/>
        </IconButton>

    </div>
  )
}

*/