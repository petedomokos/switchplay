import React from 'react';
import Header from './components/header/Header';
import Stats from './components/stats/Stats';
import Steps from './components/steps/Steps';
import Attachments from './components/attachments/Attachments';

import './index.css';
import './style/components/app.css';
import './style/components/attachments.css';

function ItemApp() {
  return (
    <div className="item-container">
      <div className='item-contents'>
        <div className='stats-steps-wrapper'>
          <Stats />
          <Steps />
        </div>
        <div className='attachment'>
          <Attachments />
        </div>
      </div>
      <Header />
    </div>
  );
}

export default ItemApp;
