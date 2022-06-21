import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import HomeIcon from '@material-ui/icons/Home'
import Button from '@material-ui/core/Button'
import auth from '../auth/auth-helper'
import {Link, withRouter} from 'react-router-dom'
import { slide as ElasticMenu } from 'react-burger-menu'
import MenuIcon from '@material-ui/icons/Menu'

const isActive = (history, path) => {
  if (history.location.pathname == path)
    return {color: '#ff4081'}
  else
    return {color: '#ffffff'}
}


const useStyles = makeStyles(theme => ({
  root: {
  },
  items:{
    //flexDirection:props => ["s", "m"].includes(props.screenSize) ? "column" : "column"
  },
  logo:{
    [theme.breakpoints.down('sm')]: {
      fontSize:"12px",
    },
    [theme.breakpoints.up('lg')]: {
      //fontSize:"16px",
    },

  },
  homeIcon:{
    [theme.breakpoints.down('sm')]: {
      height:"20px",
      //width:"50px",
    },
    [theme.breakpoints.up('lg')]: {
    },

  },
  menuBtn: {
    [theme.breakpoints.down('md')]: {
      fontSize:"12px",
    },
    [theme.breakpoints.up('lg')]: {
      //fontSize:"16px",
    },
    
  }
}))

const Menu = withRouter(({ history, signingOut, screenSize, onSignout }) => {
  //const styleProps = { screenSize };
  const classes = useStyles(/*styleProps*/) 
  const user = auth.isAuthenticated() ? auth.isAuthenticated().user : null;
  const [isOpen, setIsOpen] = useState(false)
   //@todo - remove burger bars, replace with my own so i can take control and make it close 
  //when  menu item is clicked. 
  return (
    <>
      {["s", "m"].includes(screenSize)  ?
        <>
          {/**<MenuIcon onClick = {() => setIsOpen(true)}
            style={{ position:"absolute", left:200, top:100, zIndex:1000}}/>*/}
          <ElasticMenu width={150} isOpen={isOpen}>
            <div style={{display:"flex", flexDirection:"column"}}  
                onClick={() => { setIsOpen(false)} }>
              <MenuItems user={user} history={history} signingOut={signingOut} 
                                  screenSize={screenSize} onSignout={onSignout} classes={classes}/>
            </div>
          </ElasticMenu>
        </>
        :
        <MenuItemsWrapper classes={classes}>
          <MenuItems user={user} history={history} signingOut={signingOut} 
                      screenSize={screenSize} onSignout={onSignout} classes={classes} />
        </MenuItemsWrapper>
      }
    </>
  )
})

const MenuItemsWrapper = ({ children, classes }) =>
  <AppBar position="static" className={classes.root}>
      <Toolbar className={classes.items}>
          {children}
      </Toolbar>
  </AppBar>

const MenuItems = ({ user, history, signingOut, screenSize, onSignout, classes }) =>
    <>
       <Typography variant="h6" color="inherit" className={classes.logo}>
          Switchplay
        </Typography>
        <Link to="/">
          <IconButton 
              aria-label="Home" 
              style={isActive(history, "/")}>
              <HomeIcon
                  className={classes.homeIcon}/>
          </IconButton>
        </Link>
        {
          !user && (<span>
            <Link to="/signup">
              <Button
                className={classes.menuBtn}
                style={isActive(history, "/signup")}>Sign up
              </Button>
          </Link>
            <Link to="/signin">
              <Button 
                className={classes.menuBtn}
                style={isActive(history, "/signin")}>Sign In
              </Button>
            </Link>
          </span>)
        }
        {
          user && (<span>
            <Link to={"/user/" + auth.isAuthenticated().user._id}>
              <Button
                className={classes.menuBtn}
                style={isActive(history, "/user/" + auth.isAuthenticated().user._id)}>My Profile
              </Button>
            </Link>
          </span>)
        }
        {
          user && user.isPlayer && (<span>
            <Link to={"/user/" + auth.isAuthenticated().user._id+"/dashboard"}>
              <Button
                className={classes.menuBtn}
                style={isActive(history, "/user/" + auth.isAuthenticated().user._id+"/dashboard")}>My Dashboard
              </Button>
            </Link>
          </span>)
        }
         <Link to={"/games"}>
          <Button
            className={classes.menuBtn}
            style={isActive(history, "/games")}>games
          </Button>
        </Link>
        {
          user && (<span>
            <Button
              className={classes.menuBtn}
              color="inherit" 
              onClick={() => onSignout(history)}>Sign out
            </Button>
          </span>)
        }
    </>

export default Menu
