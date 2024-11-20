import { useEffect } from 'react';
import CanvasNest from 'canvas-nest.js';

export const useCanvasNest = () => {
  useEffect(() => {
    const config = {
      color: '205,164,95', // 香槟金 #CDA45F
      pointColor: '218,165,32', // 金色 #DAA520
      count: 120,
      opacity: 0.9,
      zIndex: 0,
      dist: 1000,
    };

    const cn = new CanvasNest(document.body, config);

    return () => {
      cn.destroy();
    };
  }, []);
};
