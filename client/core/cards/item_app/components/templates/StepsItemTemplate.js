import React from 'react';
import Checkbox from '@material-ui/core/Checkbox';
import '../../style/components/templates/stepsItemTemplate.css';
import CheckedIcon from '../utils/CheckedIcon';
import UncheckedIcon from '../utils/UncheckedIcon';

function StepsItemTemplate({ value, status, logo }) {
  return (
    <div className='steps-item-template'>
      <div className='checkbox'>
        {status === "complete" ?
          <Checkbox value='checkedA' inputProps={{ 'aria-label': 'Checkbox A' }} icon={<UncheckedIcon />} checkedIcon={<CheckedIcon customerLogoUrl={logo?.url} />} defaultChecked />
        :
          <Checkbox value='checkedA' inputProps={{ 'aria-label': 'Checkbox A' }} icon={<UncheckedIcon />} checkedIcon={<CheckedIcon customerLogoUrl={logo?.url} />} />
        }
      </div>
      {value}
    </div>
  );
}

export default StepsItemTemplate;
