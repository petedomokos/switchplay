import React from 'react';
import teamLogo from '../../utils/images/charlton@3x.png';
import '../../style/utils/steps-icon.css';

function CheckedIcon() {
  return (
    <div className='checked-icon'>
      <img className='icon-image' src={teamLogo} alt='team logo'></img>
    </div>
  );
}

export default CheckedIcon;
