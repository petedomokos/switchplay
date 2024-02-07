import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const SectionWrapper = styled.section`
  padding: 100px 0 75px;
  @media only screen and (max-width: 1440px) {
    padding: 100px 0 0;
  }
  @media only screen and (max-width: 768px) {
    padding: 50px 0 0;
  }
`;

export const Section = styled.div`
  display: flex;
  align-items: flex-start;

  @media only screen and (max-width: 990px) {
    flex-direction: column;
    align-items: center;
  }
  .visual-container {
    border-color: red;
    margin: auto;
    display: flex; 
    alignItems: center; 
    justify-content: center;
  }
  .img-container {
    border-color: yellow;
    width: 70%;
    height: 75%;
    display:flex;
    justify-content:center;
    align-items:flex-end;

    img {
      object-fit: contain;
      width:300px;
      @media only screen and (min-width: 1024px) and (max-width: 1366px) {
      }
      @media only screen and (max-width: 1024px) {
      }
    }
  

  }
  .left-img-container {
    margin-right:30%;
    align-self:flex-start;
  }
  .right-img-container {
    margin-left:30%;
    align-self:flex-end;
  }
  .top-img-container {
    align-self:center;
  }
  .bottom-img-container {
    align-self:center;
  }
`;

export const Content = styled.div`
  width: 50%;
  display: flex;
  flex-direction: column;
  @media only screen and (min-width: 1024px) and (max-width: 1366px) {
    width: 50%;
  }
  @media only screen and (min-width: 768px) and (max-width: 1024px) {
    width: 50%;
  }
  @media only screen and (max-width: 990px) {
    width: 80vw;
    margin: auto;
    align-items: center;
  }
  h2 {
    font-weight: 700;
    font-size: 36px;
    line-height: 1.66;
    letter-spacing: -1px;
    @media only screen and (min-width: 1024px) and (max-width: 1440px) {
      font-size: 30px;
      line-height: 1.5;
    }
    @media only screen and (min-width: 768px) and (max-width: 1024px) {
      font-size: 24px;
    }
    @media only screen and (max-width: 768px) {
      font-size: 24px;
      text-align: center;
    }
  }
  p {
    font-size: 15px;
    line-height: 42px;
    @media only screen and (min-width: 1024px) and (max-width: 1366px) {
      line-height: 32px;
    }
    @media only screen and (min-width: 768px) and (max-width: 1024px) {
      line-height: 28px;
      text-align: center;
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
