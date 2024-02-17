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

import { grey10 } from "../../../../core/cards/constants"
import SVGImage from "../../../../core/SVGImage";
import { MAIN_BANNER_MARGIN_VERT } from "../../../../core/websiteConstants";
import CompatibilityInfo from '../../../../core/CompatibilityInfo';

//import paypal from '../../../common/assets/image/agencyModern/paypal.png';
//import google from '../../../common/assets/image/agencyModern/google.png';
//import dropbox from '../../../common/assets/image/agencyModern/dropbox.png';

const paypal = "";
const google = "";
const dropbox = "";

// &amp; 

const largeImageInfo = {
  url:"website/heroImg.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-60, 
  imgTransY:0
}

const smallImageInfo = {
  url:"website/heroImg.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-60, 
  imgTransY:0,
  aspectRatio:0.85
}

//old...Great football development comes down to relationships, communication, learning & growth,( & details?)
const Banner = ({screen}) => {
  //aspect ratio changes for large image depending on screen
  const largeImgDimns = { 
    width: screen.width * 0.45, 
    height: screen.height - 2 * MAIN_BANNER_MARGIN_VERT[screen.size]
  }
  const requiredLargeAspectRatio = largeImgDimns.height / largeImgDimns.width;
  const largeImgTransform = `translate(${-200 + 0.1 * screen.width},${0}) scale(${0.65})`;

  const { url, imgWidth, imgHeight, imgTransX=0, imgTransY=0 } = largeImageInfo;

  const smallImage = smallImageInfo;
  const largeImage = { ...largeImageInfo, aspectRatio:requiredLargeAspectRatio }



  return (
    <BannerWrapper id="home">
        <BannerContent>
            <div className="heading">
              <Heading
                as="h1"
                className="md-up"
                content="The tool"
              />
              <Heading
                as="h1"
                className="md-up"
                content="that puts"
              />
              <Heading
                as="h1"
                className="md-up in-bold"
                content="people first"
              />
              <Heading
                as="h1"
                className="sm-down-land"
                content="The tool that puts people first"
              />
              <Heading
                as="h1"
                className="sm-down-port"
                content="The tool that puts"
              />
              <Heading
                as="h1"
                className="sm-down-port in-bold"
                content="people first"
              />
            </div>
            <Text
              className="banner-caption md-up"
              content="Get your players thinking and acting like pros. Manage all your team's communication and information in one place. Use data with confidence and purpose."
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
            <CompatibilityInfo screen={screen} className="md-up"/>
        </BannerContent>
        <div className="banner-image-area">
          <SVGImage 
            className="md-up"
            image={largeImage}
            imgKey="main-lg"
          />
          <SVGImage 
            className="sm-down"
            image={smallImage}
            imgKey="main-sm"
          />
        </div>
        <div className="banner-caption-area-sm sm-down">
          <Text
            className="banner-caption banner-caption-1"
            content="Get your players thinking and acting like pros."
          />
          <Text
            className="banner-caption banner-caption-2"
            content="Manage all your team's communication and information in one place."
          />
          <Text
            className="banner-caption banner-caption-3"
            content="Use data with confidence and purpose."
          />
        </div>
        <CompatibilityInfo screen={screen} className="sm-down"/>
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
