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

export default function Form({ data, onUpdate, onClose, availableMeasures, addNewMeasure }) {
    //console.log("Form", data)
    const { planet } = data;
    const styleProps = { };
    const classes = useStyles(styleProps) 
    const [values, setValues] = useState({
        name: planet?.name || "",
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
                    id="name" type="name" placeholder="Goal Name" 
                    className={classes.textField} 
                    autoComplete='off'
                    autoFocus={true}
                    value={values.name} 
                    onChange={handleChange('name')}
                    onKeyDown={handleKeyDown}
                    margin="none"
                    size="small"
                    InputProps={{
                        classes: {
                            input: classes.resize,
                        },
                    }}
                />
                <MeasureFields 
                    planetMeasureData={planet.measures} 
                    availableMeasures={availableMeasures} 
                    addNewMeasure={details => addNewMeasure(details, planet.id)} />
                <br/> 
                {
                    values.error && (<Typography component="p" color="error">
                    <Icon color="error" className={classes.error}>error</Icon>
                    {values.error}
                    </Typography>)
                }
            </CardContent>
        </Card>
        )
}
