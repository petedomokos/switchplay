import React, { useEffect, useState, useRef } from 'react'
import * as d3 from 'd3';
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

export default function NameForm({ data, onUpdate, onClose }) {
    const { aim, planet, nameOnly, nameAndTargOnly } = data;
    //console.log("NameForm", data)
    const styleProps = { };
    const classes = useStyles(styleProps) 
    const [values, setValues] = useState({
        name: aim? (aim.name || "") : (planet?.name || ""),
        error: ""
    })

    const handleChange = name => event => {
        //console.log("name change")
        setValues({ ...values, [name]: event.target.value })
        onUpdate(name, event.target.value)
    }

    const handleKeyDown = (e) =>{
        //console.log("key down", e.keyCode)
        if(e.keyCode === 13){
            onClose();
        }
    }

    const containerRef = useRef(null);
    useEffect(() => {
        d3.select(containerRef.current)
            .style("opacity", 0)
                .transition()
                    .delay(100)
                    .duration(200)
                    .style("opacity", 1)

    }, [])

    return (
        <Card className={classes.card} key={aim?.id || planet?.id} ref={containerRef}>
            <CardContent className={classes.cardContent}>
            <TextField
                type="submit"
                id="name" type="name" placeholder="Name"
                className={classes.textField} 
                autoComplete='off'
                autoFocus={nameAndTargOnly ? false : true}
                value={values.name} 
                onChange={handleChange('name')}
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
