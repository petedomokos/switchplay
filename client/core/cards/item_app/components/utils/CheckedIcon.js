import React from 'react';
import '../../style/utils/steps-icon.css';

function CheckedIcon({ customerLogoUrl }) {
  return (
    <div className='checked-icon'>
      {customerLogoUrl ? 
        <img className='icon-image' src={customerLogoUrl} alt=''></img>
        :
        <div></div>
      }
    </div>
  );
}

export default CheckedIcon;
