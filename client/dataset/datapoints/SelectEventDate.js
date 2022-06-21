import React from 'react'
import TextField from '@material-ui/core/TextField'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
//other third party
import MomentUtils from '@date-io/moment'
import * as moment from 'moment';

//todo - move wrapper to root of app
/*
2020 18:37:55 GMT+0000 (Greenwich Mean Time)" does not conform 
to the required format.  The format is "yyyy-MM-ddThh:mm" 
followed by optional ":ss" or ":ss.SSS".*/
const SelectEventDate = ({handleChange, classes}) =>
    <div className={classes.dateContainer}>
        <MuiPickersUtilsProvider utils={MomentUtils}>   
            <form noValidate>
                <TextField
                    className={classes.textField}
                    id="datetime-local"
                    label="Date and Time"
                    type="datetime-local"
                    onChange={handleChange}
                    defaultValue={moment().format("YYYY-MM-DDTHH:mm")}
                    className={classes.textField}
                    InputLabelProps={{
                    shrink: true,
                    }}/>
            </form>
        </MuiPickersUtilsProvider>
    </div>

export default SelectEventDate;