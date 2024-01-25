import React, { Fragment } from 'react';

import Sticky from 'react-stickynode';
import { ThemeProvider } from 'styled-components';
import { theme } from '../templates/common/theme/agencyModern';
import ResetCSS from '../templates/common/assets/css/style';
import {
  GlobalStyle,
  ContentWrapper,
} from '../templates/containers/AgencyModern/agencyModern.style';
import { DrawerProvider } from '../templates/common/contexts/DrawerContext';
import Navbar from '../templates/containers/AgencyModern/Navbar';
import Banner from '../templates/containers/AgencyModern/Banner';
import Services from '../templates/containers/AgencyModern/Services';
import Features from '../templates/containers/AgencyModern/Features';
import WorkHard from '../templates/containers/AgencyModern/WorkHard';
import UltimateFeature from '../templates/containers/AgencyModern/UltimateFeature';
import Customer from '../templates/containers/AgencyModern/Customer';
import News from '../templates/containers/AgencyModern/News';
import Subscribe from '../templates/containers/AgencyModern/Subscribe';
import Footer from '../templates/containers/AgencyModern/Footer';
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  homePageRoot: {
      width:"100%",
      border:"solid",
      background:"#FF825C"

  }
}))

const HomePage = ({ }) =>{
  const styleProps = { };
  const classes = useStyles(styleProps) 
  return (
    <div className={classes.homePageRoot}>
      <ThemeProvider theme={theme}>
        <Fragment>
          <ResetCSS />
          <GlobalStyle />
          <ContentWrapper>
            <Sticky top={0} innerZ={9999} activeClass="sticky-nav-active">
                <DrawerProvider>
                <Navbar />
                </DrawerProvider>
            </Sticky>
            <Banner/>
            <Services />
            <Features />
            <WorkHard />
            <UltimateFeature />
            <Customer />
            <News />
            <Subscribe />
            <Footer />
          </ContentWrapper>
        </Fragment>
      </ThemeProvider>
    </div>

  )
}
  
export default HomePage
