import React from 'react';
import TitleTemplate from '../templates/TitleTemplate';
import AddNewTemplate from '../templates/addNew/AddNewTemplate';
import StatsList from './StatsList';

import '../../style/components/sections.css';
import '../../style/components/stats.css';

function Stats({ stats, screen }) {
  const title = 'Stats';
  const placeholder = 'Add stat';
  return (
    <div className='stats-wrapper'>
      <div className='section-wrapper'>
        <TitleTemplate title={title} />
        <div className='section-child-content' ></div>
        
      </div>
      <AddNewTemplate placeholder={placeholder} />
    </div>
  );
}

Stats.defaultProps = {
  stats:[]
}

export default Stats;

/*

<TitleTemplate title={title} />
        <div className='section-child-content' >
          <StatsList statsData={stats} screen={screen} />
        </div>

        */
