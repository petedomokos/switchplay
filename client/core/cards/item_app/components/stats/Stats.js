import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import AddNewAttachmentTemplate from '../templates/addNew/AddNewAttachmentTemplate';
import { mockItem } from '../../data/mockData';
import '../../style/components/attachments/content-item.css';
import '../../style/components/items.css';
import '../../style/components/stats.css';

function Stats() {
  const stats = mockItem.item1.stats;

  const title = 'Stats';
  const placeholder = 'Add new Stats';
  return (
    <div className='stats-wrapper'>
      <div className='item-wrapper'>
        <TitleTemplate title={title} />
        <div className='child-content'>
          {stats.map((stat, index) => (
            <div key={index}>{stat.statInfo}</div>
          ))}
        </div>
      </div>
      <AddNewAttachmentTemplate placeholder={placeholder} />
    </div>
  );
}

export default Stats;
