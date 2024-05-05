import React from 'react';
import '../../../style/components/attachments/attachment-item.css';
import ChartTemplate from '../../templates/ChartTemplate';

const Chart = ({ chart }) => {
  return (
    <ChartTemplate url={chart.url} />
  );
};
export default Chart;
