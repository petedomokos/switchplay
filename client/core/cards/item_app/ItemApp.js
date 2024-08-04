import React, { useState, useEffect } from 'react';
import { Input } from '@material-ui/core';
import Header from './components/header/Header';
import Stats from './components/stats/Stats';
import Steps from './components/steps/Steps';
import Attachments from './components/attachments/Attachments';

import './item-index.css';
import './style/components/item-app.css';

/*const initSteps = [
  { pos:0, id:"step-a", title:"step 1 - This is a long step to test how it wraps on deifferent devices. Lets have a look at it.", status:"complete" },
  { pos: 1, id:"step-b", title:"step 2 - This is a medium step to test how ", status:"In Progress" },
  { pos: 2, id:"step-c", title:"step 3 - a short step", status:"Todo" }
]*/

function ItemApp({ screen, item, cardTitle, save, close, logo }) {
  const [properties, setProperties] = useState(item);
  const { steps, stats, attachments, people, section } = properties;
  //console.log("Item steps", steps)
  const updateSteps = steps => {
    console.log("updateSteps", steps)
    setProperties(prevState => ({ ...prevState, steps })) 
    save({ ...properties, steps }, false)
  }
  const [editing, setEditing] = useState(false);
  const [applyChangesToAllDecks, setApplyChangesToAllDecks] = useState(false);
  const handleChange = event => { 
    event.stopPropagation();
    const newTitle = event.target.value;
    setProperties(prevState => ({ ...prevState, title:newTitle })) 
    save({ ...properties, title: newTitle }, applyChangesToAllDecks, ["title"])
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
            disableUnderline defaultValue={properties.title} placeholder="Enter Title..."
          />
        </form>
        <div className='stats-steps-outer-wrapper'>
          <Stats stats={stats} screen={screen} />
          <Steps steps={steps} logo={logo} updateSteps={updateSteps} />
        </div>
        <div className='attachments-outer-wrapper'>
          <Attachments attachments={attachments} />
        </div>
      </div>
      <Header 
          screen={screen} 
          cardTitle={cardTitle} 
          sectionTitle={section.title || `Section ${section.nr}`} 
          people={people}
          close={close}
      />
    </div>
  );
}

export default ItemApp;
