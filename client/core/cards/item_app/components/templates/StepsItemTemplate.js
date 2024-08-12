import React, { useRef, useState, useCallback } from 'react';
import { Input } from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import '../../style/components/templates/stepsItemTemplate.css';
import CheckedIcon from '../utils/CheckedIcon';
import UncheckedIcon from '../utils/UncheckedIcon';

import '../../style/components/item-app.css';

function StepsItemTemplate({ step, logo, update, beingEdited }) {
  const [properties, setProperties] = useState(step);
  const { title, status } = properties;

  const onClickCheckbox = e => {
    setProperties(prevState => ({ 
      ...prevState, 
      status:prevState.status === "complete" ? "todo" : "complete"
    }))
    update({ ...properties, status:status === "complete" ? "todo" : "complete" })
  }

  const onChangeText = e => {
    setProperties(prevState => ({ ...prevState, title:e.target.value }));
    update({ ...properties, title:e.target.value });
  }

  return (
    <div className='steps-item-template' >
      <div className='checkbox'>
        <Checkbox 
          onClick={onClickCheckbox}
          checked={status === "complete"}
          value='checkedA' 
          inputProps={{ 'aria-label': 'Checkbox A' }} 
          icon={<UncheckedIcon  />} 
          checkedIcon={<CheckedIcon customerLogoUrl={logo?.url} />} 
        />
      </div>
      <Input
            id="desc" onChange={onChangeText} margin="dense" autoFocus
            className={`item-input ${beingEdited ? "item-input-editing" : ""}`}
            disableUnderline value={title} placeholder="Type here..."
            style={{ border: "none", marginBottom:"0px", marginTop:"5px" }}
      />
    </div>
  );
}

export default StepsItemTemplate;