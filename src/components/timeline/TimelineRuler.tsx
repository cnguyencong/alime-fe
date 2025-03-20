import React from "react";
import {
  TimelineRulerContainer,
  RulerLabel,
  RulerTick,
} from "./styles/TimelineRulerStyle";
import { config } from "../../shared/constants";
import { formatTime } from "../../shared/utils/common";

interface TimelineRulerProps {
  duration: number; // in seconds
}

const TimelineRuler: React.FC<TimelineRulerProps> = ({ duration }) => {
  const ticks = [];

  for (let i = 0; i <= duration; i++) {
    let tickSize: "small" | "medium" | "large" = "small";

    if (i % 10 === 0) {
      tickSize = "large";
    } else if (i % 5 === 0) {
      tickSize = "medium";
    }

    ticks.push({
      time: i,
      tickSize,
      position: i * config.pixelsPerSecond,
    });
  }

  return (
    <TimelineRulerContainer>
      {ticks.map((tick) => (
        <React.Fragment key={tick.time}>
          <RulerTick
            $tickSize={tick.tickSize}
            style={{ left: `${tick.position}px` }}
          />
          {tick.tickSize === "large" && (
            <RulerLabel style={{ left: `${tick.position}px` }}>
              {formatTime(tick.time)}
            </RulerLabel>
          )}
        </React.Fragment>
      ))}
    </TimelineRulerContainer>
  );
};

export default TimelineRuler;
