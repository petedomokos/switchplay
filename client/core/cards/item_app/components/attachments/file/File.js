import React from 'react';
import FileTemplate from '../../templates/FileTemplate';
const File = ({ file }) => {
  return (
    <FileTemplate extension={file.extension} name={file.name} url={file.url} />
  );
};

export default File;
