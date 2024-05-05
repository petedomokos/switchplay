import React from 'react';
import '../../style/utils/steps-icon.css';

function CheckedIcon({ teamLogoUrl }) {
  return (
    <div className='checked-icon'>
      <img className='icon-image' src={teamLogoUrl} alt='team logo'></img>
    </div>
  );
}

export default CheckedIcon;
