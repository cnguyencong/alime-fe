import { Tag } from "@blueprintjs/core";
import { formatTime } from "../../../shared/utils/common";
import { TAny } from "../../../shared/types/common";

export const TranscriptTime = ({ transcript }: TAny) => {
  return (
    <div>
      <Tag round={true}>{formatTime(transcript?.custom?.start)}</Tag>-
      <Tag round={true}>{formatTime(transcript?.custom?.end)}</Tag>
    </div>
  );
};
