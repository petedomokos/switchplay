import React, {useState} from 'react'
import * as d3 from 'd3';
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
import Options from "./Options"
import { compareAlpha } from "./ArrayHelpers"


const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
      width:props => props.shouldShowMoreSettings ? "200px" : "100px",
      height:props => props.shouldShowMoreSettings ? "430px" : (props.moreSettings ? "160px" : "120px"),
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
  more:{
      fontSize:"10px",
      marginTop:"10px",
  }
}))

const createOptions = setting => {
  const { valueType, max=100, key } = setting;
  if(valueType === "naturalNumber"){
    return d3.range(1, max).map(nr => ({
      key,
      value:nr,
      label:`${nr}`
    }))
  }

  return [];
}

export default function Settings({ title, emptyMesg, options, moreSettings, shouldShowMoreSettings, selectedValue, onClickOption, onClickMoreSettings, primaryText, secondaryText, styles}) {
  const stylesProps = {...styles, moreSettings, shouldShowMoreSettings }
  const classes = useStyles(stylesProps);

  const btnWidth = shouldShowMoreSettings ? "130px" : "90px";

  return (
    <Card className={classes.root} elevation={4}>
        <CardContent className={classes.content}>
          {title && <Typography variant="h6" className={classes.title}>{title} </Typography>}
          <Options 
              title={shouldShowMoreSettings ? "Value to show" : ""}
              options={options} selectedValue={selectedValue}
              onClickOption={onClickOption}
              primaryText={primaryText} 
              styles={{ ...styles, btnWidth }}
          />
          <Typography 
            className={classes.more} component="p" color="error"
            onClick={onClickMoreSettings}>
              More settings
          </Typography>
          {shouldShowMoreSettings && moreSettings.map((setting,i) => 
              <Options 
                title={setting.label}
                key={`setting-${i}`}
                displayFormat={setting.displayFormat}
                options={setting.options || createOptions(setting)} 
                selectedValue={setting.value}
                onClickOption={onClickOption} 
                primaryText={primaryText}
                styles={{ ...styles, btnWidth }}
            />
          )}
        </CardContent>
    </Card>
  )
}

Settings.defaultProps = {
    title:'',
    selectedValue:"",
    emptyMesg:'None',
    options:[],
    primaryText:() =>'',
    secondaryText:() =>'',
    styles:{}
}
