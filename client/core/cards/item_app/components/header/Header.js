import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import '../../style/components/header/header.css';
import '../../style/components/header/mail.css';
import PathTitle from './PathTitle';
import People from './People';
// import ImageColorAnalyzer from '../../utils/colorExtractor/ImageColorAnalyzer';
// import TeamLogo from '../../utils/images/charlton@3x.png'
function Header() {
  const ArrowBack = () => {
    return (
      <div>
        <ArrowBackIcon />
      </div>
    );
  };

  return (
    <div className='header-wrapper'>
      <div className='back-arrow'>
        <ArrowBack />
      </div>
      {/* <ImageColorAnalyzer imageUrl={TeamLogo} /> */}
      <div className='header-item path'>
        <PathTitle />
      </div>
      <div className=' header-item people'>
        <People />
      </div>
      <div className=' header-item inbox'>
        <MailOutlineIcon style={{ height: '100%', width: '100%' }} className='mail' />
      </div>
    </div>
  );
}

export default Header;
