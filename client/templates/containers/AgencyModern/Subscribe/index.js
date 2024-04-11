import React, { useState } from 'react';

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

const Subscribe = ({ heading, text, buttonLabel, componentsData, onSubmit }) => {
  const [email, setEmail] = useState("")
  const [isChecked, setIsChecked] = useState(false);
  const { inputs, submitButton, checkbox } = componentsData;

  const toggleCheckbox = () => setIsChecked(prevState => !prevState)
  const submit = () => {
    onSubmit({ email, isChecked });
  }
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
              {inputs.map((input,i) =>
                <Input
                  inputType="email"
                  placeholder={input.placeholder}
                  iconPosition="left"
                  aria-label="email"
                  value={email}
                  onChange={setEmail}
                />
              )}
              <Button title={submitButton.label} type="submit" onClick={submit} />
            </div>
            {/**checkbox && <CheckBox
              id="remember"
              htmlFor="remember"
              isChecked={isChecked}
              onToggle={toggleCheckbox}
              labelText={checkbox.label}
            />*/}
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

Subscribe.defaultProps = {
  componentsData:{}
}

export default Subscribe;