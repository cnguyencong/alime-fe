import { SectionTab } from "polotno/side-panel";
import { observer } from "mobx-react-lite";
import { Tag, TextArea, Button } from "@blueprintjs/core";
import { FaTrash, FaRegListAlt } from "react-icons/fa";
export const TranscriptTab = {
  name: "transcript-panel",
  Tab: (props: any) => (
    <SectionTab name="Transcript" {...props}>
      <FaRegListAlt />
    </SectionTab>
  ),
  // we need observer to update component automatically on any store changes
  Panel: observer(({ store }: any) => {
    const transcriptElements = store.custom?.transcriptElements ?? [];
    return (
      <div>
        <h3>Transcript-based editing</h3>
        <div style={{ maxHeight: "calc(100dvh - 100px)", overflow: "auto" }}>
          {transcriptElements.map((transcript: any, index: number) => (
            <div
              key={index}
              style={{
                marginBottom: "10px",
                border: "1px solid #e0e0e0",
                padding: "10px",
                borderRadius: "5px",
                backgroundColor: "#f0f0f0",
              }}
            >
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "15px",
                }}
              >
                <div>
                  <span>Speaker:</span>
                  &nbsp;
                  <Tag round={true}>{transcript.custom?.start.toFixed(2)}s</Tag>
                  -<Tag round={true}>{transcript.custom?.end.toFixed(2)}s</Tag>
                </div>
                <div>
                  <Button minimal={true} icon={<FaTrash />} />
                </div>
              </div>
              <div>
                <TextArea style={{ width: "100%" }} value={transcript.text} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }),
};
