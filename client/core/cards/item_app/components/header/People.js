import React from 'react'
import batt from '../../utils/profilePictures/batt.jpg';
import sadler from '../../utils/profilePictures/sadler.jpg';
import '../../style/components/header/people.css';

const People = ({ screen }) => {
  return (
    <div className='profile-picture-wrapper'>
      <img src={batt} alt="Batt's Profile" 
          className={`profile-picture first ${screen.isSmall ? "first-sm-down" : "first-md-up"} `} />
      <img src={sadler} alt="Sadler's Profile" 
          className={`profile-picture second ${screen.isSmall ? "second-sm-down" : "second-md-up"} `} />
      <img src={sadler} alt="Sadler's Profile" 
          className={`profile-picture third ${screen.isSmall ? "third-sm-down" : "third-md-up"} `} />
    </div>
  );
};

People.defaultProps = {
  screen:{}
}
export default People;
