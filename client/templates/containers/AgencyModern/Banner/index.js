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

//old...Great football development comes down to relationships, communication, learning & growth,( & details?)
const Banner = () => {
  return (
    <BannerWrapper id="home">
      <Container>
        <BannerContent>
          <Heading
            as="h1"
            className="md-up"
            content="The development tool that puts people first"
          />
          <Heading
            as="h1"
            className="sm-down"
            content="The development tool that"
          />
          <Heading
            as="h1"
            className="sm-down"
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
        <div className="md-down" style ={{ width: "90%", height:"380px", /*border:"solid",*/ margin:"auto" }}>
          <div style={{ /*border:'solid'*/ width: "260px", height: "280px", 
                  display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", margin:"auto" }}>
            <img src="website/heroImg.png" 
              style={{ transform:"translate(0px, 20px) scale(0.9)", transformOrigin: "center" }} />
          </div>
        </div>
        <div style={{ }}>
          <div style={{ height:"30px", fontSize:"16px" }}>Works well with</div>
          <div style={{ width:"90%", maxWidth:"900px", margin:"auto", display:"flex", justifyContent:"space-around", flexWrap:"wrap",
              fontSize:"14px", color:"grey" }}>
            <span style={{ margin:"5px 5px 10px", minWidth:"90px", textAlign:"center" }}>Kitman Labs</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>Hudl</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"120px", textAlign:"center" }}>Session Planner</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>Excel</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>Word</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>PDF</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>GDrive</span>
            <span style={{ margin:"5px 5px 10px", minWidth:"60px", textAlign:"center" }}>Databases</span>
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
