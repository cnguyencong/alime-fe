import { useEffect, useRef, useState } from "react";
import { useTransitions } from "../../../shared/zustand/transition";
import "./effects-css/fade.css";

export const ANIMATION_DURATION = 1000; //1s

export const AnimatedWrapper = ({
  children,
  width,
  height,
  currentTime,
}: {
  width: number;
  height: number;
  currentTime: number;
  children: React.ReactNode;
}) => {
  const [effect, setEffect] = useState<string | undefined>();
  const { segmentTransitions, isPlaying } = useTransitions();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!isPlaying) timeoutsRef.current.forEach(clearTimeout);
  }, [isPlaying]);

  useEffect(() => {
    if (!segmentTransitions.length || !isPlaying) return;

    segmentTransitions.forEach((segmentTransition) => {
      if (!segmentTransition.time) return;

      const startAnimationTime = segmentTransition.time - currentTime * 1000;

      if (startAnimationTime > 0) {
        const timeoutId = setTimeout(() => {
          setEffect("fade-in");
        }, startAnimationTime);
        timeoutsRef.current.push(timeoutId);

        const clearId = setTimeout(() => {
          setEffect(undefined);
        }, startAnimationTime + ANIMATION_DURATION);
        timeoutsRef.current.push(clearId);
      }
    });
  }, [segmentTransitions, isPlaying]);

  return (
    <div style={{ background: "white" }}>
      <div
        style={{ width: width + "px", height: height + "px" }}
        className={effect}
      >
        {children}
      </div>
    </div>
  );
};
