import React, { useState, useEffect } from 'react'
import {Switch, Link, Route } from 'react-router-dom'
//import PrivateRoute from '../auth/PrivateRoute' - use this if i have a param /:journeyId
import { makeStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
//children
import UserProfile from '../user/UserProfile'
import UsersContainer from '../user/containers/UsersContainer'
import GroupsContainer from '../group/containers/GroupsContainer'
import DatasetsContainer from '../dataset/containers/DatasetsContainer'
import JourneyContainer from "./journey/JourneyContainer"

const useStyles = makeStyles((theme) => ({
  root: {
    //margin: theme.spacing(2),
    display:'flex',
    alignItems:'flex-start', //note - when removing this, it makes item stretch more
    flexDirection:'column'
  },
  mainVis:{
    height:props => props.availHeight,// - props.topBarHeight,
    width:props => props.availWidth
  },
  topRow: {
    //padding:`${theme.spacing(3)}px ${theme.spacing(2.5)}px ${theme.spacing(2)}px`,
    width:"100%",
    display:"flex",
    justifyContent:"space-between",
    flexWrap:"wrap"
  },
  lists:{
    height:'400px',
    marginTop:`${theme.spacing(4)}px`,
    alignSelf:'stretch',
    display:'flex',
    justifyContent:'space-around',
    flexWrap:'wrap'
  },
  list:{
    [theme.breakpoints.down('md')]: {
      width:"90vw"
    },
    [theme.breakpoints.up('lg')]: {
      width:"400px"
    },
    height:'100%',
  },
  quickLinks:{
    height:"50px"
  },
  quickLinkBtn:{

  }
}))

const UserHome = ({screen, user, loading, loadingError}) => {
  const topBarHeight = screen.isLarge ? 90 : 20; //still need a bit of height even if no top bar
  const styleProps = { 
    availWidth: screen?.width || 0,
    availHeight:screen.height || 0,
    topBarHeight
  };
  const classes = useStyles(styleProps)

  //for now, keep it simple for page refreshes - until user reloads, dont render the children.
  //note - cant use withRouter in MainRouter as we only want it to load user if signed in

  const quickLinks = [
    {label:"Add datapoint", to:"/datapoints/new"}
  ]

  return (
    <div className={classes.root}>
      {user._id && 
        <>
            <div className={classes.mainVis}>
              <Route path="/" component={JourneyContainer} />
            </div>
          
          {/**
          <div className={classes.topRow} >
              <UserProfile profile={user} />
              <QuickLinks links={quickLinks}/>
          </div>
          <div className={classes.lists}>
              <div className={classes.list}>
                <UsersContainer/>
              </div>
              <div className={classes.list}>
                <GroupsContainer/>
              </div>
              <div className={classes.list}>
                <DatasetsContainer/>
              </div>
          </div>
          **/}
          
      </>}
    </div>
  )
}

UserHome.defaultProps = {
  screen:{}
}

const QuickLinks = ({links}) =>{
  const classes = useStyles()
  return(
    <div className={classes.quickLinks}>
        {links.map(link =>
          <Link to={link.to} key={"quicklink-"+link.to}>
              <Button color="primary" variant="contained" className={classes.quickLinkBtn}>{link.label}</Button>
          </Link>
        )}
    </div>
  )
}
export default UserHome 
