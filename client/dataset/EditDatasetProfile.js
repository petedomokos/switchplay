import React, {useState, useEffect} from 'react'
import { Redirect } from 'react-router-dom'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import { withLoader } from '../util/HOCs';
import { isIn } from '../util/ArrayHelpers'
import CreateDatasetMeasures from './CreateDatasetMeasures'

const useStyles = makeStyles(theme => ({
  card: {
    maxWidth: 600,
    margin: 'auto',
    textAlign: 'center',
    marginTop: theme.spacing(5),
    paddingBottom: theme.spacing(2)
  },
  title: {
    margin: theme.spacing(2),
    color: theme.palette.protectedTitle
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    width: 300
  },
  measuresContainer:{
    display:"flex",
    flexDirection:"column",
    alignItems:'center',
  },
  submit: {
    margin: 'auto',
    marginBottom: theme.spacing(2)
  }
}))


function EditDatasetProfile({ signedInUserId, dataset, availableMeasures, onUpdate, updating, updatingError, history }) {

  console.log("split empty", "".split(" "))
  //console.log("EditDatasetProfile", dataset)
  const classes = useStyles()
  const initState = {
    name:dataset.name || '', //must be unique to this user
    initials:dataset.initials || '', //max 5 chars
    desc:dataset.desc || '',
    tags:dataset.tags.join(" "),
    notes:dataset.notes || '',
    measures:dataset.measures,
    calculations:dataset.calculations,
    admin:dataset.admin
  }
  
  const [values, setValues] = useState(initState);
  console.log("values", values)

  const formatMeasures = measures => 
      measures.map(measure => ({
        ...measure,
        nr:measure.nr === "none" ? "" : measure.nr,
        side:measure.side === "none" ? "" : measure.side,
        unit:measure.unit === "none" ? "" : measure.unit,
        //new measures will have a temp number id assigned here in client, so need proper id on server
        _id: typeof measure._id === 'string' ? measure._id : undefined
      })
  )

  const clickSubmit = () => {
    let formData = new FormData();
    formData.append('name', values.name)
    formData.append('initials', values.initials)
    formData.append('desc', values.desc)
    const formattedTags = values.tags.split(" ");
    formData.append('tags', JSON.stringify(formattedTags))
    formData.append('notes', values.notes)
    console.log("measures", values.measures)
    const formattedMeasures = formatMeasures(values.measures)
    console.log("formattedmeasures", formattedMeasures)
    formData.append('measures', JSON.stringify(formatMeasures(values.measures)))
    formData.append('calculations', JSON.stringify(values.calculations))
    //may need to map to id
    //@TODO - check if admin is causing an issue - its just an id but seems to be read as a populated object before its saved,
    //but only an id after
    //formData.append('admin', JSON.stringify(values.admin))
    //values.photo && formData.append('photo', values.photo)
    onUpdate(dataset._id, formData, history)
  }

  const handleChange = name => event => {
    setValues({...values, [name]: event.target.value})
  }

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

  if(!isIn(dataset.admin, signedInUserId)){
    alert('You do not have permission to edit this dataset.')
    //todo - redirect to 'from'
    return <Redirect to='/'/>
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h6" className={classes.title}>
          Edit Profile
        </Typography>
        <TextField id="name" label="Name" className={classes.textField} value={values.name} onChange={handleChange('name')} margin="normal"/><br/>
        <TextField id="initials" label="Initials" className={classes.textField} value={values.initials} onChange={handleChange('initials')} margin="normal"/><br/>
        <TextField id="desc" label="Description" className={classes.textField} value={values.desc} onChange={handleChange('desc')} margin="normal"/><br/>
        <TextField id="tags" label="Tags" className={classes.textField} value={values.tags} onChange={handleChange('tags')} margin="normal"/><br/>
        <TextField id="notes" label="Notes" className={classes.textField} value={values.notes} onChange={handleChange('notes')} margin="normal"/>
        <br/> {
          values.error && (<Typography component="p" color="error">
            <Icon color="error" className={classes.error}>error</Icon>
            {values.error}
          </Typography>)
        }
        <div className={classes.measuresContainer}>
          <CreateDatasetMeasures
              available={availableMeasures} 
              current={values.measures}
              add={addItemToProperty("measures")}
              update={updateItemInProperty("measures")}
              remove={removeItemFromProperty("measures")} />
        </div>
      </CardContent>
      <CardActions>
        <Button color="primary" variant="contained" onClick={clickSubmit} className={classes.submit}>Submit</Button>
      </CardActions>
    </Card>
  )
}

EditDatasetProfile.defaultProps = {
  dataset:{
    _id:'',
    datasetname:'',
    firstname:'',
    surname:'',
    email:''
  },
  onUpdate:() =>{}
}

const Loading = <div>Dataset is loading</div>

//load dataset if we dont have deep version
export default withLoader(EditDatasetProfile, ['dataset.datapoints'], {alwaysRender:false, LoadingPlaceholder:Loading});

