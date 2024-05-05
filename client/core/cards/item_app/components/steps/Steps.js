import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/steps.css';

function Steps({ steps }) {
  const title = 'Steps';
  const placeholder = 'Add step';
  return (
    <div className='steps-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content'>
          {steps.map(({ title, status, id }) => (
            <StepsItemTemplate key={id} value={title} status={status} />
          ))}
        </div>
        <AddNewTemplate placeholder={placeholder} />
      </div>
    </div>
  );
}

Steps.defaultProps = {
  steps:[]
}

export default Steps;
