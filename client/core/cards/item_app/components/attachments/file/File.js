import React from 'react';
import FileTemplate from '../../templates/FileTemplate';
import '../../../style/components/attachments/attachment-item.css';
const File = ({ item }) => {
  console.log(item)
  return (
    <>
      {item.map((file, index) => {
        return (
          <div className='attachment-item-wrapper' key={index}>
            <FileTemplate extension={file.extension} name={file.name} url={file.url} />
          </div>
        );
      })}
    </>
  );
};

export default File;
