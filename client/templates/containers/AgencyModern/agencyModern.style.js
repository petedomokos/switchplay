import styled, { createGlobalStyle } from 'styled-components';
import { MAIN_BANNER_MARGIN_VERT, COLOURS } from '../../../core/websiteConstants';

export const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'DM Sans', sans-serif;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: 'DM Sans', sans-serif;
    margin-top: 0;
  }
  p{
    font-family: 'DM Sans', sans-serif;
  }

  section {
    position: relative;
  }
  
  img {
    max-width: 100%;
  }
`;


//next - the navbar shouldnt have the margin applied to it as its needed for the menu itself too - move the marign shift up, or use display justify-content flex0end
//i thought i did this anyway

export const ContentWrapper = styled.div`
  /*overflow: hidden; removed else menu on other pages is hidden as dimns not set somewhere?*/
  .menuLeft {
    margin-left: 105px;
  }
  .menuRight {
    margin-left: auto;
  }

  .sticky-nav-active {
    .agencyModern-navbar {
      background-color: ${COLOURS.banner.bg};
      box-shadow: 0px 3px 8px 0px rgba(43, 83, 135, 0.08);
    }
  }
`;
