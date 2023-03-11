import React, {useState} from 'react'
import {Link} from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import ArrowForward from '@material-ui/icons/ArrowForward'
import Person from '@material-ui/icons/Person'
import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import Button from '@material-ui/core/Button'
import { compareAlpha } from "./ArrayHelpers"
import { DropdownSelector } from './Selector'

const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    width:"90%",
    height:"90%",
    padding:"0px",
    margin:"0px",
    paddingTop:"3px",
    paddingBottom:"3px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center",
  }),
  actions:{
  },
  title: {
    width:"100%",
    height:"10%",
    fontSize:"9px",
    alignSelf:"flex-start",
    margin:"3px"
  },
  optionsWrapper:{
    width:'100%',
    height:"90%"
  },
  optionWrapper:{
    width:"100%",
    padding:"0px",
    margin:"0px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center",
  },
  optionBtn: {
      width:props => props.btnWidth || "90%",
      marginTop:"3px",
      marginBottom:"3px",
      fontSize:"10px"
  },
  dropdownCont:{
      display:"flex",
      justifyContent:"center"
  }
}))

export default function Options({ title, displayFormat, emptyMesg, options, selectedValue, onClickOption, primaryText, styles}) {
  const stylesProps = { ...styles }
  const classes = useStyles(stylesProps);
  const key = options[0]?.key;

  return (
    <div className={classes.root} elevation={4}>
          {title && <Typography variant="h6" className={classes.title}>{title} </Typography>}
          <div className={classes.optionsWrapper}>
            {displayFormat === "buttons" && options.map((option, i) =>
                <div key={i} className={classes.optionWrapper} style={{opacity:selectedValue === option.value ? 1 : 0.6}}>
                    <Button color="primary" variant="contained" 
                        onClick={() => onClickOption(option.key, option.value)} className={classes.optionBtn} >
                        {primaryText(option,i)}
                    </Button>
                </div>
            )}
            {displayFormat === "dropdown" && 
              <div className={classes.dropdownCont}>
                <DropdownSelector
                    options={options}
                    selected={selectedValue}
                    valueAccessor={option => option.value}
                    labelAccessor={option => option.label}
                    handleChange={e => onClickOption(key, e.target.value)}
                    style={{margin:0, width:"80px", height:"20px", fontSize:"7px"}}
                />
              </div>}
          </div>
    </div>
  )
}

Options.defaultProps = {
    title:'',
    displayFormat:"buttons",
    selectedValue:"",
    emptyMesg:'None',
    options:[],
    primaryText:() =>'',
    secondaryText:() =>'',
    styles:{}
}
