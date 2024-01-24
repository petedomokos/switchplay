import React, { useState, useEffect } from 'react'
import * as d3 from 'd3';
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
import { show, hide } from './journey/domHelpers';

const MENU_HEIGHT = 70;

const activeStyles = { color: "#ff4081" }
const inactiveStyles = { color: "#ffffff" };
const getDynamicStyles = (history, path) => {
  if (history.location.pathname == path){
    return activeStyles;
  }else{
    return inactiveStyles;
  }
}


const useStyles = makeStyles(theme => ({
  menuRoot: {
    background:"black",
    width:"95%",
    height:MENU_HEIGHT,
    padding:"5px 2.5%"
  },
  menuItems:{
    width:"100%",
    height:"100%",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },
  startItems:{
    display:"flex",
    //flexDirection:props => props.flexDirection,
  },
  endItems:{
    display:"flex",
    //flexDirection:props => props.flexDirection,
  },
  menuItem:{
    width:"150px",
    height:"20px",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    fontSize:"14px",
    //border:"solid",
    //borderColor:"red",
    color:"white",
    fontFamily:"helvetica",
  },
  logoWrapper:{
    width:"150px",
    height:"50px",
    display:"flex",
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    //border:"solid",
    //borderColor:"red",
  },
  logo:{
    width:"150px",
    //height:"20px",
    fontSize:"18px",
    //border:"solid",
    //borderColor:"yellow",
    color:"white",
    fontFamily:"helvetica",
    //marginTop:props => props.isBurger ? "10px" : "0px",
    //marginLeft:props => props.isBurger ? "0px" : "175px",
    /*[theme.breakpoints.down('sm')]: {
      fontSize:"12px",
    },
    [theme.breakpoints.up('lg')]: {
      fontSize:"10px",
    },*/
    //background:"yellow"
  },
  strapline:{
    width:"150px",
    //height:"20px",
    fontSize:"10px",
    //border:"solid",
    //borderColor:"blue",
    color:"white",
    fontFamily:"helvetica",
  },
  homeIcon:{
    [theme.breakpoints.down('sm')]: {
      height:"20px",
      //width:"50px",
    },
    [theme.breakpoints.up('lg')]: {
    },

  },
  otherStartItems:{
    display:"flex",
    flexDirection:props => props.flexDirection,
    //border:"solid"
  },
  menuBtn: {
    margin:props => props.menuBtnMargin,
    //background:"red",
    [theme.breakpoints.down('md')]: {
      fontSize:"10px",
    },
    [theme.breakpoints.up('lg')]: {
      fontSize:"10px",
    },
  },
  standaloneLogo:{
    //position:"absolute",
    //paddingLeft:"15px",
    height:"55px",
    //margin:"20px",
    fontSize:"14px",
    background:"black",
    color:"white",
    display:"flex",
    alignItems:"center",
    padding:0,
    margin:0
  }
}))

const Menu = withRouter(({ history, isHidden, signingOut, screen, onSignout }) => {
  const isBurger = false;// ["s", "m"].includes(screen.size);
  const styleProps = { };
  const classes = useStyles(styleProps) 
  const user = auth.isAuthenticated() ? auth.isAuthenticated().user : null;
  const [isOpen, setIsOpen] = useState(false)

  const handleStateChange = state => {
    setIsOpen(state.isOpen);
  }

  return (
    <>
      {isBurger  ?
        <>
        </>
        :
        <MenuItemsWrapper classes={classes}>
          <MenuItems user={user} history={history} signingOut={signingOut} 
            onSignout={onSignout} classes={classes} />
        </MenuItemsWrapper>
      }
    </>
  )
})

const MenuItemsWrapper = ({ children, classes }) =>
  <div className={classes.menuRoot}>
      <div className={classes.menuItems}>
          {children}
      </div>
  </div>

{/**const MenuItemsWrapper = ({ children, classes }) =>
  <AppBar position="static" className={classes.menuRoot}>
      <Toolbar className={classes.menuItems}>
          {children}
      </Toolbar>
</AppBar>*/}

const MenuItems = ({ classes }) => {
  return (
    <>
      <div className={classes.startItems}>
        <Logo classes={classes} withStrapline={true} />
      </div>
      <div className={classes.endItems}>
        <div className={classes.menuItem}>About us</div>
        <div className={classes.menuItem}>Contact us</div>
        <div className={classes.menuItem}>Sign in</div>
      </div>
    </>
  )
}

const Logo = ({ withStrapline, classes }) => {
  return (
    <div className={classes.logoWrapper}>
      <div className={classes.logo}>
        SWITCHPLAY
      </div>
      <div style={{ height:"3px" }}></div>
      {withStrapline && 
        <div className={classes.strapline}>
          The Player Development App
        </div>
      }
    </div>
  )
}

const MenuItemsOld = ({ user, history, signingOut, isBurger, onSignout, classes }) =>
    <div className={classes.menuItems}>
      <div className={classes.startItems}>
        {!isBurger && <Typography variant="h6" color="inherit" className={classes.logo}>
          SWITCHPLAY
        </Typography>}
        {!isBurger && <div style={{ width:isBurger ? "100%" : "10px", height:"20px" }}></div>}
        <div className={classes.otherStartItems}>
          {/**isBurger && 
            <Link to="/">
              <IconButton 
                  aria-label="Home" 
                  style={getDynamicStyles(history, "/")}>
                  <HomeIcon
                      className={classes.homeIcon}/>
              </IconButton>
            </Link>
          */}
        </div>
      </div>
      <div className={classes.endItems}>
        <Link to="/about">
                <Button 
                  className={classes.menuBtn}
                  style={getDynamicStyles(history, "/about")}>ABOUT US
                </Button>
        </Link>
        <Link to="/contact">
                <Button 
                  className={classes.menuBtn}
                  style={getDynamicStyles(history, "/contact")}>CONTACT
                </Button>
        </Link>
        {user && <Link to="/datasets/new">
            <Button 
              className={classes.menuBtn}
              style={getDynamicStyles(history, "/datasets/new")}>Dataset+
            </Button>
        </Link>}
        {/**<Link to="/visuals">
            <Button 
              className={classes.menuBtn}
              style={getDynamicStyles(history, "/visuals")}>Visuals
            </Button>
        </Link>*/}
        {user && <Link to="/import">
            <Button 
              className={classes.menuBtn}
              style={getDynamicStyles(history, "/import")}>Import
            </Button>
        </Link>}
        {
          !user && (<>
            <Link to="/signup">
              <Button
                className={classes.menuBtn}
                style={getDynamicStyles(history, "/signup")}>Sign up
              </Button>
          </Link>
          <Link to="/signin">
            <Button 
              className={classes.menuBtn}
              style={getDynamicStyles(history, "/signin")}>Sign In
            </Button>
          </Link>
          </>)
        }
        {
          user && (<span>
            <Button
              className={classes.menuBtn}
              style={inactiveStyles}
              onClick={() => onSignout(history)}>Sign out
            </Button>
          </span>)
        }
      </div>
    </div>

export default Menu
