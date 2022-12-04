import React, {useState} from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'
import EditMeasureFields from "./EditMeasureFields"
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    root: {
        width:"90%",
        display:"flex",
        flexDirection:"column",
        alignItems:"center",
        overflow:"scroll"
    },
    title: {
        margin: 0,//theme.spacing(1),
        marginTop:0,
        color: theme.palette.openTitle,
        fontSize:"10px",
        display:"flex",
        height:"15px",
        [theme.breakpoints.down('md')]: {
        width:"80%",
        //fontSize:"40px"
        },
        [theme.breakpoints.up('lg')]: {
        width:"400px"
        },
    },
    subtitle: {
        margin: theme.spacing(1),
        marginTop:0,
        color: theme.palette.openTitle,
        display:"flex",
        height:"10px",
        fontSize:"8px",
        [theme.breakpoints.down('md')]: {
        width:"80%",
        //fontSize:"40px"
        },
        [theme.breakpoints.up('lg')]: {
        width:"400px"
        },
    },
    measuresCont:{
        width:"80%",
        margin: theme.spacing(1),
        //border:"solid"
    },
    measure:{

    },
    measureName:{
        fontSize:"10px"
    },
    measureDesc:{ 
        fontSize:"7px"  
    },
    measureTarg:{
        fontSize:"7px"  
    },
    noneMesg:{
        color:"grey",
        fontSize:"6px",
        display:"flex",
        height:"10px",
        [theme.breakpoints.down('md')]: {
        width:"100%",
        //fontSize:"40px"
    },
    [theme.breakpoints.up('lg')]: {
        width:"400px"
    },
  }
}))

function MeasureFields({ planetMeasureData, availableMeasures, addNewMeasure }) {
    const getMeasure = planetMeasure => availableMeasures.find(m => m.id === planetMeasure.measureId);
    const styleProps = { };
    const classes = useStyles(styleProps);
    //wrong
    const [measureEditing, setMeasureEditing] = useState(null);
    /*const [measures, setMeasures] = useState({
        name: measure?.name || "",
        desc: measure?.desc || "",
        targ: measure?.targ || "",
        error: ""
    })
    */

    const saveNewMeasure = (details) => {
        console.log("saving measure", details)
    }

    return (
        <div className={classes.root}>
            <Typography variant="h6" className={classes.title}>
            Measures
            </Typography>
            <div className={classes.measuresCont}>
                { 
                    planetMeasureData?.length !== 0 ? 
                        <>
                            {planetMeasureData?.map(m => 
                                <div className={classes.measure} key={"meas"+m.measureId}>
                                    {
                                        measureEditing === m.measureId ?
                                            <div>edit version of measure</div>
                                            :
                                            <>
                                                <Typography variant="h6" className={classes.measureName}>{getMeasure(m).name}</Typography>
                                                <Typography variant="h6" className={classes.measureDesc}>{getMeasure(m).desc}</Typography>
                                                <Typography variant="h6" className={classes.measureTarg}>{m.targ}</Typography>
                                            </>
                                    }
                                </div>
                            )}
                        </>
                        :
                        <Typography variant="h6" className={classes.noneMesg}>None yet. Add below.</Typography>
                }
            </div>
            <EditMeasureFields availableMeasures={availableMeasures} onSave={addNewMeasure} />
                    
        </div>
        )
}


MeasureFields.defaultProps = {
    availableMeasures:[]
}

export default MeasureFields
