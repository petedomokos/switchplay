import React from 'react';
import AddNewComment from './addNew/AddNewComment';
import '../../style/components/templates/comments-template.css';
function CommentsTemplate({ comments }) {
  return (
    <div className='comment-wrapper'>
      <div className='comments'>
        {comments.map((comment, index) => (
          <div className='comment-box' key={index}>
            {comment}
          </div>
        ))}
      </div>
      <AddNewComment />
    </div>
  );
}

CommentsTemplate.defaultProps = {
  comments:[]
}

export default CommentsTemplate;
