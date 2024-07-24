import React from 'react';
import '../../style/components/header/path-title.css'
function PathTitle({ sectionTitle, cardTitle }) {
  return <div className='path-title'>{cardTitle} - {sectionTitle}</div>;
}

export default PathTitle;
