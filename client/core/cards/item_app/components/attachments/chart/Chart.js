import React from 'react';
import '../../../style/components/attachments/attachment-item.css';
import ChartTemplate from '../../templates/ChartTemplate';
import CommentTemplate from '../../templates/CommentTemplate';

const Chart = ({ item }) => {
  return (
    <>
      {item.map((chart, index) => (
        <div key={index}>
          <ChartTemplate url={chart.url} />
          <div className='comment-aligner'>
            <CommentTemplate msg={chart.comments} />
          </div>
        </div>
      ))}
    </>
  );
};
export default Chart;
