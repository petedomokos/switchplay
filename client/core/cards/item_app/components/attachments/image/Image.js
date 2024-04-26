import React from 'react';
import '../../../style/components/attachments/attachment-item.css';
import ImageTemplate from '../../templates/ImageTemplate';
import CommentTemplate from '../../templates/CommentTemplate';

const Image = ({ item }) => {
  return (
    <>
      {item.map((image, index) => {
        return (
          <div className='attachment-item-wrapper' key={index}>
            <ImageTemplate src={image.url} />
            <div className='comment-aligner'>
              <CommentTemplate msg={image.comments} />
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Image;
