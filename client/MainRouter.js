import React, { useEffect, useState } from 'react'
import {Route, Switch} from 'react-router-dom'
import NonUserHome from './core/NonUserHome'
import UserHomeContainer from './core/containers/UserHomeContainer'
//import UsersContainer from './user/containers/UsersContainer'
import SigninContainer from './auth/containers/SigninContainer'
import EditUserProfileContainer from './user/containers/EditUserProfileContainer'
import EditDatasetProfileContainer from './dataset/containers/EditDatasetProfileContainer'
import UserContainer from './user/containers/UserContainer'
import GroupContainer from './group/containers/GroupContainer'
import DatasetContainer from './dataset/containers/DatasetContainer'
import CreateUserContainer from './user/containers/CreateUserContainer'
import CreateGroupContainer from './group/containers/CreateGroupContainer'
import CreateDatasetContainer from './dataset/containers/CreateDatasetContainer'
import CreateDatapointContainer from './dataset/datapoints/containers/CreateDatapointContainer'
import PrivateRoute from './auth/PrivateRoute'
import MenuContainer from './core/containers/MenuContainer'
import Profile from './core/profile/Profile'
import auth from './auth/auth-helper'
import ImportDataContainer from './data/ImportDataContainer'
import VisualsContainer from './visuals/VisualsContainer'
import './assets/styles/main.css'

const MainRouter = ({ userId, loadUser, loadingUser, updateScreen }) => {
  //console.log("MainRouter", userId)
  //load user if page is refreshed. MainRouter is under the store so can 
  //trigger re-render once loade
  const jwt = auth.isAuthenticated();

  //480 - portrait phone, 768 - tablets,992 - laptop, 1200 - desktop or large laptop
  const phoneMaxWidth = 480;
  const tabletMaxWidth = 1024; //ipad air
  const calcScreenSize = width => width <= 480 ? "s" : width <= 1024 ? "m" : "l";

  const getScreenInfo = () => {
    const size = calcScreenSize(window.innerWidth);
    const orientation = window.innerWidth < window.innerHeight ? "portrait" : "landscape";
    const screen =  { 
      width: window.innerWidth, 
      height: window.innerHeight, 
      
      orientation,
      size,
      isLarge:["l", "xl"].includes(size),
      isSmall:["s", "xs"].includes(size),
    }
    //console.log("window.innerWidth", window.innerWidth)
    //console.log("window.screen", window.screen)
    //console.log("isLarge?", screen.isLarge)
    window._screen = screen;
    //note - we still save in store, as ReactNative wont hve window
    return screen;
  }

  //SCREEN
  //first time must load screen before rendering children
  if(!window._screen || window.screen.width === 0){
    updateScreen(getScreenInfo())
  }

  useEffect(() => {
      const handleResize = () => {
        updateScreen(getScreenInfo())
      };
      window.addEventListener("resize", handleResize);
      //init
      updateScreen(getScreenInfo())
      return () => {
          window.removeEventListener("resize", handleResize);
      };
  }, []);

  useEffect(() => {
    if(jwt && !userId && !loadingUser){
      loadUser(jwt.user._id)
    }
  });
  
 //took exact away from UserHome path
  return (
    <div>
      <MenuContainer />
      <Route path="/signup" component={CreateUserContainer}/>
      <Route path="/signin" component={SigninContainer}/>
      <Switch>
          <Route path="/profile" component={Profile}/>
          <Route path="/visuals" component={VisualsContainer} />
          <PrivateRoute path="/import" component={ImportDataContainer} />
          <PrivateRoute path="/datasets/new" component={CreateDatasetContainer}/>
          {jwt ?
            <Route path="/" component={UserHomeContainer} />
            :
            <>
              {/**<div>
                <JourneyContainer />
              </div>*/}
              <Route exact path="/" component={NonUserHome}/>
            </>
          }
          {/**
            <PrivateRoute path="/user/edit/:userId" component={EditUserProfileContainer}/>
            <PrivateRoute path="/dataset/edit/:datasetId" component={EditDatasetProfileContainer}/>
            <PrivateRoute path="/users/new" component={CreateUserContainer}/>
            <PrivateRoute path="/groups/new" component={CreateGroupContainer}/>
            <PrivateRoute path="/datasets/new" component={CreateDatasetContainer}/>
            <PrivateRoute path="/datapoints/new" component={CreateDatapointContainer}/>
          */}
          {/**userId && <Route path="/user/:userId" component={UserContainer}/>*/}
          {/**userId && <Route path="/group/:groupId" component={GroupContainer}/>*/}
          {/**userId && <Route path="/dataset/:datasetId" component={DatasetContainer}/>*/}
      </Switch>
    </div>
    )
}

export default MainRouter