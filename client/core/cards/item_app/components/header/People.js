import React from 'react'
import batt from '../../utils/profilePictures/batt.jpg';
import sadler from '../../utils/profilePictures/sadler.jpg';
import '../../style/components/header/people.css';

const People = () => {
  return (
    <div className='profile-picture-wrapper'>
      <img src={batt} alt="Batt's Profile" className='profile-picture first ' />
      <img src={sadler} alt="Sadler's Profile" className='profile-picture second ' />
      <img src={sadler} alt="Sadler's Profile" className='profile-picture third ' />
    </div>
  );
};
export default People;
