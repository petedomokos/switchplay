import React from 'react'
import TextField from '@material-ui/core/TextField'
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
//other third party
import MomentUtils from '@date-io/moment'
import * as moment from 'moment';

//todo - move wrapper to root of app
/*
2020 18:37:55 GMT+0000 (Greenwich Mean Time)" does not conform 
to the required format.  The format is "yyyy-MM-ddThh:mm" 
followed by optional ":ss" or ":ss.SSS".*/
const color = "white";
const SelectDate = ({type, dateFormat, defaultValue, handleChange, withLabel, classes}) => {
    const label = () => {
        if(!withLabel){ return null; }
        if(type.includes("date") && type.includes("time")){ return "Date And Time"; }
        if(type.includes("date")){ return "Date"; }
        return "Time";
    }

    const defaultMoment = defaultValue ? moment(defaultValue) : moment();
    return (
        <div className={classes.dateContainer}>
            <MuiPickersUtilsProvider utils={MomentUtils}>   
                <form noValidate>
                    <TextField
                        className={classes.textField}
                        SelectProps={{
                            classes: { 
                                icon: classes.inputColor,
                                keyboardIcon: classes.inputColor 
                            },
                          }}
                        id={type}
                        label={label()}
                        type={type}
                        onChange={handleChange}
                        defaultValue={defaultMoment.format(dateFormat)}
                        InputProps={{
                            className: classes.inputColor
                        }}
                        InputLabelProps={{
                            shrink: true,
                            className: classes.inputColor
                        }}/>
                </form>
            </MuiPickersUtilsProvider>
        </div>
    )
}

SelectDate.defaultProps = {
    withLabel:true,
    dateFormat:"YYYY-MM-DDTHH:mm",
    type:"datetime-local",
    classes:{
        dateContainer:"",
        textField:""
    },
    handleChange: () => {}
  }
export default SelectDate;