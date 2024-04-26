import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import StepsItemTemplate from '../templates/StepsItemTemplate';
import AddNewAttachmentTemplate from '../templates/addNew/AddNewAttachmentTemplate';

import { mockItem } from '../../data/mockData';

import '../../style/components/attachments/content-item.css';
import '../../style/components/items.css';
import '../../style/components/steps.css';
function Steps() {
  const steps = mockItem.item1.steps;
  const title = 'Steps';
  const placeholder = 'Add your next step';
  return (
    <div className='steps-wrapper'>
      <div className='item-wrapper'>
        <TitleTemplate title={title} />
        <div className='child-content'>
          {steps.map(({ title, status, id }) => (
            <StepsItemTemplate key={id} value={title} status={status} />
          ))}
        </div>
        <AddNewAttachmentTemplate placeholder={placeholder} />
      </div>
    </div>
  );
}

export default Steps;
