import React, {useState} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
import MeasureFields from "./MeasureFields";
import { DropdownSelector } from '../../../util/Selector'

const useStyles = makeStyles(theme => ({
  root:{
    width:"80%",
    height:"120px",
    padding:"5px",
    paddingTop:"5px",
    border:"solid",
    borderColor:"grey",
    borderWidth:"0.25px",
    display:"flex",
    flexDirection:"column"
  },
  nameWrapper:{
    display:"flex"
  },
  nameTextField: {
    display:"flex",
    margin: theme.spacing(1),
    marginTop:0,
    //height:"10px",
    //marginBottom:0,
    fontSize:"10px",
    [theme.breakpoints.down('md')]: {
      width:"80px",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"350px"
    },
  },
  or:{
    margin:theme.spacing(1),
    fontSize:"8px"
  },
  textField: {
    display:"flex",
    margin: theme.spacing(1),
    marginTop:0,
    //height:"10px",
    //marginBottom:0,
    fontSize:"10px",
    [theme.breakpoints.down('md')]: {
      width:"70%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"350px"
    },
  },
  label:{
    //border:"solid",
    [theme.breakpoints.down('md')]: {
      width:"80%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
    display:"flex",
    fontSize:"6px",
    opacity:0.8
  },
  resize:{
    margin:0,
    fontSize:"10px",
    [theme.breakpoints.down('md')]: {
      fontSize:"8px"
    },
    [theme.breakpoints.up('lg')]: {
      fontSize:"10px"
    },
  },
  actions:{
    alignSelf:"end",
    marginTop:0,
    paddingTop:0
  },
  submit: {
    margin: 'auto',
    width:30,
    height:15,
    fontSize:7,
    marginBottom: theme.spacing(1)
  },
  error: {
    verticalAlign: 'middle'
  },
}))

function EditMeasureFields({ measure, availableMeasures, onSave, allowExistingMeasures }) {
    const styleProps = { };
    const classes = useStyles(styleProps)
    const [focus, setFocus] = useState(null);
    const [values, setValues] = useState({
        name: measure?.name || "",
        desc: measure?.desc || "",
        targ: measure?.targ || "",
        error: ""
    })

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
        //onUpdate(name, event.target.value)
    }

    const handleKeyDown = (e) =>{
        if(e.keyCode === 13){
            setFocus(null);
        }
    }

    const handleSelectChange = e => {
      console.log("value", e.target.value)
      //setValues({ ...values, [name]: e.target.value })
    }

    return (
        <div className={classes.root}>
            <div className={classes.label}>Name</div>
            <div className={classes.nameWrapper}>
                <TextField
                    type="submit"
                    id="name" type="name" placeholder="enter..."
                    className={classes.nameTextField} 
                    autoComplete='off'
                    value={values.name} 
                    onChange={handleChange('name')}
                    onKeyDown={handleKeyDown}
                    margin="none"
                    size="small"
                    InputProps={{
                        classes: {
                            input: classes.resize
                        },
                    }}
                    InputLabelProps={{
                      style:{ fontSize:"6px" }
                    }}
                />
                {allowExistingMeasures &&
                  <>
                      <div className={classes.or}>or</div>
                      <DropdownSelector
                          options={availableMeasures}
                          labelAccessor={option => option.name}
                          handleChange={handleSelectChange}
                          style={{margin:0, width:"80px", height:"20px", fontSize:"7px"}}
                      />
                  </>}
            </div>
            <div className={classes.label}>Description</div>
            <TextField
                type="submit"
                id="desc" type="desc" placeholder="enter..."
                className={classes.textField} 
                autoComplete='off'
                value={values.desc} 
                onChange={handleChange('desc')}
                onKeyDown={handleKeyDown}
                margin="none"
                size="small"
                InputProps={{
                    classes: {
                        input: classes.resize,
                    },
                }}
                InputLabelProps={{
                  style:{ fontSize:"6px", marginBottom:0, paddingBottom:0, border:"solid" }
                }}
            />
            <div className={classes.label}>Target</div>
            <TextField
                type="submit"
                id="targ" type="targ" placeholder="enter..."
                className={classes.textField} 
                autoComplete='off'
                value={values.targ} 
                onChange={handleChange('targ')}
                onKeyDown={handleKeyDown}
                margin="none"
                size="small"
                InputProps={{
                    classes: {
                        input: classes.resize,
                    },
                    style:{ margin:0, padding:0 }
                }}
                InputLabelProps={{
                  style:{ fontSize:"6px", margin:0, padding:0 }
                }}
            />
            <CardActions className={classes.actions}>
                <Button color="primary" variant="contained" onClick={() => onSave(values)} className={classes.submit}>Save</Button>
            </CardActions>
            <br/> 
            {
                values.error && (<Typography component="p" color="error">
                <Icon color="error" className={classes.error}>error</Icon>
                {values.error}
                </Typography>)
            }
        </div>
        )
}


EditMeasureFields.defaultProps = {
  allowExisitingMeasures:true
}

export default EditMeasureFields;
