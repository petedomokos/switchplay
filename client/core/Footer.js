import React, { Fragment } from 'react';
import { makeStyles } from '@material-ui/core/styles'

import { NAVBAR_HEIGHT, COLOURS, grey10 } from "./websiteConstants";
import homeBanner from '../../assets/website/banners/overhead-kick.png';
import aboutBanner from '../../assets/website/banners/header-goal.png';
import linkedIn from "../../assets/website/footer/linkedIn.png";


const getBanner = page => {
    if(page === "about"){ return aboutBanner; }
    return homeBanner
}

const useStyles = makeStyles(theme => ({
    overheadBanner:{
        backgroundImage:props => `url(${props.banner})`,
        backgroundColor:"#ffffff",
        backgroundSize: "cover",
    },
    contents:{
        marginTop:"-90px",
        width:"100%", 
        height:"190px", 
        padding:"30px 7.5vw",
        [theme.breakpoints.down('lg')]: {
            marginTop:"-70px"
        },
        [theme.breakpoints.down('md')]: {
            marginTop:"-40px"
        },
        [theme.breakpoints.down('sm')]: {
            marginTop:"-20px"
        },
        [theme.breakpoints.down('xs')]: {
            marginTop:"0px"
        },
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        flexWrap:"wrap",
        background:COLOURS.OFFBLACK,
        //border:"solid",
        //borderColor:grey10(7),
        color:grey10(2)
    },
    group:{
        display:"flex",
        justifyContent:"center",
        alignItems:"center",
        minWidth:"40vw",
        //border:"solid",
        borderColor:"white",
        borderWidth:"red"
    },
    item:{
        margin:"10px",
        fontSize:"14px",
        fontWeight: "300",
        whiteSpace: "nowrap",
        //border:"solid",
        borderColor:"white",
        borderWidth:"thin"
    },
    normalItem:{
        height:"15px"
    },
    linkedInItem:{
        width:"60px",
        height:"15px",
        paddingTop:"1.5px", //for the In which droops down
        
    },
    copyrightItem:{

    },
    link:{
        color:"white"
    }
}))

const Footer = ({ className, page }) =>{
  const classes = useStyles({ banner:getBanner(page) });
  const bannerImageRatio = 3/9;

  const onClick = key => {
    if(key === "linkedin"){
        const absLink = "www.linkedin.com/in/petedomokos/";
        window.open(`http://${absLink}`, "_blank");
    }
  }

  return (
    <Fragment>
        <div className={classes.overheadBanner} style={{ width:"100vw", height:`${100 * bannerImageRatio}vw`}}></div>
        <div className={classes.contents}>
            <div className={classes.group}>
                <div className={`${classes.normalItem} ${classes.item}`}>
                    <a href="contact" className={classes.link}>Contact us</a>
                </div>
                <div className={`${classes.normalItem} ${classes.item}`}>
                    <a href="about" className={classes.link}>About us</a>
                </div>
                {/**<h2 className={`${classes.normalItem} ${classes.item}`}>Linked in</h2>*/}
                <div className={`${classes.linkedInItem} ${classes.item}`} onClick={() => onClick("linkedin")}>
                    <img src={linkedIn} style={{ contentFit:"contain" }} />
                </div>
            </div>
            <div className={classes.group}>
                <h2 className={`${classes.copyrightItem} ${classes.item}`}>&copy; 2022 - 2024 Switchplay Technology Ltd</h2>
            </div>
        </div>
    </Fragment>
  )
}

Footer.defaultProps = {
  className:""
}
  
export default Footer
