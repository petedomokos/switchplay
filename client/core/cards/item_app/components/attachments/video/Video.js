import React from 'react';
import VideoTemplate from '../../templates/VideoTemplate';
import CommentTemplate from '../../templates/CommentTemplate';

 const Video = ({ item }) => {
  return (
    <>
      {item.map((video, index) => (
        <div key={index}>
          <VideoTemplate url={video.url} />
          <div className='comment-aligner'>
            <CommentTemplate msg={video.comments} />
          </div>
        </div>
      ))}
    </>
  );
};
export default Video