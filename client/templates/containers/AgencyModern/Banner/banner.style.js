import styled from 'styled-components';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

import bannerBg from '../../../common/assets/image/agencyModern/banner2.png';
import { MAIN_BANNER_MARGIN_VERT, COLOURS } from '../../../../core/websiteConstants';


//#f0ded5
const BannerWrapper = styled.div`
  border: solid;
  border-color:yellow;
  background-image: url(${bannerBg?.src});
  background-color: ${COLOURS.banner.bg};
  background-size: 100%;
  background-position: right bottom;
  background-repeat: no-repeat;
  width:100%;
  min-height: 80vh;
  display:flex;
  justify-content:center;
  align-items: center;
  padding-top:${MAIN_BANNER_MARGIN_VERT.xl}px;
  padding-bottom:${MAIN_BANNER_MARGIN_VERT.xl}px;

  @media only screen and (max-width: 1440px) {
    min-height: 100vh;
  }
  @media only screen and (max-width: 990px) {
    min-height: auto;
  }
  @media only screen and (max-width: 575px) {
    flex-direction: column;
    min-height: auto;
    padding-top:130px;
    padding-bottom:0;
  }
  .banner-image-area {
    width:45%;
    height:calc(100vh - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
    @media only screen and (max-width: 575px) {
      width:100%;
      height:auto;
    }
  }
  .banner-caption-area-sm {
    //border:solid;
    width:300px;
    margin:60px auto 20px;
    padding-left:20px;
  }
  .banner-caption {
    //border:solid;
    color: ${themeGet('colors.paragraph', '#02073E')};
    font-size: 16px;
    line-height: 1.5;
    font-weight: 400;
    max-width:330px;
    @media only screen and (max-width: 1400px) {
      font-size: 14px;
    }
    @media only screen and (max-width: 990px) {
      max-width: 85%;
    }
    @media only screen and (max-width: 575px) {
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
  //border: solid;
  max-width: 50%;
  width: 45%;
  display: flex;
  flex-direction: column;
  height:calc(100vh - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
  @media only screen and (max-width: 1600px) {
    border-color: red;
    padding-left:2.5vw;
    padding-right:2.5vw;
  }
  @media only screen and (max-width: 1400px) {
    border-color: yellow;
  }
  @media only screen and (max-width: 990px) {
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    justify-content:flex-start;
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
  h1 {
    //border: solid;
    border-color: red;
    font-size: 54px;
    line-height: 0.8;
    font-weight: 500;
    &.in-bold {
      font-weight: 900;
    }
    color: ${themeGet('colors.menu', '#02073e')};
    letter-spacing: -2px;
    @media only screen and (max-width: 1600px) {
      font-size: 48px;
    }
    @media only screen and (max-width: 1440px) {
      font-size: 42px;
      letter-spacing: -1.5px;
    }
    @media only screen and (max-width: 990px) {
      font-size: 36px;
      max-width: 550px;
    }

    @media only screen and (max-width: 768px) {
      font-size: 30px;
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
    @media only screen and (orientation: landscape) and (max-width: 768px) {m
      font-size: 24px;
    }
  }
`;

export const Subscribe = styled.div`
  //border: solid;
  border-color:blue;
  display: flex;
  flex-direction: column;
  max-width:300px;
  @media only screen and (max-width: 1440px) {
    width: 93%;
  }
  @media only screen and (max-width: 990px) {
  }
  @media only screen and (max-width: 768px) {
  }

  @media only screen and (max-width: 575px) {
    margin:20px 0 40px;
    align-items: center;
    width: 100%;
    flex-direction: column;
  }
  .reusecore__input {
    width: 100%;
  }
  .field-wrapper {
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
