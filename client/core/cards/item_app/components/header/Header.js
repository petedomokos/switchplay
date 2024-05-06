import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import '../../style/components/header/header.css';
import '../../style/components/header/mail.css';
import PathTitle from './PathTitle';
import People from './People';
import { PeopleAlt } from '@material-ui/icons';
// import ImageColorAnalyzer from '../../utils/colorExtractor/ImageColorAnalyzer';
// import TeamLogo from '../../utils/images/charlton@3x.png'
function Header({ screen, cardTitle, sectionTitle, people, close }) {
  const ArrowBack = () => {
    return (
      <div>
        <ArrowBackIcon />
      </div>
    );
  };

  return (
    <div className='header-wrapper'>
      <div className='back-arrow' onClick={close}>
        <ArrowBack />
      </div>
      {/* <ImageColorAnalyzer imageUrl={TeamLogo} /> */}
      <div className='header-item path'>
        <PathTitle sectionTitle={sectionTitle} cardTitle={cardTitle} />
      </div>
      <div className='header-item people'>
        <People people={people} screen={screen} />
      </div>
      <div className='header-item inbox'>
        <MailOutlineIcon style={{ height: '100%', width: '100%' }} className='mail' />
      </div>
    </div>
  );
}

export default Header;
