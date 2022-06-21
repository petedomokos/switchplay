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
    width: "100%",
    height:"100%",
    margin: 0,
    textAlign: 'center',
    paddingBottom: 0,
  },
  cardContent:{
      //border:"solid",
      margin:0,
      padding:0
  },
  error: {
    verticalAlign: 'middle'
  },
  textField: {
    //border:"solid",
    margin: 0,//theme.spacing(1),
    marginLeft:"3px",
    width:"100%",
    height:"100%",
  },
  resize:{
    margin:0,
    fontSize:"10px"
  },
}))

export default function TargetForm({ data, onUpdate, onClose }) {
    const { planet, measure } = data;
    //we can assume measure is defined on the planet for this form to be open
    const planetMeasure = { ...measure, ...planet.measures.find(m => m.id === measure.id) };
    //console.log("TargForm", data)
    const styleProps = { };
    const classes = useStyles(styleProps) 
    const [values, setValues] = useState({
        targ: planetMeasure?.targ? planetMeasure?.targ+"" : "",
        error: ""
    })

    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
        onUpdate(name, event.target.value)
    }

    const handleKeyDown = (e) =>{
        if(e.keyCode === 13){
            onClose();
        }
    }

    return (
        <Card className={classes.card}>
            <CardContent className={classes.cardContent}>
                
            <TextField
                type="submit"
                id="targ" type="targ" placeholder="Target"
                className={classes.textField} 
                autoComplete='off'
                autoFocus={true}
                value={values.targ} 
                onChange={handleChange('targ')}
                onKeyDown={handleKeyDown}
                margin="none"
                size="small"
                InputProps={{
                    disableUnderline: true,
                    classes: {
                        input: classes.resize,
                    },
                }}
            />
            {/**<br/>*/}
            {/**<br/>*/}
            {/**
                values.error && (<Typography component="p" color="error">
                <Icon color="error" className={classes.error}>error</Icon>
                {values.error}
                </Typography>)
            */}
            </CardContent>
        </Card>
        )
}
