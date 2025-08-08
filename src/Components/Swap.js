import React from 'react';
import SwipeableViews from 'react-swipeable-views';

const Swap = () => {
  return (
    <SwipeableViews enableMouseEvents>
      <div>
        <video src="1753448283700.mp4" controls />
      </div>
      <div>
        <video src="1753458681723.mp4" controls />
      </div>
    </SwipeableViews>
  );
};

export default Swap;