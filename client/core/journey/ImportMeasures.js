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
  actions:{

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

function ImportMeasures({ data, existing, available, onSave, onClose }) {
    const { filters } = data;
    //console.log("ImportMeasures", data)
    const styleProps = { };
    const classes = useStyles(styleProps) 
    const [values, setValues] = useState({
        measureIds: [],
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
                <Typography variant="h6" className={classes.title}>
                    Import Measures
                </Typography>
            </CardContent>
            <CardActions className={classes.actions}>
                <Button color="primary" variant="contained" onClick={() => onSave(values.measureIds)} className={classes.submit}>Import</Button>
                <Button color="primary" variant="contained" onClick={onClose} className={classes.submit}>Cancel</Button>
            </CardActions>
        </Card>
        )
}

ImportMeasures.defaultProps = {
    data:{},
    available:[],
    existing:[]
}

export default ImportMeasures;
