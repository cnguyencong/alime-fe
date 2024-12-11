import { Button } from "@blueprintjs/core";
import styled from "styled-components";
import { formatTime } from "../../utils/common";

const PlayerTime = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  color: white;
`;

const TimelineHeaderContainer = styled.div`
  display: flex;
  gap: 5px;
`;

interface TimelineHeaderProps {
  isPlaying: boolean;
  currentTime: number;
  pixelsPerSecond: number;
  maxTime: number;
  handlePlayPause: () => void;
}

const TimelineHeader = ({
  isPlaying,
  currentTime,
  pixelsPerSecond,
  maxTime,
  handlePlayPause,
}: TimelineHeaderProps) => {
  return (
    <TimelineHeaderContainer>
      <Button
        icon={isPlaying ? "pause" : "play"}
        onClick={handlePlayPause}
        intent={isPlaying ? "danger" : "success"}
        text={isPlaying ? "Pause" : "Play"}
      />
      <PlayerTime>
        <span>{formatTime(currentTime / pixelsPerSecond)}</span>
        <span>/</span>
        <span>{formatTime(maxTime / pixelsPerSecond)}</span>
      </PlayerTime>
    </TimelineHeaderContainer>
  );
};

export default TimelineHeader;
