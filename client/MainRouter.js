import React, { Fragment, useEffect, useState } from 'react'
import {Route, Switch, withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import NonUserHomeContainer from './core/containers/NonUserHomeContainer'
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

import Sticky from 'react-stickynode';
import { ThemeProvider } from 'styled-components';
import { theme } from './templates/common/theme/agencyModern';
import { DrawerProvider } from './templates/common/contexts/DrawerContext';
import Navbar from './templates/containers/AgencyModern/Navbar';
import data from './templates/common/data/AgencyModern';
import ResetCSS from './templates/common/assets/css/style';
import {
  GlobalStyle,
  ContentWrapper,
} from './templates/containers/AgencyModern/agencyModern.style';

//@todo - trigger an auto scroll to the right id, after page has loaded. 
//It can be a prop for HomePage, and done in a useEffect with an empty deparray so it only does it on first render
const navBarDataForOtherPages = {
  ...data,
  leftMenuItems:data.leftMenuItems.map(it => ({ ...it, isPage:true, path:"/" }))
  /*
  //if we just want home link
  leftMenuItems:[{
    ...data.leftMenuItems.find(it => it.path === "#home"),
    isPage:true, 
    path:"/" 
  }]
  */
}

const useStyles = makeStyles(theme => ({
  app:{
    width:"100%",
    background:"#FF825C"
  }
}))

const MainRouter = ({ userId, loadUser, loadingUser, updateScreen, history }) => {
  //load user if page is refreshed. MainRouter is under the store so can 
  //trigger re-render once loaded
  const classes = useStyles() 
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
  
  return (
    <div className={classes.app}>
      <ThemeProvider theme={theme}>
        <Fragment>
          <ResetCSS />
          <GlobalStyle />
          <ContentWrapper>
            <Sticky top={0} innerZ={9999} activeClass="sticky-nav-active">
              <DrawerProvider>
                <Route path="/:any"><Navbar data={navBarDataForOtherPages} history={history} /></Route>
                <Route exact path="/"><Navbar data={data} history={history} /></Route>
              </DrawerProvider>
            </Sticky>
            <Switch>
              <Route path="/signup" component={CreateUserContainer}/>
              <Route path="/signin" component={SigninContainer}/>
              <Route path="/profile" component={Profile}/>
              <Route path="/visuals" component={VisualsContainer} />
              <PrivateRoute path="/import" component={ImportDataContainer} />
              <PrivateRoute path="/datasets/new" component={CreateDatasetContainer}/>
              {jwt ?
                <Route path="/" component={UserHomeContainer} />
                :
                <Route exact path="/" component={NonUserHomeContainer}/>
              }
            </Switch>
          </ContentWrapper>
        </Fragment>
      </ThemeProvider>
    </div>
  )
}

export default withRouter(MainRouter)