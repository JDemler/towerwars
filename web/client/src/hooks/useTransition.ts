import { useEffect } from 'react';
import GridCoordinate from "../lib/GridCoordinate";
import useTweenState from './useTweenState';

const useTransition = (
  startCoordinate: GridCoordinate,
  targetCoordinate: GridCoordinate,
  speed: number
) => {
  const [tweenedStateX, tweenX] = useTweenState(startCoordinate.x, { duration: 800, transitionName: 'lerp' });
  const [tweenedStateY, tweenY] = useTweenState(startCoordinate.y, { duration: 800, transitionName: 'lerp' });

  useEffect(() => {
    tweenX(targetCoordinate.x);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  } , [targetCoordinate.x]);
  
  useEffect(() => {
    tweenY(targetCoordinate.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  } , [targetCoordinate.y]);
  
  return new GridCoordinate(tweenedStateX, tweenedStateY);
};

export default useTransition;