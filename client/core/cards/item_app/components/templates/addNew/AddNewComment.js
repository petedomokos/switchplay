import React, { useState } from 'react';
import '../../../style/components/templates/addNew/add-new-comment.css';
import SendIcon from '@material-ui/icons/Send';

function AddNewComment() {
   const [text, setText] = useState('');

   const handleChange = e => {
     setText(e.target.value);
     e.target.style.height = '25px';
     e.target.style.height = `${Math.min(e.target.scrollHeight, 60)}px`;
   };

  return (
    <div className='comment'>
      <textarea className='comment-input' value={text} onChange={handleChange}></textarea>
      <button className='send-comment'>
        <SendIcon />
      </button>
    </div>
  );
}

export default AddNewComment;
