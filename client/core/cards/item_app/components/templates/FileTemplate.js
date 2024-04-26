import React from 'react';
import DescriptionIcon from '@material-ui/icons/Description';
import '../../style/components/attachments/file-item.css';

function FileTemplate({ name, extension, url }) {
  return (
    <div className=' text-underline'>
      <DescriptionIcon style={{ height: '3%', width: '3%' }} />
      {name}.{extension}
    </div>
  );
}

export default FileTemplate;
