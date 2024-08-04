import React from 'react';
import '../../../style/components/templates/addNew/add-new-attachment-template.css';

function AddNewTemplate({ placeholder, onClick }) {
  return <div className='new-attachment ' onClick={onClick}>{placeholder}</div>;
}

export default AddNewTemplate;
