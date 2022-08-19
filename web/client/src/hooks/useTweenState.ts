import { useState } from "react";

const lerp = (initial: number, goal: number, progress: number) =>
  initial + progress * (goal - initial);

const quadraticEase = (initial: number, goal: number, progress: number) =>
  initial + progress * progress * (goal - initial);

const useTweenState = (
  value: number,
  config?: { duration?: number; transitionName?: "lerp" | "quadraticEase" }
) => {
  const [state, setState] = useState(value);
  const [tweenedState, setTweenedState] = useState(value);

  let startTime: number | null = null;

  const { duration = 1000, transitionName = "lerp" } = config ?? {};

  const transition = transitionName === "lerp" ? lerp : quadraticEase;

  const _step =
    (initialState: number, goalState: number) => (timestamp: number) => {
      if (startTime === null) 
        startTime = timestamp;

      const t = timestamp - startTime;
      const progress = t / duration;

      setTweenedState(transition(initialState, goalState, progress));

      if (t <= duration) {
        window.requestAnimationFrame(_step(initialState, goalState));
      } else {
        startTime = null;
        setTweenedState(goalState);
      }
    };

  const tween = (newState: any) => {
    window.requestAnimationFrame(_step(state, newState));

    setState(newState);
  };

  return [tweenedState, tween] as [number, (newState: number) => void];
};

export default useTweenState;
