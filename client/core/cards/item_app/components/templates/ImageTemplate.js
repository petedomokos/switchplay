import React from 'react';
import draw from '../../utils/images/drawing.png';
import '../../style/components/templates/image-template.css';

function ImageTemplate({ src }) {
  return (
    <div className="image-template">
      <img className="image-template-img" src={draw}></img>
    </div>
  )
}

export default ImageTemplate;
