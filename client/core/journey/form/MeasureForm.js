import React, {useState} from 'react'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  card: {
    [theme.breakpoints.down('md')]: {
      width: "100%",
      height:"100%",
      overflowY:"scroll",
    },
    [theme.breakpoints.up('lg')]: {
      width: "500px",
      height:"700px",
    },
    margin: 'auto',
    textAlign: 'center',
    marginTop: 0, // props => props.fullEdit ? 0 : 10,
    paddingBottom: props => props.fullEdit ? theme.spacing(1) : 0,
  },
  cardContent:{
    padding:0,
    display:"flex",
    flexDirection:"column",
    alignItems:"center"
},
  title: {
    margin: theme.spacing(1),
    color: theme.palette.openTitle,
    fontSize:"10px",
    display:"flex",
    display:"flex",
    height:"40px",
    [theme.breakpoints.down('md')]: {
      width:"80%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    display:"flex",
    margin: theme.spacing(2),
    marginBottom:0,

    height:"40px",
    [theme.breakpoints.down('md')]: {
      width:"80%",
      //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
  },
  resize:{
    margin:0,
    fontSize:"12px",
    [theme.breakpoints.down('md')]: {
      fontSize:"10px"
    },
    [theme.breakpoints.up('lg')]: {
      fontSize:"12px"
    },
  },
}))

function MeasureForm({ measure, data, existingMeasures, onSave, onCancel }) {
    const { planet } = data;
    const styleProps = { };
    const classes = useStyles(styleProps) 
    const [values, setValues] = useState({
        name: measure.name || "",
        desc:measure.desc || "",
        error: ""
    })

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const handleKeyDown = (e) =>{
        if(e.keyCode === 13){
            onCancel();
        }
    }

    const onClickSave = () => {
        const { name, desc } = values;
        //todo - check existing
        onSave({ name, desc }, data.planet?.id, !!measure)

    }

    return (
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
                <TextField
                        type="submit"
                        id="name" type="name" label="Name"
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
                <TextField
                type="submit"
                id="desc" type="desc" label="Description"
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
                  style:{ fontSize:"6px", marginBottom:0, paddingBottom:0 }
                }}
            />
                {
                    values.error && (<Typography component="p" color="error">
                    <Icon color="error" className={classes.error}>error</Icon>
                    {values.error}
                    </Typography>)
                }
            </CardContent>
            <CardActions className={classes.actions}>
                <Button color="primary" variant="contained" onClick={onClickSave} className={classes.submit}>Save</Button>
                <Button color="primary" variant="contained" onClick={onCancel} className={classes.submit}>Cancel</Button>
            </CardActions>
        </Card>
        )
}

MeasureForm.defaultProps = {
    measure:{}
}
  
  export default MeasureForm;
