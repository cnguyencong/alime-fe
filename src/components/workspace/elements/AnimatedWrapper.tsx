import { useEffect, useRef, useState } from "react";
import { useTransitions } from "../../../shared/zustand/transition";
import "./effects-css/fade.css";

export const AnimatedWrapper = ({
  children,
}: {
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
      if (!!segmentTransition.time) {
        const timeoutId = setTimeout(() => {
          setEffect("fade-in");
        }, segmentTransition.time);
        timeoutsRef.current.push(timeoutId);

        const clearId = setTimeout(() => {
          setEffect(undefined);
        }, segmentTransition.time + 1000);
        timeoutsRef.current.push(clearId);
      }
    });
  }, [segmentTransitions, isPlaying]);

  return <div className={effect}>{children}</div>;
};
