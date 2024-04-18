import styled from 'styled-components';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

import bannerBg from '../../../common/assets/image/agencyModern/banner2.png';
import { MAIN_BANNER_MARGIN_VERT, COLOURS, NAVBAR_HEIGHT } from '../../../../core/websiteConstants';


//#f0ded5
const BannerWrapper = styled.div`
  //border: solid;
  //background-image: url(${bannerBg?.src});
  //background-color: ${COLOURS.banner.bg};
  background-size: 100%;
  background-position: right bottom;
  background-repeat: no-repeat;
  width:100%;
  height:calc(100vh - ${2 * NAVBAR_HEIGHT}px - ${2 * MAIN_BANNER_MARGIN_VERT.xl}px);
  min-height:550px;
  margin-top:${MAIN_BANNER_MARGIN_VERT.xl}px;
  display:flex;
  justify-content:center;

  @media only screen and (orientation:portrait) and (min-width: 991px) {
    max-height:550px;
    border-color:orange;
  }

  @media only screen and (max-width: 990px) {
    height:auto;
    min-height: auto;
    max-height:auto;
    flex-direction:column;
    justify-content:flex-start;
    align-items:center;
    margin-top:0;
    padding-top:0px;
    padding-bottom:0;
  }
  .banner-image-area {
    //border:solid;
    border-color:red;
    width:50%;
    @media only screen and (min-width: 769px) {
      max-height:60vw;
    }
    @media only screen and (max-width: 990px) {
      width:100%;
      height:60vh;
      max-height:60vh;
      min-height:60vh;
      margin-top:40px;
      //height:auto;
      border-color:orange;
    }
    @media only screen and (orientation: portrait) and (max-width: 768px) {
      height:50vh;
      max-height:50vh;
      min-height:50vh;
    }
    @media only screen and (orientation: landscape) and (max-width: 768px) {
      height:400px;
      max-height:400px;
      min-height:400px;
    }
    @media only screen and (max-width: 575px) {
      height:40vh;
      max-height:40vh;
      min-height:40vh;
      margin-top:25px;
    }
    overflow:hidden;
  }
`;

export const BannerContent = styled.div`  
  //border: solid;
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
    align-items:center;
    width:90%;
    max-width:90%;
    //min-height:auto;
    margin:100px 0 30px;
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    //justify-content:flex-start;
    align-items:center;
    width:90%;
    max-width:90%;
    //min-height:auto;
    margin: 80px auto 80px;
    //height:auto;
    border-color: pink;
  }
  @media only screen and (orientation: landscape) and (max-width: 768px) {
    margin: 20px auto 80px;
  }
  @media only screen and (max-width: 575px) {
    margin: 30px auto 20px;
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
    //border: solid;
    font-size: 70px;
    line-height: 1.3;
    font-weight: 700;
    &.highlighted {
      font-weight: 900;
      font-size: 90px;
    }
    color: ${themeGet('colors.menu', '#02073e')};
    letter-spacing: -2px;
    @media only screen and (orientation:portrait) and (max-width: 1440px) {
      font-size: 60px;
      letter-spacing: -1.5px;
      &.highlighted {
        font-size: 58px;
        line-height: 1;
        border-color:red;
      }
    }
    @media only screen and (orientation:landscape) and (max-width: 1440px) {
      margin-top:30px;
      font-size: 70px;
      letter-spacing: -1.5px;
      border-color:red;
      &.highlighted {
        font-size: 88px;
        line-height: 1;
      }
    }
    @media only screen and (orientation:landscape) and (max-width: 1250px) {
      margin-top:0;
      max-width: 550px;
      font-size: 60px;
      border-color:yellow;
      &.highlighted {
        font-size: 64px;
        line-height: 1;
      }
    }
    @media only screen  and (orientation:landscape) and (max-width: 990px) {
      margin-top:0;
      max-width:100%;
      text-align: center;
      font-size: 50px;
      border-color:blue;
      &.highlighted {
        font-size: 74px;
        line-height: 1;
      }
    }

    @media only screen and (orientation: portrait) and (max-width: 768px) {
      margin-top:0;
      font-size: 50px;
      border-color:pink;
      &.highlighted {
        font-size: 66px;
        line-height: 1;
      }
    }
    @media only screen and (orientation: landscape) and (max-width: 768px) {
      margin-top:0;
      font-size: 36px;
      border-color:orange;
      &.highlighted {
        font-size:24px;
        line-height: 1;
      }
    }
    @media only screen and (max-width: 575px) {
      margin-top:0;
      line-height: 0.8;
      font-size: 36px;
      border-color:black;
      text-align:center;
      &.highlighted {
        font-size:54px;
        line-height: 1;
      }
    }
  }
  .banner-caption-area {
    //border:solid;
    display:flex;
    flex-direction:column;
    .banner-caption {
      font-size:26px;
      //border:solid;
      border-color:red;
      max-width:80%;
      &.banner-caption-line-1 {
        margin:6% 0 3.5%;

      }
      &.banner-caption-line-2 {
        margin:3.5% 0 6%;

      }
      @media only screen and (orientation:portrait) and (max-width: 1440px) {
        font-size:24px;
      }
      @media only screen and (orientation:landscape) and (max-width: 1440px) {
        font-size:26px;
      }
      @media only screen and (orientation:landscape) and (max-width: 1250px) {
        font-size:20px;
      }
      @media only screen and (max-width: 990px) {
        max-width:100%;
        align-items:center;
        font-size:26px;
        text-align:center;
      }
      @media only screen and (orientation: portrait) and (max-width: 768px) {
        font-size:26px;
      }
      @media only screen and (orientation: landscape) and (max-width: 768px) {
        font-size:18px;
      }
      @media only screen and (max-width: 575px) {
        font-size:14px;
      }

    }

  }
  button {
    //border:solid;
    @media only screen and (max-width: 768px) {
      margin-top:30px;
    }
    @media only screen and (max-width: 575px) {
      margin-top:0px;
    }
    
  }
`;

export default BannerWrapper;
