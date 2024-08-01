import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/steps.css';

function Steps({ steps, logo }) {
  const title = 'Steps';
  const placeholder = 'Add step';
  return (
    <div className='steps-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content' >
          {steps.map(step => 
            <StepsItemTemplate key={step.id} value={step.title} status={step.status} logo={logo} />
          )}
        </div>
      </div>
      <AddNewTemplate placeholder={placeholder} />
    </div>
  );
}

Steps.defaultProps = {
  steps:[]
}

export default Steps;

/*
<TitleTemplate title={title} />
        <div className='section-child-content'>
          {steps.map(({ title, status, id }) => (
            <StepsItemTemplate key={id} value={title} status={status} logo={logo} />
          ))}
        </div>
        */
