import { Button } from "@blueprintjs/core";
import styled from "styled-components";
import { formatTime, getLangByCode } from "../../shared/utils/common";
import TimelineSetting from "./TimelineSetting";
import { useLangStore } from "../../shared/zustand/language";
import { TAny } from "../../shared/types/common";
import { useVideoStore } from "../../shared/zustand/video";

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PlayerTime = styled(FlexContainer)`
  justify-content: center;
  color: white;
  margin-left: 5px;
`;

const TimelineHeaderContainer = styled(FlexContainer)`
  gap: 5px;
  justify-content: space-between;
`;

interface TimelineHeaderProps {
  currentTime: number;
  maxTime: number;
}

const TimelineHeader = ({ currentTime, maxTime }: TimelineHeaderProps) => {
  const currentLang = useLangStore((state) => state.selectedLang);
  const play = useVideoStore((state) => state.play);
  const stop = useVideoStore((state) => state.stop);
  const isPlaying = useVideoStore((state) => state.isPlaying);

  return (
    <TimelineHeaderContainer>
      <FlexContainer>
        <Button
          icon={isPlaying ? "pause" : "play"}
          onClick={() => (isPlaying ? stop() : play())}
          intent={isPlaying ? "danger" : "success"}
          text={isPlaying ? "Pause" : "Play"}
        />
        <PlayerTime>
          <span>{formatTime(currentTime)}</span>
          <span>/</span>
          <span>{formatTime(maxTime / 1000)}</span>
        </PlayerTime>
        <TimelineSetting />
        <span style={{ color: "white" }}>
          {getLangByCode(currentLang)?.name}
        </span>
      </FlexContainer>
    </TimelineHeaderContainer>
  );
};

export default TimelineHeader;
