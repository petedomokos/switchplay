import React, { useState, useRef, useEffect } from 'react';
import ScrollSpyMenu from '../../../common/components/ScrollSpyMenu';
import { NormalItem } from '../../../common/components/ScrollSpyMenu';
import Scrollspy from 'react-scrollspy';
import AnchorLink from 'react-anchor-link-smooth-scroll';
import { Icon } from 'react-icons-kit';
import { androidMenu } from 'react-icons-kit/ionicons/androidMenu';
import { androidClose } from 'react-icons-kit/ionicons/androidClose';
import Logo from '../../../common/components/UIElements/Logo';
import Button from '../../../common/components/Button';
import Container from '../../../common/components/UI/ContainerTwo';
import NavbarWrapper, { MenuArea, MobileMenu } from './navbar.style';
import LogoImage from '../../../common/assets/image/agencyModern/logo.png';
import { SwitchplayLogo } from '../../../common/components/ScrollSpyMenu';
//import data from '../../../common/data/AgencyModern';
import { styles } from "../../../../core/websiteHelpers";

const { smDown } = styles;

//import { Fade } from 'react-awesome-reveal';
//<Fade triggerOnce></Fade>


const Navbar = ({ data, history, user, screen }) => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const scrollItems = [];

  data.leftMenuItems.forEach((item) => {
    scrollItems.push(item.path.slice(1));
  });

  const handleMobileMenu = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleHandleMenuClose = () => {
    setMobileMenu(false);
  };

  //if user logs out, must close mobile menu
  useEffect(() => {
    setMobileMenu(false);
  }, [user])

  //<div style={{ background:"red", width:"100%", height:"50px"}}>test</div>
  return (
    <NavbarWrapper className={`agencyModern-navbar navbar ${user ? "for-signed-in-user" : ""}`} id="navbar" >
      <Container className={`${user ? "for-signed-in-user" : ""}`}>
        <SwitchplayLogo className="sm-down" style={smDown(screen)} /> 
        <MenuArea className={`${user ? "for-signed-in-user" : ""}`}>
          <div className={`main-menu-area ${user ? "for-signed-in-user" : ""}`}>
            <ScrollSpyMenu
              className="menu-items menu-left"
              menuItems={data.leftMenuItems}
              offset={-84}
              history={history}
            />
            <ScrollSpyMenu
              className="menu-items menu-right"
              menuItems={data.rightMenuItems}
              offset={-84}
              history={history}
            />
          </div>
          {/* end of main menu */}

          <Button
            className={`menubar ${user ? "for-signed-in-user" : ""}`}
            icon={
              mobileMenu ? (
                <Icon
                  style={{ color: '#02073E' }}
                  className="bar"
                  size={32}
                  icon={androidClose}
                />
              ) : (
                  <Icon
                    style={{ color: '#02073E' }}
                    className="close"
                    icon={androidMenu}
                    size={32}
                  />
              )
            }
            color="#0F2137"
            variant="textButton"
            onClick={handleMobileMenu}
          />
        </MenuArea>
      </Container>

      {/* start mobile menu */}
      {/*note - mobile-menu classname does nothing*/}
      <MobileMenu className={`mobile-menu ${mobileMenu ? 'active' : ''} ${user ? "for-signed-in-user" : ""}`}>
        <Container>
          <Scrollspy
            className="menu"
            items={scrollItems}
            offset={-84}
            currentClassName="active"
            history={history}
          >

            {data.mobileMenuItems.map((item, index) => (
              <li key={`menu_key${index}`}>
                {item.itemType === "click-button" || item.itemType === "page-link" ?
                  <NormalItem item={item} history={history} />
                  :
                  <AnchorLink
                    href={item.path}
                    offset={item.offset}
                    onClick={handleHandleMenuClose}
                  >
                    {item.id !== "home" ? 
                      item.label 
                      :
                      <SwitchplayLogo /> 
                    }
                  </AnchorLink>
                }
              </li>
            ))}
          </Scrollspy>
        </Container>
      </MobileMenu>
      {/* end of mobile menu */}
    </NavbarWrapper>
  );
};

export default Navbar;
