import React, { useEffect, useState } from 'react'
import { CSSTransition } from "react-transition-group";
import * as d3 from 'd3';
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import { Input } from '@material-ui/core';
import { grey10 } from "./cards/constants"

const welcome = [
    "Hi,",
    "Switchplay is a brand new app, on trial at clubs, and is transforming their ability to manage the player development process.",
    "Please register to receive a demo, or contact me.",
    "Thanks!",
    "Peter Domokos"
]
  

const useStyles = makeStyles(theme => ({
    welcomeMessage:{
        padding:"0 30px",
        //width:"100%",
        height:"100%",
        //background:"blue"
    },
    welcomeText:{
        color:grey10(5),
        fontSize:"12px",
        marginBottom:"5px"

    },
    callsToAction:{
        paddingTop:"20px",
        height:"120px",
        display:"flex",
        flexDirection:"column",
        //justifyContent:"center",
        //alignItems:"ce",
        //border:"solid",
        borderColor:"yellow"
    },
    btn:{
        margin:"15px 20px 10px 0",
        width:"80px",
        height:"25px"
    },
    input:{
        padding:"0px 10px",
        fontSize:"14px",
        width:"270px",
        color:"black",
        background:grey10(3)
    }
}))

export default function WelcomeMessage({style}){
  const classes = useStyles({ });

    return (
        <div className={classes.welcomeMessage} style={style.root || {}}>
            {welcome.map(line => 
                <Typography className={classes.welcomeText} type="body1" component="p">
                {line}
                </Typography>
            )}
            <div className={classes.callsToAction}>
                <Input
                    id="desc" onChange={() => {}} margin="dense" className={classes.input}
                    disableUnderline  placeholder="Enter email..."
                />
                <Button color="primary" variant="contained" onClick={() => {}} className={classes.btn}>Register</Button>
            </div>

        </div>
    )
}

WelcomeMessage.defaultProps = {
    style:{},
  }
