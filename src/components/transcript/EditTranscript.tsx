import {
  Button,
  Menu,
  MenuDivider,
  Popover,
  Position,
} from "@blueprintjs/core";
import styled from "styled-components";
import { TAny } from "../../shared/types/common";
import { useState } from "react";

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 10px;
`;

const EditTranscript = ({ transcript }: { transcript: TAny }) => {
  const [startTime, setStartTime] = useState<number>(
    transcript?.custom?.start ?? 0
  );
  const [endTime, setEndTime] = useState<number>(transcript?.custom?.end ?? 0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const udateTimeRange = () => {
    setIsLoading(true);
    transcript?.set({
      custom: {
        ...transcript.custom,
        start: startTime,
        end: endTime,
        startAt: startTime * 1000,
        endAt: endTime * 1000,
      },
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  };
  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Edit transcript" />
          <InputGroup>
            <label htmlFor="start">Start</label>
            <input
              value={startTime}
              id="start"
              className="bp5-input"
              type="number"
              placeholder="Text input"
              dir="auto"
              onChange={(e) => setStartTime(+e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <label htmlFor="end">End</label>
            <input
              value={endTime}
              className="bp5-input"
              type="number"
              placeholder="Text input"
              dir="auto"
              id="end"
              onChange={(e) => setEndTime(+e.target.value)}
            />
          </InputGroup>
          <Button
            fill
            intent="primary"
            style={{ marginTop: "1rem" }}
            onClick={udateTimeRange}
            loading={isLoading}
          >
            Save
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button icon="edit" intent="none" />
    </Popover>
  );
};

export default EditTranscript;
