import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import { grey10 }  from "../../../../core/websiteConstants";

const SectionWrapper = styled.section`
  width: 90%;
  margin:auto;
  padding: 100px 0 60px;
  @media only screen and (max-width: 1440px) {
    padding: 40px 0 0px;
  }

  @media only screen and (max-width: 768px) {
    padding: 40px 0 40px;
  }
`;

export const SectionHeader = styled.header`
  text-align: center;
  margin-bottom: 60px;
  @media only screen and (max-width: 1440px) {
    margin-bottom: 50px;
  }
  @media only screen and (max-width: 991px) {
    margin-bottom: 40px;
  }
  @media only screen and (max-width: 480px) {
    margin-bottom: 25px;
  }

  h2 {
    font-size: 36px;
    font-weight: 700;
    line-height: 1.9;
    margin-bottom: 7px;

    @media only screen and (max-width: 991px) {
      font-size: 30px;
      margin-bottom: 10px;
    }
    @media only screen and (max-width: 767px) {
      font-size: 28px;
    }
    @media screen and (max-width: 480px) {
      font-size: 24px;
      line-height: 30px;
      margin-bottom: 20px;
    }
  }

  p {
    padding-top:10px;
    font-family: 'DM Sans';
    font-weight: 400;
    font-size: 15px;
    line-height: 2;
    margin-bottom: 0;
    max-width: 500px;
    margin: 0 auto;
    width: 100%;
    @media only screen and (max-width: 1440px) {
      font-size: 16px;
      line-height: 1.6;
    }
    @media only screen and (max-width: 991px) {
      font-size: 15px;
      line-height: 28px;
    }
  }
`;


export const ServiceWrapper = styled.div`
  display: flex;
  flex-direction:column;
  justify-content:center;
  align-items:center;
  @media only screen and (min-width: 576px) and (max-width: 768px) {
    transform:scale(0.6);
  }
  .services {
    display:flex;
    align-items:flex-start;
    justify-content:center;
    @media only screen and (max-width: 575px) {
      flex-direction:column;
      align-items:center;
    }

    .service {
      &.primary-service {
        @media only screen and (max-width: 575px) {
          margin-bottom:30px;
        }
      }
      &.secondary-service {
        margin:0 7.5vw;
        @media only screen and (max-width: 575px) {
          margin:0 0 30px;
        }
      }
    }
  }

  h4 {
    margin: 20px 0 20px;
    font-family: 'DM Sans';
    font-weight: 700;
    font-size: 18px;
    line-height: 30px;
    color:${grey10(2)};
    @media only screen and (max-width: 1440px) {
    }
    @media only screen and (max-width: 990px) {
      font-size: 18px;
    }
    @media only screen and (max-width: 768px) {
      text-align: center;
    }
    @media only screen and (max-width: 575px) {
      text-align: center;
    }
  }

  p {
    margin: 0;
    font-family: 'DM Sans';
    font-size: 15px;
    line-height: 30px;
    color: ${themeGet('colors.text', grey10(4))};
    text-align:center;
    @media only screen and (max-width: 1440px) {
      font-size: 16px;
    }
    @media only screen and (max-width: 1360px) {
      font-size: 15px;
      line-height: 26px;
    }
    @media only screen and (max-width: 768px) {
      text-align: center;
    }
    @media only screen and (max-width: 480px) {
      text-align: center;
    }
  }
`;

export default SectionWrapper;

/*

export const ServiceWrapper = styled.div`
  border: solid;
  gap: 40px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  @media only screen and (max-width: 767px) {
    grid-template-columns: repeat(1, 1fr);
  }
  .service__item {
    gap: 30px;
    display: grid;
    align-items: flex-start;
    grid-template-columns: 70px auto;
    @media only screen and (max-width: 768px) {
      grid-template-columns: 1fr;
    }
    @media only screen and (max-width: 767px) {
      gap: 15px;
    }
    @media only screen and (max-width: 480px) {
      align-items: center;
    }
    .icon__wrapper {
      display: inline-flex;
      @media only screen and (max-width: 768px) {
        justify-content: center;
      }
    }

    h4 {
      margin: 0 0 14px;
      font-family: 'DM Sans';
      font-weight: 700;
      font-size: 18px;
      line-height: 30px;
      @media only screen and (max-width: 1440px) {
        margin: 0 0 5px;
      }
      @media only screen and (max-width: 1360px) {
        font-size: 18px;
      }
      @media only screen and (max-width: 768px) {
        text-align: center;
      }
      @media only screen and (max-width: 480px) {
        text-align: center;
      }
    }

    p {
      margin: 0;
      font-family: 'DM Sans';
      font-size: 15px;
      line-height: 30px;
      color: ${themeGet('colors.text', '#294859')};
      @media only screen and (max-width: 1440px) {
        font-size: 16px;
      }
      @media only screen and (max-width: 1360px) {
        font-size: 15px;
        line-height: 26px;
      }
      @media only screen and (max-width: 768px) {
        text-align: center;
      }
      @media only screen and (max-width: 480px) {
        text-align: center;
      }
    }
  }
`;
*/
