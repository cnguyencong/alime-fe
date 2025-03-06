import { useEffect, useRef, useState } from "react";
import { TAny } from "../../shared/types/common";
import { useTransitions } from "../../shared/zustand/transitions";
import "./effects-css/effects.css";

const AnimationWrapper = ({ store, xPadding, yPadding }: TAny) => {
  const [effect, setEffect] = useState<string | undefined>();
  const { segmentTransitions, isPlaying } = useTransitions();
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]); // Store timeout IDs

  useEffect(() => {
    // Clear timeouts on component unmount or effect change
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
          setEffect("fade");
        }, segmentTransition.time);
        timeoutsRef.current.push(timeoutId);

        // Clear effect's class after 1s
        const clearId = setTimeout(() => {
          setEffect(undefined);
        }, segmentTransition.time + 1000);
        timeoutsRef.current.push(clearId);
      }
    });
  }, [segmentTransitions, isPlaying]);

  return (
    <div
      className={`animation-wrapper ${effect ? effect : ""}`}
      style={{
        width: store.width * store.scale,
        height: store.height * store.scale,
        position: "absolute",
        top: yPadding + "px",
        left: xPadding + "px",
        pointerEvents: "none",
        background: "white",
        opacity: 0,
      }}
    />
  );
};

export default AnimationWrapper;
