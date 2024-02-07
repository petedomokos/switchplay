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

//import paypal from '../../../common/assets/image/agencyModern/paypal.png';
//import google from '../../../common/assets/image/agencyModern/google.png';
//import dropbox from '../../../common/assets/image/agencyModern/dropbox.png';

const paypal = "";
const google = "";
const dropbox = "";

const compatibleItemSt = { margin:"5px 5px 10px", width:"110px", fontSize:"14px", color:grey10(5) }
// &amp; 

const mainImgInfo = {
  url:"website/heroImg.png",
  imgWidth:900, 
  imgHeight:900, 
  imgTransX:0, 
  imgTransY:0
}

//old...Great football development comes down to relationships, communication, learning & growth,( & details?)
const Banner = ({screen}) => {
  const { url, imgWidth, imgHeight, imgTransX=0, imgTransY=0 } = mainImgInfo;
  const requiredImgAspectRatio = 0.7;
  const requiredImgWidth = screen.width * (screen.orientation === "landscape" ?  0.4 : 0.8);
  const requiredImgDimns = { width: requiredImgWidth, height: requiredImgWidth * requiredImgAspectRatio };
  const imgScale = requiredImgWidth / imgWidth;
  const imgTransform = `translate(${imgTransX},${imgTransY}) scale(${imgScale})`;

  //md-down
  //next - remove all styleing and start again - it shouldnt be this hard!

  return (
    <BannerWrapper id="home">
      <Container>
        <BannerContent>
          <div className="md-down main-img-small">
            <SVGImage image={{ url, transform:imgTransform }} dimns={requiredImgDimns}
                    styles={{ borderColour:"#f0ded5" }} imgKey="main-ss"/>
          </div>
          <Heading
            as="h1"
            className="md-up"
            content="The development tool that puts people first"
          />
          <Heading
            as="h1"
            className="sm-down-land"
            content="The development tool that puts people first"
          />
          <Heading
            as="h1"
            className="sm-down-port"
            content="The development tool that"
          />
          <Heading
            as="h1"
            className="sm-down-port"
            content="puts people first"
          />
          <Text
            className="banner-caption"
            content="Get your players thinking and acting like pros. Manage your whole team's communication and information in one place. Use data effectively."
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
        <div className="compatible-items-area">
          <div style={{ height:"30px", fontSize:"16px", color:grey10(8) }}>Works well with</div>
          <div className="compatible-items-list">
            <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap" }}>
              <span style={compatibleItemSt}>Kitman Labs</span>
              <span style={compatibleItemSt}>Hudl</span>
              <span style={compatibleItemSt}>Session Planner</span>
              <span style={compatibleItemSt}>PDF</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-around", flexWrap:"wrap" }}>
              <span style={compatibleItemSt}>Excel</span>
              <span style={compatibleItemSt}>Word</span>
              <span style={compatibleItemSt}>GDrive</span>
              <span style={compatibleItemSt}>SQL</span>
            </div>
          </div>
        </div>
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
