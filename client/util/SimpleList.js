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
import { compareAlpha } from "./ArrayHelpers"


const useStyles = makeStyles(theme => ({
  root: theme.mixins.gutters({
    //padding: theme.spacing(1),
    margin: `${theme.spacing(1)}px`,
    paddingTop: theme.spacing(2),
    height:'calc(100% - '+theme.spacing(4) +'px)'
  }),
  content:{
    height:'calc(100% - 60px - '+theme.spacing(6) +'px)',
    overflowY:'auto'
  },
  actions:{
    height:'50px',
    display:'flex',
    justifyContent:'flex-end'
  },
  title: {
    margin: `0 ${theme.spacing(2)}px ${theme.spacing(2)}px ${theme.spacing(2)}px`,
    color: theme.palette.openTitle,
    [theme.breakpoints.down('md')]: {
    }
  },
  listItemWrapper:{
    display:'flex',
    justifyContent:'space-between'
  },
  itemMainPart:{
    flex:'80% 1 1'
  },
  extraItemButtons:{
    width:props => props.extraItemButtonsWidth,
    display:'flex',
    alignItems:'center',
  },
  listItemTextPrimary:{
    [theme.breakpoints.down('md')]: {
     // fontSize:"24px"
    }
  },
  listItemTextSecondary:{
    [theme.breakpoints.down('md')]: {
     // fontSize:"18px"
    }
  }
}))
/*
 linkPath - an accessor function to get the 'to' property for each (item,index) pair
*/
export default function SimpleList({ title, emptyMesg, items, itemActions, actionButtons, primaryText, secondaryText, styles}) {
  
  const nrOfExtraItemActions = itemActions.other ? itemActions.other.length : 0;
  const stylesProps = {...styles, extraItemButtonsWidth:nrOfExtraItemActions * 40}
  const classes = useStyles(stylesProps);
  //sort
  items.sort(compareAlpha)

  const { ItemIcon, onItemClick, itemLinkPath } = itemActions.main;

  const listItem = (item, i) => 
      <ListItem button >
        <ListItemAvatar>
          <Avatar>
            <Person/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText 
            classes={{primary:classes.listItemTextPrimary, secondary:classes.listItemTextSecondary}}
            primary={primaryText(item,i)} 
            secondary={secondaryText(item,i)} />
        <ListItemSecondaryAction >
        <IconButton>
             <ItemIcon/>
        </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
  
  const extraItemButton = (action, i) =>
      <IconButton>
        <action.ItemIcon/>
      </IconButton> 

    return (
      <Card className={classes.root} elevation={4}>
         <CardContent className={classes.content}>
          {title && <Typography variant="h6" className={classes.title}>
            {title}
          </Typography>}
          {items.length >= 1 ? 
            <List dense>
              {items.map((item, i) =>
                <div key={i} className={classes.listItemWrapper}>
                  {itemLinkPath ? 
                    <Link to={itemLinkPath(item, i)} className={classes.itemMainPart}>
                        {listItem(item, i)}
                    </Link>
                    :
                    <div onClick={() => onItemClick(item,i)} className={classes.itemMainPart} >
                        {listItem(item, i)}
                    </div>
                  }
                  <div className={classes.extraItemButtons}>
                    {itemActions.other && itemActions.other.map((action,i) =>
                      <div key={i}>
                        {action.linkPath ? 
                          <Link to={action.linkPath(item, i)} >
                              {extraItemButton(action,i)}
                          </Link>
                          :
                          <div onClick={() => action.onItemClick(item,i)} >
                              {extraItemButton(action,i)}
                          </div>
                        }
                      </div>
                    )}
                  </div>
                </div>
              )}
            </List>
            :
            <div  className={classes.title}>{emptyMesg}</div>
          }
         </CardContent>
         <CardActions className={classes.actions}>
          {actionButtons.map((btn,i) => btn(title+i))}
        </CardActions>
      </Card>
    )
}

SimpleList.defaultProps = {
    title:'',
    emptyMesg:'None',
    items:[],
    itemActions:{
      main:{
        itemLinkPath:() =>'/', 
        ItemIcon:ArrowForward
      },
      other:[]
    },
    actionButtons:[],
    primaryText:() =>'',
    secondaryText:() =>'',
    linkPath:item => '/',
    styles:{}
}
