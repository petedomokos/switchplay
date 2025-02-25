import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const SectionWrapper = styled.section`
  background-color: #283742;
  padding: 120px 0px 120px;
`;

export const SectionTitle = styled.div`
  max-width: 900px;
  width: 90%;
  margin: 80px auto 60px;
  display:flex;
  justify-content:center;
  flex-wrap:wrap;
  h2 {
    //border:solid;
    font-weight: 500;
    font-size: 32px;
    line-height: 1.3;
    letter-spacing: -0.5px;
    margin: 10px 15px;
    color: #ffffff;
    white-space: nowrap;
    @media screen and (max-width: 1440px) {
      margin-bottom: 4px;
      border-color:red;
    }
    @media screen and (max-width: 990px) {
      font-size: 26px;
      border-color:yellow;
      
    }
    @media screen and (max-width: 575px) {
      border-color:blue;
      line-height: 1;
      margin: 10px 0px 0;
      font-size:26px;
      font-weight: 200;
    }
  }
  p {
    padding-top:10px;
    font-size: 15px;
    line-height: 2.1;
    color: #ffffff;
    @media screen and (max-width: 1440px) {
      line-height: 2;
    }
  }
`;

export const FeatureWrapper = styled.div`
  display: flex;
  justify-content: space-evenly;
  flex-wrap: wrap;

  @media screen and (max-width: 700px) {
    justify-content: space-between;
  }

  .ultimateFeature {
    text-align: center;
    margin: 20px auto;
    width: calc(33.3333% - 70px);
    @media screen and (max-width: 990px) {
      width: calc(50% - 70px);
    }
    @media screen and (max-width: 768px) {
      width: calc(50% - 40px);
    }
    @media screen and (max-width: 575px) {
      width: 90%;
    }
    .icon__wrapper {
      margin-bottom: 28px;
    }
    h4 {
      //border:solid;
      font-size: 22px;
      line-height: 30px;
      color: #ffffff;
      @media screen and (max-width: 1440px) {
        margin-bottom: 10px;
        font-size:20px;
      }
      @media screen and (max-width:990px) {
        margin-bottom: 10px;
        font-size:18px;
      }
      @media screen and (max-width: 768px) {
        margin-bottom: 10px;
        font-size:16px;
      }
    }
    p {
      color: rgba(255, 255, 255, 0.8);
      font-size: 18px;
      line-height: 30px;
      @media screen and (max-width: 1440px) {
        line-height: 25px;
        font-size: 18px;
        margin-bottom: 8px;
      }
      @media screen and (max-width:990px) {
        font-size:16px;
      }
      @media screen and (max-width: 768px) {
        font-size:14px;
      }
    }
    .learn__more {
      font-weight: 500;
      font-size: 15px;
      line-height: 42px;
      display: inline-flex;
      align-items: center;
      color: ${themeGet('colors.linkColor')};
      i {
        line-height: 1;
        margin-left: 2px;
        transition: 0.3s ease 0s;
      }
      &:hover i {
        margin-left: 7px;
      }
    }
  }
`;

export default SectionWrapper;
