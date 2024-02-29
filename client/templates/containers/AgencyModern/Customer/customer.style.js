import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import { grey10 } from '../../../../core/websiteConstants';

const SectionWrapper = styled.section`
//border:solid;
border-color:red;
  width:100%; 
  padding: 80px 0 80px;
  @media only screen and (max-width: 1440px) {
  }
  @media only screen and (max-width: 768px) {
  }
`;

export const Section = styled.div`
//border:solid;
border-color:yellow;
  width:100%;
  display: flex;
  align-items: center;
  flex-direction:column;
  
  .visual-container {
    display: flex; 
    alignItems: flex-start; 
    justify-content: center;
  }
`;

export const Content = styled.div`
//border:solid;
border-color:blue;
  width: 90%;
  max-width:600px;
  display: flex;
  flex-direction: column;
  justify-content:flex-end;
  align-items:center;
  h3 {
    margin:10px auto;
    display:flex;
    flex-direction:column;
    align-items:center;
    border-color: pink;
    font-weight: 700;
    font-size: 40px;
    line-height: 1;
    letter-spacing: -1px;
    color:${grey10(2)};
    @media only screen and (min-width: 1024px) and (max-width: 1440px) {
      font-size: 42px;
      line-height: 1;
    }
    @media only screen and (min-width: 768px) and (max-width: 1024px) {
      font-size: 32px;
    }
    @media only screen and (max-width: 768px) {
      font-size: 28px;
      text-align: center;
    }
    @media only screen and (max-width: 575px) {
      font-size: 24px;
      text-align: center;
    }
  }
  p {
    //border:solid;
    border-color:pink;
    padding:10px 5% 0;
    margin:0;
    display:flex;
    flex-direction:column;
    font-size: 15px;
    line-height: 42px;
    color:${grey10(3)};
    @media only screen and (min-width: 1024px) and (max-width: 1366px) {
      line-height: 32px;
    }
    @media only screen and (min-width: 768px) and (max-width: 1024px) {
      line-height: 28px;
    }
    @media only screen and (max-width: 768px) {
      line-height: 32px;
      text-align: center;
    }
  }
  .explore {
    color: ${themeGet('colors.linkColor')};
    font-weight: 700;
    font-size: 15px;
    line-height: 42px;
    display: inline-flex;
    align-items: center;
    @media only screen and (max-width: 768px) {
      justify-content: center;
      width: 100%;
    }
    i {
      line-height: 1;
      margin-left: 2px;
      transition: 0.3s ease 0s;
    }
    &:hover i {
      margin-left: 7px;
    }
    @media only screen and (min-width: 1024px) and (max-width: 1440px) {
      margin-top: 5px;
    }
    @media only screen and (max-width: 768px) {
      margin-top: 5px;
    }
  }
`;

export const Illustration = styled.figure`
  width: 50%;
  margin: 0 5% 0 0;
  @media only screen and (max-width: 768px) {
    margin-bottom: 30px;
    width: 100%;
  }

  img {
    height: auto;
  }
`;
export default SectionWrapper;
