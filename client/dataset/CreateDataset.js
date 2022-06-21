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
import CreateDatasetMeasures from './CreateDatasetMeasures'
import CreateDatasetCalculations from './CreateDatasetCalculations'
import { withLoader } from '../util/HOCs';

const useStyles = makeStyles(theme => ({
  card: {
    width:'90vw',
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
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
  measuresContainer:{
    display:"flex",
    flexDirection:"column",
    alignItems:'center',
  },
  calculationsContainer:{
    display:"flex",
    flexDirection:"column",
    alignItems:'center',
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))

function CreateDataset({ user, availableMeasures, creating, error, success, open, submit, closeDialog }) {
  console.log("open", open)
  const classes = useStyles()
  const initState = {
      name: '', //must be unique to this user
      initials:'', //max 5 chars
      desc:'',
      tags:'',
      notes:'',
      datasetType:'',
      measures:[],
      calculations:[],
      admin:[user._id]
  }

  const [values, setValues] = useState(initState)

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
    setValues({ ...values, [name]: event.target.value })
  }

  const clickSubmit = () => {
    if(user.administeredDatasets.find(grp => grp.name === values.name)){
      alert('You already have a dataset with this name.')
    }
    else if(values.initials.length >= 6){
      alert('Dataset initials must be 5 characters or less.')
    }
    /*
    //todo - measures match method
    else if(measuresMatch(values.measures)){
       alert('You have measures with the same name and configuration. Change then name, number or side, or use custom labels to distinguish.')
    }
    */
    else{
      const dataset = {
        parent: values.parent || undefined,
        name: values.name || undefined,
        initials: values.initials || undefined,
        desc: values.desc || undefined,
        notes: values.notes || undefined,
        tags: values.tags.split(" "),
        datasetType: values.datasetType || undefined,
        //we dont save measure._id to server, as it is given an _id in db
        measures: values.measures.map(m => ({ ...m, _id:undefined })),
        calculations: values.calculations.map(c => ({ ...c, _id:undefined })),
        admin:values.admin || [user._id]
      };

      submit(dataset);
    }
  }

  const reset = () =>{
    //console.log('reset-------')
      closeDialog();
      setValues(initState)
  }
  //get dataset once it has been saved to store (unless thre was error)
  const savedDataset = user.loadedDatasets.find(grp => grp.name === values.name);

  const addItemToProperty = key => item =>{
    setValues(prevState => ({ ...prevState, [key]:[...prevState[key], item] }))
  }
  
  const updateItemInProperty = key => (id, propertiesToUpdate) =>{
    //helper
    const update = (oldItem, properties) => ({...oldItem, ...properties})
    //to maintain order, we map each item to itself except the updated one
    const updatedItems = values[key]
      .map(item => item._id === id ? update(item, propertiesToUpdate) : item)

    setValues(prevState => ({ ...prevState, [key]: updatedItems }));
  }

  const removeItemFromProperty = key => item =>{
    setValues(prevState => ({
      ...prevState,
      [key]:prevState[key].filter(it => it._id !== item._id) 
    }));
  }

  return (<div>
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Create Dataset
        </Typography>
        <TextField 
              id="name" label="name" className={classes.textField} value={values.name} 
              onChange={handleChange('name')} margin="normal"/><br/>
        <TextField 
            id="initials" label="Initials (max 5)" className={classes.textField} 
        value={values.initials} onChange={handleChange('initials')} margin="normal"/><br/>
        <TextField 
            id="desc" label="Description" className={classes.textField} 
            value={values.desc} onChange={handleChange('desc')} margin="normal"/><br/>
        <TextField 
            id="tags" label="Tags" className={classes.textField} 
            value={values.tags} onChange={handleChange('tags')} margin="normal"/><br/>
        <TextField 
            id="notes" label="Notes" className={classes.textField} 
            value={values.notes} onChange={handleChange('notes')} margin="normal"/><br/>
        <br/> {
          values.error && (<Typography component="p" color="error">
            <Icon color="error" className={classes.error}>error</Icon>
            {values.error}</Typography>)
        }
        <div className={classes.measuresContainer}>
          <CreateDatasetMeasures
              available={availableMeasures} 
              current={values.measures}
              add={addItemToProperty("measures")}
              update={updateItemInProperty("measures")}
              remove={removeItemFromProperty("measures")} />
        </div>
        <div className={classes.calculationsContainer}>
          <CreateDatasetCalculations
              currentCalculations={values.calculations}
              measures={values.measures}
              add={addItemToProperty("calculations")}
              update={updateItemInProperty("calculations")}
              remove={removeItemFromProperty("calculations")} />
        </div>
         {/**current.length != 0 && <SelectMainDisplayValue calculations={current} />  can be a measure or a calculation**/}
      </CardContent>
      <CardActions>
        <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
      </CardActions>
    </Card>
    <Dialog open={open} disableBackdropClick={true}>
      <DialogTitle>New Dataset</DialogTitle>
      <DialogContent>
        <DialogContentText>
          New dataset successfully created.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={reset} color="primary" autoFocus="autoFocus" variant="contained">
        Create another
        </Button>
        {savedDataset && <Link to={"/dataset/"+savedDataset._id} >
            <Button color="primary" autoFocus="autoFocus" variant="contained">
            Go to dataset
            </Button>
      </Link>}
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

CreateDataset.defaultProps = {
  availableMeasures:[],
  open:false
}

export default withLoader(CreateDataset, ['user',/* 'measures'*/]);