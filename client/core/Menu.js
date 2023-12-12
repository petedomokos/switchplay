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
  root: {
    background:"black"
  },
  elasticMenuWrapper:{
  },
  menuItems:{
    width:props => props.menuWidth,
    height:props => props.menuHeight,
    display:"flex",
    flexDirection:props => props.flexDirection,
    justifyContent:"space-between",
  },
  startItems:{
    display:"flex",
    flexDirection:props => props.flexDirection,
    //border:"solid"

  },
  endItems:{
    //border:"solid",
    display:"flex",
    flexDirection:props => props.flexDirection,
  },
  logo:{
    fontSize:"14px",
    marginTop:props => props.isBurger ? "10px" : "0px",
    marginLeft:props => props.isBurger ? "0px" : "175px",
    alignSelf:"center",
    /*[theme.breakpoints.down('sm')]: {
      fontSize:"12px",
    },
    [theme.breakpoints.up('lg')]: {
      fontSize:"10px",
    },*/
    //background:"yellow"
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
    paddingLeft:"15px",
    height:"55px",
    margin:"20px",
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
  const isBurger = ["s", "m"].includes(screen.size);
  const menuWidth = isBurger ? 150 : screen.width;
  const menuHeight = isBurger ? screen.height * 0.85 : null;
  const flexDirection = isBurger ? "column" : "row";
  const justifyContent = isBurger ? "flex-start" : "space-between";
  const menuBtnMargin = isBurger ? "10px 0" : "0 10px";
  const styleProps = { flexDirection, justifyContent, menuWidth, menuHeight, menuBtnMargin, isBurger };
  const classes = useStyles(styleProps) 
  const user = auth.isAuthenticated() ? auth.isAuthenticated().user : null;
  const [isOpen, setIsOpen] = useState(false)

  const handleStateChange = state => {
    setIsOpen(state.isOpen);
  }

  //control the burger bar in a useEffect
  useEffect(() => { 
    d3.select(".bm-burger-button").call(isHidden ? hide : show)
  }, [isHidden])

  return (
    <>
      {isBurger  ?
        <>
          <Typography variant="h6" color="inherit" className={classes.standaloneLogo}>
            SWITCHPLAY
          </Typography>
          <ElasticMenu width={menuWidth} 
            isOpen={isOpen}
            onStateChange={(state) => handleStateChange(state)}
          >
            <div onClick={() => { setIsOpen(false)} } className={classes.elasticMenuWrapper} >
              <MenuItems 
                isBurger={isBurger}
                user={user} history={history} signingOut={signingOut} 
                onSignout={onSignout} classes={classes}/>
            </div>
          </ElasticMenu>
        </>
        :
        <MenuItemsWrapper classes={classes}>
          <MenuItems user={user} history={history} signingOut={signingOut} 
              isBurger={isBurger} onSignout={onSignout} classes={classes} />
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

const MenuItems = ({ user, history, signingOut, isBurger, onSignout, classes }) =>
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
