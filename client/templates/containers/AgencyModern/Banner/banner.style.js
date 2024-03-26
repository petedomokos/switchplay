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
  height:calc(100vh - ${2 * NAVBAR_HEIGHT}px - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
  min-height:550px;
  //min-height: calc(100vh - ${2 * NAVBAR_HEIGHT}px);
  margin-top:${MAIN_BANNER_MARGIN_VERT.xl}px;
  display:flex;
  justify-content:center;

  @media only screen and (orientation:portrait) {
    max-height:550px;
  }

  @media only screen and (orientation:portrait) and (min-width: 769px) {
    //padding-top:50px;
    border-color:black;
    //min-height:auto;
  }

  @media only screen and (max-width: 1440px) {
  }
  @media only screen and (max-width: 990px) {
  }
  @media only screen and (max-width: 768px) {
    flex-direction:column;
    justify-content:flex-start;
    align-items:center;
    height:auto;
    min-height: auto;
    padding-top:70px;
    padding-bottom:0;
  }
  .banner-image-area {
    border:solid;
    border-color:red;
    width:50%;
    //height:calc(100vh - ${2 * NAVBAR_HEIGHT}px - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
    //height:100%;
    //min-height:550px;
    @media only screen and (min-width: 769px) {
      max-height:60vw;
    }
    @media only screen and (orientation:portrait) {
      //min-height:550px;
    }
    @media only screen and (orientation:portrait) and (max-width: 990px) {
      //min-height:500px;
    }
    @media only screen and (max-width: 768px) {
      width:100%;
      height:40vh;
      max-height:40vh;
      min-height:40vh;
      //height:auto;
      border-color:orange;
    }
    overflow:hidden;
  }
  .banner-caption-md-up {
    border:solid;
    color: ${themeGet('colors.paragraph', '#02073E')};
    font-size: 26px;
    line-height: 1.5;
    font-weight: 400;
    width:90%;
    @media only screen and (orientation:portrait) and (max-width: 1440px) {
      //font-size: 26px;
      //max-width:35vw;
    }
    @media only screen and (orientation:landscape) and (max-width: 1440px) {
      //font-size: 22px;
      //max-width:35vw;
    }
    @media only screen and (max-width: 990px) {
      max-width: 85%;
      font-size: 22px;
    }
  }
  .banner-caption-area-sm {
    border:solid;
    width:400px;
    margin:40px auto;
    @media only screen and (max-width: 575px) {
      width:300px;
    }
  }
  .banner-caption-sm {
    border:solid;
    color: ${themeGet('colors.paragraph', '#02073E')};
    font-size: 24px;
    line-height: 1.5;
    font-weight: 400;
    text-align:center;
    @media only screen and (orientation:portrait) and (max-width: 1440px) {
      font-size: 22px;
    }
    @media only screen and (orientation:landscape) and (max-width: 1440px) {
      font-size: 22px;
    }
    @media only screen and (max-width: 768px) {
      margin:40px auto;
      font-size: 18px;
    }
    @media only screen and (max-width: 575px) {
      font-size:16px;
    }
  }
  .banner-caption-sm-1 {
    @media only screen and (max-width: 575px) {
      width:250px;
    }
  }
  .banner-caption-sm-2 {
    @media only screen and (max-width: 575px) {
      width:250px;
    }
  }
  .banner-caption-sm-3 {
    @media only screen and (max-width: 575px) {
      width:210px;
    }
  }
`;

export const BannerContent = styled.div`  
  border: solid;
  max-width: 600px;
  width: 50%;
  //padding-top:1.5%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  //height:calc(100vh - ${2 * NAVBAR_HEIGHT}px - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
  height:100%;
  //min-height:550px;
  @media only screen and (min-width: 769px) {
    //max-height:60vw;
  }
  @media only screen and (orientation:portrait) {
    //min-height:550px;
  }
  @media only screen and (max-width: 1500px) {
    border-color: red;
    padding-right:2.5vw;
  }
  @media only screen and (max-width: 1440px) {
    border-color: yellow;
  }
  @media only screen and (max-width: 990px) {
    //min-height:500px;
    padding-top:0;
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    //justify-content:flex-start;
    align-items:center;
    width:90%;
    max-width:90%;
    //min-height:auto;
    margin-bottom: 60px;
    //height:auto;
    border-color: pink;
  }
  @media only screen and (max-width: 575px) {
    margin-bottom: 40px;
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
    font-size: 72px;
    line-height: 0.8;
    font-weight: 500;
    &.highlighted {
      font-weight: 900;
      font-size: 88px;
    }
    color: ${themeGet('colors.menu', '#02073e')};
    letter-spacing: -2px;
    @media only screen and (max-width: 1500px) {
    }
    @media only screen and (orientation:portrait) and (max-width: 1440px) {
      font-size: 60px;
      letter-spacing: -1.5px;
      &.highlighted {
        font-size: 68px;
        line-height: 1;
      }
    }
    @media only screen and (orientation:landscape) and (max-width: 1440px) {
      font-size: 80px;
      letter-spacing: -1.5px;
      &.highlighted {
        font-size: 88px;
        line-height: 1;
      }
    }
    @media only screen and (max-width: 1250px) {
      max-width: 550px;
      font-size: 56px;
      &.highlighted {
        font-size: 64px;
        line-height: 1;
      }
    }
    @media only screen and (max-width: 990px) {
      max-width: 550px;
      font-size: 48px;
      &.highlighted {
        font-size: 56px;
        line-height: 1;
      }
    }

    @media only screen and (max-width: 768px) {
      text-align: center;
      max-width: 550px;
      font-size: 42px;
      &.highlighted {
        font-size: 50px;
        line-height: 1;
      }
    }
    @media only screen and (max-width: 575px) {
      font-weight: 200;
      line-height: 1.1;
      font-size: 36px;
      &.highlighted {
        font-size:42px;
        line-height: 1;
      }
    }
    @media only screen and (orientation: landscape) and (max-width: 768px) {
      font-size: 20px;
      &.highlighted {
        font-size:24px;
        line-height: 1;
      }
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
  }
  @media only screen and (max-width: 990px) {
  }
  @media only screen and (max-width: 768px) {
    margin:20px auto 40px;
    align-items: center;
    width: 100%;
    flex-direction: column;
  }

  @media only screen and (max-width: 575px) {
    margin:20px auto 40px;
    align-items: center;
    width: 100%;
    flex-direction: column;
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
