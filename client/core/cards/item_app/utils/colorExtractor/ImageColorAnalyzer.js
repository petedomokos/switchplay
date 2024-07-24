import React, { useState } from 'react';
import { ColorExtractor } from 'react-color-extractor';

const ImageColorAnalyzer = ({ imageUrl }) => {
  const [colors, setColors] = useState([]);

  const renderSwatches = () => {
    return colors.map((color, id) => {
      return (
        <div
          key={id}
          style={{
            backgroundColor: color,
            width: 100,
            height: 100,
          }}
        />
      );
    });
  };

  const getColors = colors => {
    setColors([...colors]);
  };

  return (
    <div>
      <ColorExtractor getColors={getColors}>
        <img src={imageUrl} style={{ width: 700, height: 500 }} alt='Input' />
      </ColorExtractor>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'center',
        }}>
        {renderSwatches()}
      </div>
    </div>
  );
};

export default ImageColorAnalyzer;
