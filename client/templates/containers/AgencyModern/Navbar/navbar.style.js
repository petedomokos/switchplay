import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import navBg from '../../../common/assets/image/agencyModern/nav-bg.png';
import { COLOURS } from '../../../../core/websiteConstants';

const NavbarWrapper = styled.header`
  width: 100%;
  padding: 25px 20px 26px;
  background-color: transparent;
  position: fixed;
  z-index: 9999;
  transition: all 0.3s ease;
  @media only screen and (max-width: 1366px) {
    padding: 20px 20px 21px;
  }
  @media only screen and (max-width: 768px) {
    padding: 20px 0px 21px;
  }
  &.for-signed-in-user {
    padding: 5px 0 5px 0px;
  }
  > div.container {
    width: 100%;
    display: flex;
    align-items: center;
  }
  .main-logo {
    border-color:red;
    margin-right: 50px;
    max-width: 140px;
    img {
      max-width: 100%;
      height: auto;
    }
  }
`;

//menubar class needs to also set display to block (from none) if user is signed in
//simplest way is change the name of class, and put teh display:none into that clasname which only 
//applies to it when user is not signed in
//do teh oppoiste for theh non-burger menu too
export const MenuArea = styled.nav`
  display: flex;
  align-items: center;
  width: 100%;
  .menubar {
    display: none;
  }
  @media only screen and (max-width: 1024px) {
    justify-content: flex-end;
  }
  &.for-signed-in-user {
    justify-content: flex-end;
  }
  @media only screen and (max-width: 768px) {
    .menubar {
      display: block;
    }
  }
  .menubar.for-signed-in-user {
    display: block;
  }

  .main-menu-area {
    display: flex;
    &.for-signed-in-user{
      display:none;
    }
    align-items: center;
    width: 100%;
    .menu-right {
      margin-left: auto;
    }
    &.active {
      .menu-items {
        opacity: 0;
        visibility: hidden;
      }
    }
    margin-left:50px;
  }
  .menu-items {
    border-color: red;
    display: flex;
    align-items: center;
    margin-right: 11px;
    opacity: 1;
    visibility: visible;
    transition: all 0.3s ease;
    @media only screen and (max-width: 1366px) {
      margin-right: 13px;
    }
    @media only screen and (max-width: 768px) {
      display: none;
    }
    li {
      margin: 0 19px;
      a {
        color: ${themeGet('colors.menu', '#02073E')};
        font-family: DM Sans;
        font-size: 18px;
        font-weight: 400;
        @media only screen and (max-width: 990px) {
          font-size: 12px;
          font-weight: 400;
        }
        transition: all 0.3s ease;
        &:hover {
          color: ${themeGet('colors.menu', '#FF825C')};
        }
      }
      &.is-current {
        background: transparent url(${navBg?.src}) no-repeat center bottom /
          contain;
        a {
          color: ${themeGet('colors.menu', '#FF825C')};
        }
      }
      @media only screen and (max-width: 1366px) {
        margin: 0 17px;
      }
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
  .menu-right {
    margin-left: auto;
  }
  &.active {
    .menu-items {
      opacity: 0;
      visibility: hidden;
    }
  }
`;

export const MobileMenu = styled.div`
  display: none;
  
  @media only screen and (max-width: 991px) {
    display: flex;
  }
  width: 100%;
  height: calc(100vh - 70px);
  padding: 27px 0 40px;
  opacity: 0;
  visibility: hidden;
  position: absolute;
  top: 82px;
  flex-direction: column;
  background-color:${COLOURS.banner.bg};// ${themeGet('colors.white', '#ffffff')};
  transition: all 0.3s ease;
  color: ${themeGet('colors.secondary', '#000')};
  &.for-signed-in-user {
    display: flex;
    margin-top:-20px;
    padding: 27px 0 40px 30px;
  }
  &.active {
    opacity: 1;
    visibility: visible;
    box-shadow: 0 3px 12px
      ${themeGet('colors.shadow', 'rgba(38, 78, 118, 0.1)')};
  }
  .container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  ul {
    padding-bottom: 20px;
    li {
      a {
        display: block;
        padding: 13px 0;
        border-radius: 5px;
        transition: all 0.3s ease;
        color: ${themeGet('colors.textPrimary', '#02073E')};
      }
      &:hover {
        a {
          color: ${themeGet('colors.primary')};
        }
      }
    }
  }
  .reusecore__button {
    width: 100%;
    border-radius: 4px;
    background-image: -moz-linear-gradient(
      -31deg,
      rgb(64, 219, 216) 0%,
      rgb(44, 31, 132) 100%
    );
    background-image: -webkit-linear-gradient(
      -31deg,
      rgb(64, 219, 216) 0%,
      rgb(44, 31, 132) 100%
    );
    background-image: -ms-linear-gradient(
      -31deg,
      rgb(64, 219, 216) 0%,
      rgb(44, 31, 132) 100%
    );
    @media only screen and (max-width: 480px) {
      margin-top: 20px;
    }
  }
`;

export default NavbarWrapper;
