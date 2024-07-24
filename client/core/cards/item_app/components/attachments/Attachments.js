import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';
import Attachment from './Attachment';

import '../../style/components/attachments.css';
import '../../style/components/sections.css';
import '../../style/components/attachments/attachment-item.css';

function Attachments({ attachments }) {
  const title = 'Attachments';
  const addLabel = 'Add attachment';

  return (
    <div className='attachments-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className="section-child-content attachments-list">
          {attachments.map(att => 
            <Attachment key={`att-${att.key}`} attachment={att} />
          )}
        </div>
      </div>
      <AddNewTemplate placeholder={addLabel} />
    </div>
  );
}

export default Attachments;
