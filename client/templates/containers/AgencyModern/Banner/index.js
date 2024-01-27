import React from 'react';
import Container from '../../../common/components/UI/ContainerTwo';

import Text from '../../../common/components/Text';

//import NextImage from '../../../common/components/NextImage';
import Button from '../../../common/components/Button';
import Heading from '../../../common/components/Heading';
import Input from '../../../common/components/Input';
import BannerWrapper, {
  BannerContent,
  Subscribe,
  SponsoredBy,
  ImageGroup,
} from './banner.style';

//import paypal from '../../../common/assets/image/agencyModern/paypal.png';
//import google from '../../../common/assets/image/agencyModern/google.png';
//import dropbox from '../../../common/assets/image/agencyModern/dropbox.png';

const paypal = "";
const google = "";
const dropbox = "";

// &amp; 

const Banner = () => {
  return (
    <BannerWrapper id="home">
      <Container>
        <BannerContent>
          <Heading
            as="h1"
            content="The development tool that puts people first"
          />
          <Text
            className="banner-caption"
            content="Great football development comes down to relationships, growth, learning, communication & details."
          />
          <Text
            className="banner-caption"
            content="Switchplay helps you to embed these at your academy in your own way to achieve your vision."
          />
          <Subscribe>
            <Input
              inputType="email"
              placeholder="Enter Email Address"
              iconPosition="left"
              aria-label="email"
            />
            <Button title="Get A Demo" type="submit" />
          </Subscribe>
        </BannerContent>
      </Container>
    </BannerWrapper>
  );
};

export default Banner;

/*
<BannerWrapper id="home">
      <Container>
        <BannerContent>

          <SponsoredBy>
            <Text className="sponsoredBy" content="Sponsored by:" />
            <ImageGroup>
              <NextImage src={paypal} alt="Paypal" />
              <NextImage src={google} alt="Google" />
              <NextImage src={dropbox} alt="Dropbox" />
            </ImageGroup>
          </SponsoredBy>
        </BannerContent>
      </Container>
    </BannerWrapper>
    */
