import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';

import '../../style/components/sections.css';
import '../../style/components/stats.css';

function Stats({ stats }) {
  const title = 'Stats';
  const placeholder = 'Add stat';
  return (
    <div className='stats-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content'>
          {stats.map((stat, index) => (
            <div key={index}></div>
          ))}
        </div>
      </div>
      <AddNewTemplate placeholder={placeholder} />
    </div>
  );
}

Stats.defaultProps = {
  stats:[]
}

export default Stats;
