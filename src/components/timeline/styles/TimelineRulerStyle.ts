import styled, { css } from "styled-components";

export const TimelineRulerContainer = styled.div`
  position: sticky;
  height: 40px;
  top: 0;
  left: 0;
  background: white;
  z-index: 10;
`;

export const RulerTick = styled.div<{
  $tickSize: "small" | "medium" | "large";
}>`
  position: absolute;
  bottom: 0;
  width: 1px;
  background-color: #333;

  ${(props) =>
    props.$tickSize === "small" &&
    css`
      height: 10px;
    `}
  ${(props) =>
    props.$tickSize === "medium" &&
    css`
      height: 15px;
    `}
  ${(props) =>
    props.$tickSize === "large" &&
    css`
      height: 20px;
    `}
`;

export const RulerLabel = styled.div`
  position: absolute;
  bottom: 20px;
  font-size: 12px;
  color: #333;
`;
