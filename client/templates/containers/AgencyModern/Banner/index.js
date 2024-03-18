import React from 'react';
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
import { MAIN_BANNER_MARGIN_VERT, NAVBAR_HEIGHT } from "../../../../core/websiteConstants";

import { styles } from "../../../../core/websiteHelpers";
const { mdUp, smDown, smDownLand, smDownPort } = styles;


//import paypal from '../../../common/assets/image/agencyModern/paypal.png';
//import google from '../../../common/assets/image/agencyModern/google.png';
//import dropbox from '../../../common/assets/image/agencyModern/dropbox.png';

const paypal = "";
const google = "";
const dropbox = "";

// &amp; 

const largeImage = {
  url:"website/heroImg.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-60, 
  imgTransY:0
}

const smallImage = {
  url:"website/heroImg.png",
  rawImgWidth:800,//actual whole is 1100, 
  rawImgHeight:200, 
  imgTransX:-60, 
  imgTransY:0,
  aspectRatio:0.85
}

/*
 - decide how to handle two differnt styles fro the Subscribe components -. can we just use different classnames for each component?
 - but the ways its done doesnt allow for that -> could we pass props into the stylesheet? eg button belo, widths of bg div etc
 -or abstract the functional elements of the Subscribe component ?
 - in Subscribe component, make bg and width and height props too,
 or at least allow a 'minimal' setting which simply displays the 
 input and button, 
 - also allow a hideInput prop, which puts the button over the input, therby reducing teh height
 even more, and onclick, it slides down to reveal input(s)

 - also allow a phonenumber input too


*/
const Banner = ({ screen, requestDemo, showForm }) => {

  return (
    <BannerWrapper id="home">
        <BannerContent>
            <div className="heading">
              <Heading
                as="h1"
                className="md-up"
                content="The tool"
                style={mdUp(screen)}
              />
              <Heading
                as="h1"
                className="md-up"
                content="that puts"
                style={mdUp(screen)}
              />
              <Heading
                as="h1"
                className="md-up highlighted"
                content="people first"
                style={mdUp(screen)}
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
            <Button title="Get A Demo" type="submit" style={{ width:"140px" }} onClick={showForm} />
        </BannerContent>
        <div className="banner-image-area">
          <SVGImage 
            className="md-up"
            image={largeImage}
            imgKey="main-lg"
            styles={{ root: mdUp(screen) }}
          />
          <SVGImage 
            className="sm-down"
            image={smallImage}
            imgKey="main-sm"
            styles={{ root: smDown(screen) }}
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
