import React, { useState } from 'react';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

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
} from './requestDemo.style';

//@todo - move into separate file
function validateInput(state){ return state; }

const RequestDemo = ({ heading, text, buttonLabel, componentsData, onSubmit, onClose }) => {
  const [state, setState] = useState({ name:"", email:"", phone:"", club:"", noPromotionsChecked:false })
  const { inputs, submitButton, checkbox } = componentsData;
  const submit = () => {
    if(validateInput(state).error){
      //@todo - error dialogue
    }else{
      onSubmit(state);
      //@todo
      //- give saving... info message
      //- toast when server returns, then close form
    }
  }

  const onChange = (key, value) => setState(prevState => ({ ...prevState, [key]: value }))
  const toggleCheckbox = () => setState(prevState => ({ ...prevState, noPromotionsChecked:!prevState.noPromotionsChecked }))

  return (
    <SectionWrapper>
      <div className="close-form" onClick={onClose}>
        <IconButton aria-label="Close" style={{ width:"100%", height:"100%" }} >
          <CloseIcon fontSize="large" />
        </IconButton>
      </div>
      <FooterInner>
        <Content>
          <Heading as="h3" content={heading} />
          <Text content={text} />
        </Content>
        <SubscriptionForm>
          {inputs.map((input,i) =>
            <Input
              key={`demo-form-${input.key}`}
              label={input.label}
              inputType={input.key}
              placeholder={input.placeholder}
              iconPosition="left"
              aria-label={input.key}
              value={state[input.key]}
              onChange={value => onChange(input.key, value)}
            />
          )}
          <Button title={submitButton.label} type="submit" onClick={submit} />
          {checkbox && <CheckBox
            id="remember"
            htmlFor="remember"
            isChecked={state.noPromotionsChecked}
            onToggle={toggleCheckbox}
            labelText={checkbox.label}
          />}
        </SubscriptionForm>
      </FooterInner>
    </SectionWrapper>
  );
};

RequestDemo.defaultProps = {
  componentsData:{}
}

export default RequestDemo;