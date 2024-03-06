import React from 'react';

import Container from '../../../common/components/UI/ContainerTwo';
import CheckBox from '../../../common/components/Checkbox';
import Heading from '../../../common/components/Heading';
import Button from '../../../common/components/Button';
import Input from '../../../common/components/Input';
import Text from '../../../common/components/Text';

import SectionWrapper, {
  FooterInner,
  Content,
  SubscriptionForm,
} from './subscribe.style';

const bg1 = { src:"website/bgs/cta/1.png" }
const bg2 = { src:"website/bgs/cta/2.png" }
const bg3 = { src:"website/bgs/cta/3.png" }
const bg4 = { src:"website/bgs/cta/4.png" }
const bg5 = { src:"website/bgs/cta/5.png" }

const Subscribe = ({ heading, text, buttonLabel }) => {
  return (
    <SectionWrapper>
      <Container>
        <FooterInner>
          <Content>
            <Heading as="h3" content={heading} />
            <Text content={text} />
          </Content>
          <SubscriptionForm>
            <div>
              <Input
                inputType="email"
                placeholder="Enter Email Address"
                iconPosition="left"
                aria-label="email"
              />
              <Button title={buttonLabel} type="submit" />
            </div>
            <CheckBox
              id="remember"
              htmlFor="remember"
              labelText="Don’t provide any promotional message."
            />
          </SubscriptionForm>
        </FooterInner>
      </Container>
      {/*
      ((<img src={bg1?.src} alt="bg1" className="illustration bg1" />
      <img src={bg2?.src} alt="bg2" className="illustration bg2" />
      <img src={bg3?.src} alt="bg3" className="illustration bg3" />
      <img src={bg4?.src} alt="bg4" className="illustration bg4" />
      <img src={bg5?.src} alt="bg5" className="illustration bg5" />
      */}
    </SectionWrapper>
  );
};

export default Subscribe;
