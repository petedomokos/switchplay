import styled from 'styled-components';
import { rgba } from 'polished';

const SectionWrapper = styled.section`
  position:relative;
  //border:solid;
  //background-color: #f6ebe6;
  //background-color:#ffffff;
  width:100%;
  height:100%;
  padding: 0px 0;
  position: relative;
  z-index: 0;
  .close-form {
    position:absolute;
    right:0;
    top:0;
    width:60px;
    height:60px;
    @media only screen and (max-width: 768px) {
      width:50px;
      height:50px;
    }
  }
  .illustration {
    position: absolute;
    z-index: -1;
  }
  .bg1 {
    top: 170px;
    left: 300px;
  }
  .bg2 {
    bottom: 0;
    right: 20px;
  }
  .bg3 {
    left: 0;
    top: 0;
  }
  .bg4 {
    right: 280px;
    top: 0;
  }
  .bg5 {
    left: 140px;
    bottom: 0;
  }
`;

export const FooterInner = styled.div`
  width:100%;
  //border:solid;
  background-color: #ffffff;
  border-radius: 15px;
  padding: 60px 0 30px;
  display: flex;
  flex-direction:column;
  align-items: center;
  @media only screen and (max-width: 990px) {
    flex-direction: column;
  }
  @media only screen and (max-height: 900px) {
    padding: 30px 0 15px;
  }
  @media only screen and (max-width: 575px) {
    padding: 40px 0 5px;
  }
  > div {
    //width: calc(100% / 2);
    @media only screen and (max-width: 990px) {
      //width: 100%;
    }
  }
`;

export const Content = styled.div`
  //border:solid;
  border-color:red;
  width:80%;
  min-width:260px;
  //margin-right: 70px;
  display:flex;
  flex-direction:column;
  align-items:center;
  @media only screen and (max-width: 990px) {
    //margin-right: 0;
  }
  h3 {
    font-weight: 700;
    font-size: 30px;
    line-height: 55px;
    letter-spacing: -0.5px;
    margin-bottom: 6px;
    @media only screen and (max-width: 575px) {
      font-size: 20px;
      line-height: 30px;
    }
  }
  p {
    color: #343d48;
    font-size: 16px;
    line-height: 30px;
    text-align:center;
  }
`;

export const SubscriptionForm = styled.div`
  //border:solid; 
  width:50%;
  min-width:260px;
  padding:30px 0;
  display:flex;
  flex-direction:column;
  > div {
    //display: flex;
    @media only screen and (max-width: 575px) {
      //flex-direction: column;
    }
  }
  @media only screen and (max-width: 575px) {
    padding:15px 0;
    align-items: center;
  }
  .reusecore__input {
    width: 100%;
  }
  label {
    font-size: 16px;
    margin-left:-10px;
    @media only screen and (max-width: 575px) {
      font-size: 12px;
      margin-left:0;
    }
  }
  .field-wrapper {
    //border:solid;
    border-color:red;
    margin:15px auto 25px;
    width:100%;
    @media only screen and (max-width: 575px) {
      margin:7.5px auto 15px;
    }
    input {
      //border:solid;
      border-color:yellow;
      background-color: #eff3f7;
      border: 0;
      font-family: DM Sans;
      font-size: 16px;
      min-height: 60px;
      @media only screen and (max-width: 575px) {
        font-size: 14px;
        min-height: 50px;
      }
      padding: 0 24px;
      ::placeholder {
        color: ${rgba('#02073E', 0.4)};
        opacity: 1; /* Firefox */
      }
      &:focus {
        border-color: #ff825c;
      }

      @media only screen and (max-width: 575px) {
        min-height: 50px;
      }
    }
  }
  button {
    align-self:center;
    background-color: #ff825c;
    min-width: 150px;

    @media only screen and (max-width: 768px) {
      margin-top:30px;
    }
    @media only screen and (max-width: 575px) {
      min-width: 100px;
      margin-top:10px;
    }
  }
  .reusecore__checkbox {
    align-self:center;
    margin-top: 10px;
    .reusecore__field-label {
      cursor: pointer;
      color: ${rgba('#9095ad', 0.9)};
      font-weight: 400;
      font-size: 14px;
    }
    .checkbox + div {
      background-color: #eff3f7;
      border: 0;
      &::after {
        top: 2px;
      }
    }
  }
`;

export default SectionWrapper;
