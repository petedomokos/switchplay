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
/*
const color = "yellow";
const SelectDate = ({dateFormat, label, handleChange, classes}) =>
    <div className={classes.dateContainer}>
        <MuiPickersUtilsProvider utils={MomentUtils}>  
            <DatePicker
                id="datetime-local"
                label="Date and Time"
                type="datetime-local"
                onChange={handleChange}
                defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
                color="white"
                InputProps={{
                    className: classes.inputColor
                }}
                SvgProps={{
                    className: classes.inputColor
                }}
                InputLabelProps={{
                    shrink: true,
                    className: classes.inputColor
                }}
                defaultValue={moment().format("YYYY-MM-DDTHH:mm")}>
            </DatePicker>
        </MuiPickersUtilsProvider>
    </div>
*/
const color = "white";
const SelectDate = ({dateFormat, label, handleChange, classes}) =>
    <div className={classes.dateContainer}>
        <MuiPickersUtilsProvider utils={MomentUtils}>   
            <form noValidate>
                <TextField
                    className={classes.textField}
                    sx={{
                        svg: { color },
                        input: { color },
                        label: { color }
                      }}
                    color="white"
                    id="datetime-local"
                    label="Date and Time"
                    type="datetime-local"
                    onChange={handleChange}
                    defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
                    InputProps={{
                        className: classes.inputColor
                    }}
                    SvgProps={{
                        className: classes.inputColor
                    }}
                    InputLabelProps={{
                        shrink: true,
                        className: classes.inputColor
                    }}/>
            </form>
        </MuiPickersUtilsProvider>
    </div>

SelectDate.defaultProps = {
    dateFormat:"YYYY-MM-DDTHH:mm",
    classes:{
        dateContainer:"",
        textField:""
    },
    handleChange: () => {}
  }
export default SelectDate;