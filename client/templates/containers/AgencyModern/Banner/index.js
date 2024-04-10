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

import { styles, /*showDemoForm*/ } from "../../../../core/websiteHelpers";
const { lgUp, mdDown, mdOnly, smOnly, xsDownLand, xsDownPort } = styles;


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

const Banner = ({ screen, showDemoForm }) => {
  const contentsHeight = screen.orientation === "portrait" ? 550 : d3.max([550, screen.height - 2 * NAVBAR_HEIGHT - 2 * MAIN_BANNER_MARGIN_VERT[screen.size] ]);

  return (
    <BannerWrapper id="home">
        <BannerContent>
            <div className="heading">
              <Heading
                as="h1"
                content="Tell the story"
                style={lgUp(screen)}
              />
              <Heading
                as="h1"
                content="of the numbers"
                style={lgUp(screen)}
              />
              <Heading
                as="h1"
                content="Tell the story of the numbers"
                style={mdOnly(screen)}
              />
              <Heading
                as="h1"
                content="Tell the story of the numbers"
                style={smOnly(screen)}
              />
              <Heading
                as="h1"
                content="Tell the story of the numbers"
                style={xsDownLand(screen)}
              />
              <Heading
                as="h1"
                content="Tell the story"
                style={xsDownPort(screen)}
              />
              <Heading
                as="h1"
                content="of the numbers"
                style={xsDownPort(screen)}
              />
            </div>
            <div className={`banner-caption-area`}>
              <Text
                className="banner-caption banner-caption-line-1"
                content="Discover the true power of your data by turning it into a compelling story for your players."
              />
              <Text
                className="banner-caption banner-caption-line-2"
                content="Show them how it relates to their path, their progress, and their future."
              />
            </div>
            <Button title="Get A Demo" type="submit" style={{ width:"140px" }} onClick={() => showDemoForm()} />
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
