import React from 'react';
import chart from '../../utils/charts/bar-chart.png';

import '../../style/components/templates/image-template.css';

function ChartTemplate({ url }) {
  return(
    <div className="image-template">
      <img className="image-template-img" src={chart}></img>
    </div>

  )
}

export default ChartTemplate;
