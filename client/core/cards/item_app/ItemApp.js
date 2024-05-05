import React, { useState, useEffect } from 'react';
import { Input } from '@material-ui/core';
import Header from './components/header/Header';
import Stats from './components/stats/Stats';
import Steps from './components/steps/Steps';
import Attachments from './components/attachments/Attachments';

import './index.css';
import './style/components/app.css';

function ItemApp({ screen, item, cardTitle, save, close }) {
  console.log("ItemApp", item)
  const [value, setValue] = useState(item)
  const [editing, setEditing] = useState(false);
  const [applyChangesToAllDecks, setApplyChangesToAllDecks] = useState(false);
  const handleChange = event => { 
    event.stopPropagation();
    const newTitle = event.target.value;
    setValue(prevState => ({ ...prevState, title:newTitle })) 
    save(newTitle, applyChangesToAllDecks)
  }

  const onClickForm = e => {
    e.stopPropagation();
    if(!editing) { setEditing(true); }
  }

  const onClickBg = e => {
    e.stopPropagation();
    if(editing) { setEditing(false); }
  }

  return (
    <div className="item-container" onClick={onClickBg} >
      <div className="item-contents">
        <form className="item-form" onClick={onClickForm}>
          <Input
            id="desc" onChange={handleChange} margin="dense" autoFocus 
            className={`item-input ${editing ? "item-input-editing" : ""}`}
            disableUnderline defaultValue={value.title} placeholder="Enter Title..."
          />
        </form>
        <div className='stats-steps-outer-wrapper'>
          <Stats stats={item.stats} />
          <Steps steps={item.steps} />
        </div>
        <div className='attachments-outer-wrapper'>
          <Attachments attachments={item.attachments} />
        </div>
      </div>
      <Header 
          screen={screen} 
          cardTitle={cardTitle} 
          sectionTitle={item.section.title || `Section ${item.section.nr}`} 
          close={close}
      />
    </div>
  );
}

export default ItemApp;
