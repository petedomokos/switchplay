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
import auth from './auth/auth-helper'
import Expression from "./expression/Expression"
import Games from "./games/Games"
//styles
import './assets/styles/main.css'
import JourneyContainer from './core/journey/JourneyContainer'

const MainRouter = ({ userId, loadUser, loadingUser, updateScreen }) => {
  //console.log("MainRouter", userId)
  //load user if page is refreshed. MainRouter is under the store so can 
  //trigger re-render once loaded
  const jwt = auth.isAuthenticated();

  //480 - portrait phone, 768 - tablets,992 - laptop, 1200 - desktop or large laptop
  const calcScreenSize = width => width <= 480 ? "s" : width <= 768 ? "m" : "l";

  const getScreenInfo = () => {
    const size = calcScreenSize(window.innerWidth);
    return { 
      width: window.innerWidth, 
      height: window.innerHeight, 
      size,
      isLarge:["l", "xl"].includes(size)
    }
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
  
 //we dont use?: because we if there is a loading delay for User, we dont want display to revert to NonUserHome 
 //todo - find a graceful way of handling this potential issue
 // <Route exact path="/" render={() => <UserHomeContainer screen={screen} />} />
  return (
    <div>
      <div style={{height:0.05}}></div>
      <MenuContainer />
      <Route path="/signup" component={CreateUserContainer}/>
      <Route path="/signin" component={SigninContainer}/>
      {(!jwt || userId) && <Switch>
          {jwt ?
            <Route exact path="/" component={UserHomeContainer} />
            :
            <>
              <div>
                <JourneyContainer />
              </div>
              <Route exact path="/" component={NonUserHome}/>
            </>
          }
          <Route path="/expression" component={Expression}/>
          <Route path="/games" component={Games}/>
          <PrivateRoute path="/user/edit/:userId" component={EditUserProfileContainer}/>
          <PrivateRoute path="/dataset/edit/:datasetId" component={EditDatasetProfileContainer}/>
          <PrivateRoute path="/users/new" component={CreateUserContainer}/>
          <PrivateRoute path="/groups/new" component={CreateGroupContainer}/>
          <PrivateRoute path="/datasets/new" component={CreateDatasetContainer}/>
          <PrivateRoute path="/datapoints/new" component={CreateDatapointContainer}/>
          {userId && <Route path="/user/:userId" component={UserContainer}/>}
          {userId && <Route path="/group/:groupId" component={GroupContainer}/>}
          {userId && <Route path="/dataset/:datasetId" component={DatasetContainer}/>}
      </Switch>}
    </div>
    )
}

export default MainRouter
