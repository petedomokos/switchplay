import React from 'react';
import AddNewComment from './addNew/AddNewComment';
import '../../style/components/templates/comment-template.css';
function CommentTemplate({ msg }) {
  return (
    <div className='comment-wrapper'>
      <div className='messages'>
        {msg.map((message, index) => (
          <div className='message-box' key={index}>
            {message}
          </div>
        ))}
      </div>
      <AddNewComment />
    </div>
  );
}

export default CommentTemplate;
