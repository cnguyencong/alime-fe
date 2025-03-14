import styled from "styled-components";

export const TimelineContainer = styled.div`
  position: relative;
  width: 100%;
  background: #f5f5f5;
  border: 1px solid #ddd;
`;

const TimelineRowWrapperHeight = 200; // Set Height of timeline

export const TimelineRowWrapper = styled.div`
  position: relative;
  width: 100%;
  height: ${TimelineRowWrapperHeight}px;
  overflow-x: auto;
  overflow-y: auto;
  user-select: none;
`;

export const TimelineIndicator = styled.div`
  position: absolute;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #ff3333;
  pointer-events: auto;
  z-index: 2;
`;

export const IndicatorHandle = styled.div`
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ff3333;
  border-radius: 50%;
  top: 50%;
  left: -5px;
  transform: translateY(-50%);
  cursor: ew-resize;

  &:hover {
    transform: translateY(-50%) scale(1.2);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }
`;
