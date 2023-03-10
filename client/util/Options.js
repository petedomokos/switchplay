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


const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
      width:"100px",
      height:props => props.moreOptions ? "150px" : "120px",
      padding:"0px",
      margin:"0px",
      paddingTop:"3px",
      paddingBottom:"3px"
  }),
  content:{
    padding:"0px",
    paddingTop:"5px",
    margin:"0px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"space-between",
    alignItems:"center"
  },
  actions:{
  },
  title: {
      
  },
  optionWrapper:{
    padding:"0px",
    margin:"0px",
  },
  optionBtn: {
      width:"110px",
      marginTop:"3px",
      marginBottom:"3px",
      fontSize:"10px"
  },
  more:{
      fontSize:"10px",
      marginTop:"10px",
  }
}))

export default function Options({ title, emptyMesg, options, moreOptions, selectedValue, onClickOption, primaryText, secondaryText, styles}) {
  const stylesProps = {...styles, moreOptions }
  const classes = useStyles(stylesProps);

    return (
      <Card className={classes.root} elevation={4}>
         <CardContent className={classes.content}>
            {title && <Typography variant="h6" className={classes.title}>{title} </Typography>}
            {options.map((option, i) =>
                <div key={i} className={classes.optionWrapper} style={{opacity:selectedValue === option.value ? 1 : 0.6}}>
                    <Button color="primary" variant="contained" 
                        onClick={() => onClickOption(option,i)} className={classes.optionBtn} >
                        {primaryText(option,i)}
                    </Button>
                </div>
            )}
            {moreOptions && <Typography className={classes.more} component="p" color="error">More Options</Typography>}
         </CardContent>
      </Card>
    )
}

Options.defaultProps = {
    title:'',
    selectedValue:"",
    emptyMesg:'None',
    options:[],
    primaryText:() =>'',
    secondaryText:() =>'',
    styles:{}
}
