import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import '../../style/components/templates/stepsItemTemplate.css';
import CheckedIcon from '../utils/CheckedIcon';
import UncheckedIcon from '../utils/UncheckedIcon';

function StepsItemTemplate({ value, status }) {
  const isChecked = status === 'done';

  return (
    <div className='steps-item-template'>
      <div className='checkbox'>
        {isChecked ? ( // Render Checkbox with defaultChecked if status is 'done'
          <Checkbox value='checkedA' inputProps={{ 'aria-label': 'Checkbox A' }} icon={<UncheckedIcon />} checkedIcon={<CheckedIcon />} defaultChecked />
        ) : (
          <Checkbox value='checkedA' inputProps={{ 'aria-label': 'Checkbox A' }} icon={<UncheckedIcon />} checkedIcon={<CheckedIcon />} />
        )}{' '}
      </div>
      {value}
    </div>
  );
}

export default StepsItemTemplate;
