import React from 'react';
import '../../style/components/templates/video-template.css';

function VideoTemplate({ url }) {
  return (
    <iframe
      className='video-iframe'
      src={url}
      title='YouTube video player'
      frameBorder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen></iframe>
  );
}

export default VideoTemplate;
