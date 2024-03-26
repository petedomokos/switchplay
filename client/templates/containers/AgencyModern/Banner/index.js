import React from 'react';
import * as d3 from 'd3';
import Container from '../../../common/components/UI/ContainerTwo';

import Text from '../../../common/components/Text';

//import NextImage from '../../../common/components/NextImage';
import Button from '../../../common/components/Button';
import Heading from '../../../common/components/Heading';
import Input from '../../../common/components/Input';
import BannerWrapper, {
  BannerContent,
  //Subscribe,
  SponsoredBy,
  ImageGroup,
} from './banner.style';

import { grey10 } from "../../../../core/cards/constants"
import SVGImage from "../../../../core/SVGImage";
import CompatibilityInfo from '../../../../core/CompatibilityInfo';
import { MAIN_BANNER_MARGIN_VERT, NAVBAR_HEIGHT } from "../../../../core/websiteConstants";

import { styles, showDemoForm } from "../../../../core/websiteHelpers";
const { lgUp, mdDown, mdUp, smDown, smDownLand, smDownPort, mdOnly } = styles;


//import paypal from '../../../common/assets/image/agencyModern/paypal.png';
//import google from '../../../common/assets/image/agencyModern/google.png';
//import dropbox from '../../../common/assets/image/agencyModern/dropbox.png';

const paypal = "";
const google = "";
const dropbox = "";

// &amp; 

const largeImage = {
  url:"website/heroImg.png",
  rawImgWidth:941,//actual whole is 1100, 
  rawImgHeight:805, 
  imgTransX:0, 
  imgTransY:0
}

const Banner = ({ screen }) => {

  //console.log("screenwidth", screen.width)
  const contentsHeight = screen.orientation === "portrait" ? 550 : d3.max([550, screen.height - 2 * NAVBAR_HEIGHT - 2 * MAIN_BANNER_MARGIN_VERT[screen.size] ]);
  console.log("contentsH", contentsHeight)

  return (
    <BannerWrapper id="home">
        <BannerContent>
            <div className="heading">
              <Heading
                as="h1"
                className="md-up"
                content="The tool"
                style={lgUp(screen)}
              />
              <Heading
                as="h1"
                className="md-up"
                content="that puts"
                style={lgUp(screen)}
              />
              <Heading
                as="h1"
                className="md-up highlighted"
                content="people first"
                style={lgUp(screen)}
              />
              <Heading
                as="h1"
                content="The tool that puts"
                style={mdOnly(screen)}
              />
              <Heading
                as="h1"
                className="highlighted"
                content="people first"
                style={mdOnly(screen)}
              />
              <Heading
                as="h1"
                className="sm-down-land"
                content="The tool that puts people first"
                style={smDownLand(screen)}
              />
              <Heading
                as="h1"
                className="sm-down-port"
                content="The tool that puts"
                style={smDownPort(screen)}
              />
              <Heading
                as="h1"
                className="sm-down-port highlighted"
                content="people first"
                style={smDownPort(screen)}
              />
            </div>
            <Text
              className="banner-caption-md-up md-up"
              content="Get your players thinking and acting like pros. Manage all your team's communication and information in one place. Use data with confidence and purpose."
              style={mdUp(screen)}
            />
            <Button title="Get A Demo" type="submit" style={{ width:"140px" }} onClick={showDemoForm} />
        </BannerContent>
        <div className="banner-image-area">
          <SVGImage 
            className="md-up"
            image={{ ...largeImage, requiredHeight: contentsHeight }}
            imgKey="main-lg"
            contentFit="cover"
            centreHoriz={true}
            styles={{ root: lgUp(screen) }}
          />
          <SVGImage 
            image={{ ...largeImage }}
            imgKey="main-sm"
            contentFit="cover"
            styles={{ root: mdDown(screen) }}
          />
        </div>
        <div className="banner-caption-area-sm sm-down" style={smDown(screen)}>
          <Text
            className="banner-caption-sm banner-caption-sm-1"
            content="Get your players thinking and acting like pros."
          />
          <Text
            className="banner-caption-sm banner-caption-sm-2"
            content="Manage all your team's communication and information in one place."
          />
          <Text
            className="banner-caption-sm banner-caption-sm-3"
            content="Use data with confidence and purpose."
          />
        </div>
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
