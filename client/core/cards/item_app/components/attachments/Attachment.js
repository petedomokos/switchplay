import React from 'react';
import CommentsTemplate from '../templates/CommentsTemplate';

import Video from './video/Video.js';
import Chart from './chart/Chart';
import Image from './image/Image.js';
import File from './file/File';

import '../../style/components/attachments.css';

function Attachment({ attachment }) {
  return (
    <div className='attachment-wrapper'>
      <div className='attachment'>
        {attachment.type === "video" && <Video video={attachment} />}
        {attachment.type === "chart" && <Chart chart={attachment} />}
        {attachment.type === "image" && <Image image={attachment} />}
        {attachment.type === "file" && <File file={attachment} />}
      </div>
      <div className='comments-aligner'>
        <CommentsTemplate comments={attachment.comments} />
      </div>
    </div>
  );
}

Attachment.defaultProps = {
  attachment:{}
}

export default Attachment;
