import React from 'react';
import { mockItem } from '../../data/mockData';
import TitleTemplate from '../templates/TitleTemplate';
import AddNewAttachmentTemplate from '../templates/addNew/AddNewAttachmentTemplate';

import Video from './video/Video.js';
import Chart from './chart/Chart';
import Image from './image/Image.js';
import File from './file/File';


import '../../style/components/attachments.css';
import '../../style/components/items.css';
import '../../style/components/attachments/content-item.css';
import '../../style/components/attachments/attachment-item.css';

function Attachments() {
  const attachments = mockItem.item1.attachments;

  const title = 'Attachments';
  const filePlaceholder = 'Add new attachment';



  return (
    <div className='attachment-wrapper'>
      <div className='item-wrapper'>
        <TitleTemplate title={title} />
        <div className='child-content attachment-items'>
          <Video item={attachments.video} />
          <Chart item={attachments.chart} />
          <Image item={attachments.image} />
          <File item={attachments.file} />
        </div>
        <AddNewAttachmentTemplate placeholder={filePlaceholder} />
      </div>
    </div>
  );
}

export default Attachments;
