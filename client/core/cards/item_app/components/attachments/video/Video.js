import React from 'react';
import VideoTemplate from '../../templates/VideoTemplate';

 const Video = ({ video }) => {
  return (
    <VideoTemplate url={video.url} />
  );
};
export default Video