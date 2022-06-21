import React, { useState, useEffect } from 'react'
import {Link} from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import { withLoader } from '../../util/HOCs';
import { DropdownSelector } from "../../util/Selector";
import SelectPlayer from "./SelectPlayer";
import SelectEventDate from "./SelectEventDate";
import EnterGeneralValues from "./EnterGeneralValues";
import EnterMeasureValues from "./EnterMeasureValues";
import { fatigueLevel, surface } from "../../data/datapointOptions";

const useStyles = makeStyles(theme => ({
  card: {
    [theme.breakpoints.down('md')]: {
      width:'90vw',
    },
    [theme.breakpoints.up('lg')]: {
      width:'600px',
    },
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2),
    display:'flex',
    flexDirection:'column',
    alignItems:'center'
  },
  error: {
    verticalAlign: 'middle'
  },
  title: {
    marginTop: theme.spacing(2),
    color: theme.palette.openTitle
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: '90%'
  },
  dateContainer:{
    marginTop: theme.spacing(6)
  },
  generalValuesContainer:{
    marginTop: theme.spacing(10),
    marginBottom: theme.spacing(5),
    display:"flex",
    flexDirection:"column",
    alignItems:'center',
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  },
  otherBtn:{
    margin: theme.spacing(1)
  }
}))

function CreateDatapoint({ userId, datasets, players, creating, error, success, open, submit, closeDialog, userLoadsComplete, loadUsers, loadingUsers, loadDataset, loadingDataset }) {
  const classes = useStyles()
  const _fatigueLevel = fatigueLevel || {};
  const _surface = surface || {};
  const initState = {
      dataset:null,
      player: null,
      notes:"",
      surface:surface.default || "",
      fatigueLevel:fatigueLevel.default || "",
      date:Date.now(),
      isTarget:false,
      //location:"", //todo - location geography
      values:[],
  }
  const [values, setValues] = useState(initState)
  const [showGeneralMeasures, setShowGeneralMeasures] = useState(false)
  //warn user if they try to re-enter datapoint with same details
  //todo - this goes true on submit, and resets to false when either dataset, player or date changes
  const [datapointEntered, setDatapointEntered] = useState(false);

  //submit btn doesnt show until all values are entered
  const datapointReadyToSave = values.dataset && values.dataset.measures && 
    values.values.filter(v => v.value !== "" && typeof v.value === "string")
                        .length === values.dataset.measures.length

  useEffect(() =>{
    //update dataset in state once the dataset measures have been loaded from the server for the selected dataset
    //(needed so select options are in sync with selection, and for easy access of dataset measures)
    if(values.dataset){
      const updatedDataset = datasets.find(d => d._id === values.dataset._id);
      const updatedMeasureValues = updatedDataset.measures ? 
        updatedDataset.measures.map(m => ({
          measure:m._id,
          value:""
      })) : [];
      setValues(prevState => ({ 
          ...prevState, 
          dataset: updatedDataset,
          values: updatedMeasureValues
      }))
    }
  }, [datasets, values.dataset])


  //useEffect to reset dialog and error when unmounting (in case user moves away from component)
  //if this doesnt work, we can always reset in useEffcet itself if need be, although thats a bit wierd
  useEffect(() => {
    //note - if we check open here, it gives false, dont know why, so we just closeDialog always.
    return () => {
        closeDialog();
      //if(error || success){
        //resetAsyncProcesses
     // }
    };
  }, []); // will only apply once, not resetting the dialog at teh end of every render eg re-renders

  const handleChange = name => event => {
    //reset the check to stop double entry of same point
    if(datapointEntered && ['dataset', 'player'.includes(name)]){
      setDatapointEntered(false);
    }
    setValues({ ...values, [name]: event.target.value })
  }

  const handleDateChange = event => {
    //reset the check to stop double entry of same point
    if(datapointEntered){
      setDatapointEntered(false);
    }
    const now = new Date()
    const date = new Date(event.target.value) 
    const _isTarget = now < date ? true : false
    setValues({...values,date:date.getTime(), isTarget:_isTarget})
  }

  const clickSubmit = () => {
      if(datapointEntered){
        alert("WARNING: You have already saved a datapoint for this dataset, player and date.")
      }else{
        setDatapointEntered(true);
      }

      const { dataset, player, ...datapointValues } = values;
      const datapoint = {
        ...datapointValues,
        createdBy:userId,
        player:player._id
      };
      submit(dataset._id, datapoint);
  }

  const reset = () =>{
    //console.log('reset-------')
      closeDialog();
      setValues(initState)
  }

  const handleMeasureChange = (event, measure) =>{
    const { value } = event.target;
    //note - in measureValue, measure is just the measure _id ref(see value.model)
    const measureValueToUpdate = values.values.find(m => m.measure === measure._id);
    const updatedMeasureValue = { ...measureValueToUpdate, value : value };
    const otherMeasureValues = values.values.filter(m => m.measure !== measure._id)
    setValues(prevState => ({ ...prevState,values:[...otherMeasureValues, updatedMeasureValue] }));
  }

  return (
    <div>
      <Card className={classes.card}>
        <CardContent>
            <Typography variant="h6" className={classes.title}>
              Create Datapoint
            </Typography>
            <DropdownSelector
                description="Dataset"
                selected={values.dataset}
                options={datasets}
                labelAccessor = {option => option.name}
                handleChange={handleChange('dataset')} 
                />
            <SelectPlayer
                selected={values.player}
                players={players}
                handleChange={handleChange('player')}
                userLoadsComplete={userLoadsComplete}
                onLoad={loadUsers}
                loading={loadingUsers}
                />
            <SelectEventDate 
              handleChange={handleDateChange} 
              selectedDate={values.eventDate}
              classes={classes}
            />
            {values.dataset && values.player && <EnterMeasureValues
                measures={values.dataset.rawMeasures}
                values={values.values}
                handleChange= {handleMeasureChange}
                onLoad={() => loadDataset(values.dataset._id)}
                loading={loadingDataset}
            />}
            <div className={classes.generalValuesContainer}>
                <Button
                  onClick={() => setShowGeneralMeasures(prevState => !prevState)}
                  className={classes.otherBtn}
                  color="primary" autoFocus="autoFocus" variant="contained">
                  {showGeneralMeasures ? "Hide options" : "Show more options"}
                </Button>
                {showGeneralMeasures && <EnterGeneralValues
                      values={values}
                      optionObjects = {{
                        fatigueLevel:fatigueLevel,
                        surface:surface
                      }}
                      handleChange={handleChange}
                      />}
            </div>
        </CardContent>
        {datapointReadyToSave && <CardActions>
            <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
        </CardActions>}
      </Card>
      <Dialog open={open} disableBackdropClick={true}>
          <DialogTitle>New Datapoint</DialogTitle>
          <DialogContent>
            <DialogContentText>
              New datapoint successfully created.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={reset} color="primary" autoFocus="autoFocus" variant="contained">
            Create another
            </Button>
            <Link to={"/"} >
                <Button color="primary" autoFocus="autoFocus" variant="contained">
                Return home
                </Button>
            </Link>
          </DialogActions>
      </Dialog>
    </div>
  )
}

CreateDatapoint.defaultProps = {
  availableMeasures:[],
  open:false,
  loadDataset:() =>{}
}

//note - loader will load user if no datapoints
export default withLoader(CreateDatapoint, ['datasets', /* 'measures'*/]);