import styled, { css } from "styled-components";

export const TranscriptListContainer = styled.div`
  max-height: calc(100dvh - 160px);
  overflow: auto;
`;

export const TranscriptContainer = styled.div<{ $activeBg?: string }>`
  margin-bottom: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  border-radius: 5px;
  background-color: ${(props) => props.$activeBg || "#f0f0f0"};
`;

export const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TextContainer = styled.div<{ $warning?: boolean }>`
  position relative;
  margin-top: .5rem;
  ${(props) =>
    props.$warning &&
    css`
      border: 2px solid #fbb360;
    `};

    .bp5-popover-target {
      display: block !important;
    }
`;
