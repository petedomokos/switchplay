import React from 'react';
import '../../../style/components/attachments/attachment-item.css';
import ImageTemplate from '../../templates/ImageTemplate';

const Image = ({ image }) => {
  return (
    <ImageTemplate src={image.url} />
  );
};

export default Image;
