import React from 'react';
import Container from '../../../common/components/UI/ContainerTwo';
import Heading from '../../../common/components/Heading';
import NextImage from '../../../common/components/NextImage';
import Link from '../../../common/components/Link';
import Text from '../../../common/components/Text';

import FooterWrapper, {
  FooterInner,
  CopyrightInfo,
  FooterWidget,
  Nav,
} from './footer.style';
import LogoImage from '../../../common/assets/image/agencyModern/logo.png';

import data from '../../../common/data/AgencyModern';
//import { Fade } from 'react-awesome-reveal';

const Footer = () => {
  return (
    <FooterWrapper>
      <Container>
        <FooterInner>
          <CopyrightInfo>
              <div className="logo">
                <NextImage src={LogoImage} alt="Logo" height={40} />
              </div>
              <p>
                <Link href="#">Terms of use</Link> |{' '}
                <Link href="#">Privacy</Link>
              </p>
              <Text
                className="copyright"
                content="Copyright by 2019 Redq, Inc"
              />
          </CopyrightInfo>

          <FooterWidget>
              <Heading as="h4" content="About Us" />
              <Nav>
                {data.aboutUs.map((item) => (
                  <Link key={item.id} href="#">
                    {item.title}
                  </Link>
                ))}
              </Nav>
          </FooterWidget>

          <FooterWidget>
              <Heading as="h4" content="Our Information" />
              <Nav>
                {data.ourInformation.map((item) => (
                  <Link key={item.id} href="#">
                    {item.title}
                  </Link>
                ))}
              </Nav>
          </FooterWidget>

          <FooterWidget>
              <Heading as="h4" content="My Account" />
              <Nav>
                {data.myAccount.map((item) => (
                  <Link key={item.id} href="#">
                    {item.title}
                  </Link>
                ))}
              </Nav>
          </FooterWidget>

          <FooterWidget>
              <Heading as="h4" content="Connect" />
              <Nav>
                {data.social.map((item) => (
                  <Link key={item.id} href="#">
                    <img src={item?.icon?.src} alt="Facebook" />
                    {item.title}
                  </Link>
                ))}
              </Nav>
          </FooterWidget>
        </FooterInner>
      </Container>
    </FooterWrapper>
  );
};

export default Footer;
