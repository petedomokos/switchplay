import styled from 'styled-components';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

import bannerBg from '../../../common/assets/image/agencyModern/banner2.png';
import { MAIN_BANNER_MARGIN_VERT, COLOURS, NAVBAR_HEIGHT } from '../../../../core/websiteConstants';


//#f0ded5
const BannerWrapper = styled.div`
  border: solid;
  border-color:white;
  //background-image: url(${bannerBg?.src});
  //background-color: ${COLOURS.banner.bg};
  background-size: 100%;
  background-position: right bottom;
  background-repeat: no-repeat;
  width:100%;
  height: calc(100vh - ${2 * NAVBAR_HEIGHT}px);
  display:flex;
  justify-content:center;
  align-items: center;
  //padding-top:${MAIN_BANNER_MARGIN_VERT.xl}px;
  //padding-bottom:${MAIN_BANNER_MARGIN_VERT.xl}px;
  padding:0;

  @media only screen and (max-width: 1440px) {
  }
  @media only screen and (max-width: 990px) {
  }
  @media only screen and (max-width: 768px) {
    flex-direction: column;
    flex-direction:column;
    justify-content:flex-start;
    height:auto;
    min-height: auto;
    padding-top:70px;
    padding-bottom:0;
  }
  .banner-image-area {
    //border:solid;
    border-color:red;
    width:50%;
    height:calc(100% - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
    @media only screen and (max-width: 768px) {
      width:100%;
      height:auto;
    }
  }
  .banner-caption-area-sm {
    border:solid;
    width:300px;
    margin:40px auto;
    padding-left:20px;
  }
  .banner-caption {
    border:solid;
    color: ${themeGet('colors.paragraph', '#02073E')};
    font-size: 24px;
    line-height: 1.5;
    font-weight: 400;
    max-width:30vw;
    @media only screen and (max-width: 1400px) {
      font-size: 14px;
    }
    @media only screen and (max-width: 990px) {
      max-width: 85%;
    }
    @media only screen and (max-width: 768px) {
      margin:40px 0;
      font-size: 18px;
      height:auto;
      max-width:300px;
    }
  }
  .banner-caption-1 {
    width:300px;
  }
  .banner-caption-2 {
    width:270px;
  }
  .banner-caption-3 {
    width:230px;
  }
`;

export const BannerContent = styled.div`  
  border: solid;
  border-color:red;
  max-width: 50%;
  width: 50%;
  display: flex;
  padding-top:30px;
  flex-direction: column;
  justify-content: space-between;
  height:calc(100% - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
  @media only screen and (max-width: 1600px) {
    border-color: red;
    padding-right:2.5vw;
  }
  @media only screen and (max-width: 1400px) {
    border-color: yellow;
    border-color:red;
  }
  @media only screen and (max-width: 990px) {
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    //justify-content:flex-start;
    width:90%;
    max-width:90%;
    height:auto;
    border-color: pink;
  }
  @media only screen and (max-width: 575px) {
    //margin-top:40px;
    //margin-bottom:40px;
    width:90%;
    max-width:90%;
    border-color: black;
    height:auto;
  }
  .main-img-small {
    //margin:auto; 
    margin-top:0px;
    margin-bottom:20px; 
  }
  .heading {
    margin-top:30px;
  }
  h1 {
    border: solid;
    font-size: 80px;
    line-height: 0.8;
    font-weight: 500;
    &.in-bold {
      font-weight: 900;
    }
    color: ${themeGet('colors.menu', '#02073e')};
    letter-spacing: -2px;
    @media only screen and (max-width: 1600px) {
      border-color: red;
    }
    @media only screen and (max-width: 1440px) {
      border-color: yellow;
      font-size: 48px;
      letter-spacing: -1.5px;
    }
    @media only screen and (max-width: 990px) {
      border-color: blue;
      font-size: 42px;
      max-width: 550px;
    }

    @media only screen and (max-width: 768px) {
      border-color: pink;
      font-size: 42px;
      text-align: center;
      max-width: 550px;
    }
    @media only screen and (max-width: 575px) {
      font-weight: 200;
      font-size: 36px;
      line-height: 1.1;
      &.in-bold {
        font-size:42px;
      }
    }
    @media only screen and (orientation: landscape) and (max-width: 768px) {
      font-size: 24px;
    }
  }
`;

export const Subscribe = styled.div`
  //border: solid;
  border-color:red;
  display: flex;
  flex-direction: column;
  max-width:300px;
  @media only screen and (max-width: 1440px) {
    width: 93%;
    border-color: yellow;
  }
  @media only screen and (max-width: 990px) {
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    margin:20px auto 40px;
    align-items: center;
    width: 100%;
    flex-direction: column;
    border-color:pink;
  }

  @media only screen and (max-width: 575px) {
    margin:20px auto 40px;
    align-items: center;
    width: 100%;
    flex-direction: column;
    border-color:black;
  }
  .reusecore__input {
    width: 100%;
  }
  .field-wrapper {
    @media only screen and (max-width: 990px) {
      display:none;
    }
    margin-bottom:5px;
    input {
      min-width: 200px;
      font-family: DM Sans;
      font-size: 16px;
      min-height: 60px;
      padding: 0 24px;
      ::placeholder {
        color: ${rgba('#02073E', 0.4)};
        opacity: 1; /* Firefox */
      }
      &:focus {
        border-color: #ff825c;
      }

      @media only screen and (max-width: 1440px) {
        min-height: 50px;
      }
      @media only screen and (max-width: 575px) {
        min-height: default;
        display:none;
      }

      @media only screen and (max-width: 575px) {
        display:none;
      }
    }
  }
  button {
    background-color: #ff825c;
    min-width: 150px;
    max-width:150px;
  }
`;

export const ImageGroup = styled.div`
  gap: 23px;
  display: grid;
  align-items: center;
  grid-template-columns: repeat(3, auto);
  img {
    @media only screen and (max-width: 575px) {
      max-width: 27%;
    }
  }
`;

export default BannerWrapper;
