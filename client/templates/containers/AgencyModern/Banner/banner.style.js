import styled from 'styled-components';
import { rgba } from 'polished';
import { themeGet } from '@styled-system/theme-get';

import bannerBg from '../../../common/assets/image/agencyModern/banner2.png';

const BannerWrapper = styled.div`
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
`;

export const BannerContent = styled.div`  
  max-width: 40%;
  width: 100%;
  padding-top: 150px;
  padding-bottom: 160px;
  padding-left: 5vw;
  @media only screen and (max-width: 1600px) {
    max-width: 40%;
    padding-top: 150px;
    padding-bottom: 100px;
    border-color: red;
  }
  @media only screen and (max-width: 1400px) {
    padding-top: 150px;
    padding-bottom: 100px;
    max-width: 46%;
    padding-left: 5vw;
    border-color: yellow;
  }
  @media only screen and (max-width: 990px) {
    max-width: 100%;
    padding-left: 0;
    border-color: blue;
  }
  @media only screen and (max-width: 768px) {
    padding-top: 120px;
    padding-bottom: 90px;
    padding-left: 0;
  }
  @media only screen and (max-width: 575px) {
    padding-top: 120px;
    padding-bottom: 70px;
    padding-left: 0;
  }
  h1 {
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

      @media only screen and (max-width: 1280px) {
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
