import styled from "styled-components";

export const TimelineRow = styled.div`
  position: relative;
  height: 55px;
  border-bottom: 1px solid #ddd;

  &.selected {
    .timeline-item {
      outline: 4px solid #1265d9;
    }

    .action-layer {
      display: flex;
      gap: 10px;
      button {
        display: inline-block !important;
        width: auto !important;
      }
    }
  }
`;

export const ItemActionLayer = styled.div`
  position: absolute;
  z-index: 1;
  top: 50%;
  display: none;
  transform: translateY(-50%);

  button {
    min-height: 10px;
    border-radius: 10px;
  }
`;

export const Item = styled.div`
  position: absolute;
  height: 45px;
  top: 5px;
  background: #252a31;
  border-radius: 3px;
  cursor: move;
  user-select: none;
  color: white;
  font-size: 12px;
  padding: 1px;
  overflow: clip;

  &:hover {
    background: rgba(128, 128, 128, .4);
  }
}
`;

export const TrimHandleLeft = styled.div`
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  left: 0;
  cursor: w-resize;
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;

export const TrimHandleRight = styled.div`
  position: absolute;
  width: 8px;
  height: 100%;
  top: 0;
  right: 0;
  cursor: e-resize;
  background: rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
  }
`;
