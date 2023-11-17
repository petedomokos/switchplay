import React, { useState, useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3';
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'
import { Checkbox } from '@material-ui/core';
import { FormControlLabel } from '@material-ui/core';
import { FormGroup } from '@material-ui/core';
import { Input } from '@material-ui/core';
import Icon from '@material-ui/core/Icon'
import { makeStyles } from '@material-ui/core/styles'
//import { grey10, COLOURS } from '../constants';

const useStyles = makeStyles(theme => ({
    tableHeaderRoot: {
        position:"absolute",
        left:0,
        top:0,
        width:"100%",
        height:props => `${props.height}px`,
        pointerEvents:"all",
        border:"solid",
        borderWidth:"thin",
        background:"yellow"
    },
    form:{
    },

}))

export default function TableHeader({ dimns }) {
  //const [value, setValue] = useState(null)
  console.log("dimns", dimns)
  const styleProps = {
    ...dimns,
  }
  const classes = useStyles(styleProps);

  return (
    <div className={classes.tableHeaderRoot}>
        HEADER HERE
      <form className={classes.form}>
      </form>
    </div>
  )
}

TableHeader.defaultProps = {
  dimns:{}
}