import styled from 'styled-components';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

import bannerBg from '../../../common/assets/image/agencyModern/banner2.png';

const BannerWrapper = styled.div`
  border: solid;
  border-color: #f0ded5;
  background-image: url(${bannerBg?.src});
  background-color: #f0ded5;
  background-size: 100%;
  background-position: right bottom;
  background-repeat: no-repeat;
  min-height: 80vh;

  @media only screen and (max-width: 1440px) {
    min-height: 100vh;
  }
  @media only screen and (max-width: 990px) {
    background: #f0ded5;
    background-image: none;
    min-height: auto;
  }
  .compatible-items-area {
    margin:auto;
    margin-top:210px;
    padding-bottom:60px;
    width: 90%;
    @media only screen and (max-width: 1400px) {
      margin-top:230px;
    }
    @media only screen and (max-width: 990px) {
      margin-top:60px;
    }
  }
  .compatible-items-list {

  }
`;

//margin-top:calc(60px + (100vh - 60px - 400px)/2);
export const BannerContent = styled.div`  
  max-width: 40%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content:space-around;
  height:360px;
  margin-top:calc(60px + (100vh - 40px - 400px)/2);
  @media only screen and (max-width: 1600px) {
    max-width: 40%;
    border-color: red;
    padding-left:2.5vw;
    padding-right:2.5vw;
  }
  @media only screen and (max-width: 1400px) {
    max-width: 46%;
    border-color: yellow;
  }
  @media only screen and (max-width: 990px) {
    max-width: 100%;
    justify-content:flex-start;
    height:auto;
    margin-top:80px;
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    border-color: pink;
  }
  @media only screen and (max-width: 575px) {
    border-color: black;
  }
  .main-img-small {
    margin:auto; 
    margin-top:0px;
    margin-bottom:20px; 
  }
  h1 {
    border-color: red;
    font-size: 54px;
    line-height: 1.6;
    font-weight: 700;
    color: ${themeGet('colors.menu', '#02073e')};
    margin-bottom: 24px;
    letter-spacing: -2px;
    @media only screen and (max-width: 1600px) {
      font-size: 40px;
      margin-bottom: 20px;
    }
    @media only screen and (max-width: 1440px) {
      margin-bottom: 15px;
      letter-spacing: -1.5px;
    }
    @media only screen and (max-width: 990px) {
      font-size: 28px;
      margin-bottom: 20px;
      text-align: center;
      max-width: 550px;
      margin: 0 auto;
      margin-bottom: 20px;
    }

    @media only screen and (max-width: 768px) {
      font-size: 34px;
      text-align: center;
      max-width: 550px;
      margin: 0 auto;
      margin-bottom: 20px;
    }
    @media only screen and (max-width: 575px) {
      font-size: 23px;
      margin-bottom: 15px;
    }
    @media only screen and (orientation: landscape) and (max-width: 768px) {m
      font-size: 23px;
      margin-bottom: 30px;
    }
  }
  .banner-caption {
    color: ${themeGet('colors.paragraph', '#02073E')};
    font-size: 18px;
    line-height: 2.2;
    font-weight: 400;
    margin-bottom: 0;
    @media only screen and (max-width: 1400px) {
      font-size: 16px;
      max-width: 85%;
    }
    @media only screen and (max-width: 990px) {
      line-height: 33px;
      text-align: center;
      max-width: 550px;
      margin: 0 auto;
      margin-bottom: 40px;
    }
    @media only screen and (max-width: 768px) {
      text-align: center;
      max-width: 550px;
      margin: 0 auto;
      margin-bottom: 40px;
    }
    @media only screen and (max-width: 575px) {
      margin-bottom: 33px;
    }
  }
`;

export const Subscribe = styled.div`
  display: flex;
  margin-top: 50px;
  @media only screen and (max-width: 1440px) {
    margin-top: 40px;
    width: 93%;
  }
  @media only screen and (max-width: 990px) {
    margin: 0 auto;
    margin-top: 40px;
    max-width: 60%;
  }
  @media only screen and (max-width: 768px) {
    margin: 0 auto;
    margin-top: 40px;
    max-width: 80%;
  }

  @media only screen and (max-width: 575px) {
    align-items: center;
    width: 100%;
    flex-direction: column;
    max-width: 100%;
  }
  .reusecore__input {
    width: 100%;
  }
  .field-wrapper {
    margin-right: 15px;
    @media only screen and (max-width: 575px) {
      margin-right: 0px;
    }
    input {
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
    }
  }
  button {
    background-color: #ff825c;
    min-width: 150px;

    @media only screen and (max-width: 480px) {
      min-width: 100%;
      margin-top: 15px;
    }
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
