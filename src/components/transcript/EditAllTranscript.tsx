import {
  Button,
  Menu,
  MenuDivider,
  Popover,
  Position,
} from "@blueprintjs/core";
import styled from "styled-components";
import { useState } from "react";
import { useStoreElements } from "../../functions/hooks/useStoreElements";
import { StoreType } from "polotno/model/store";

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 5px;
  margin-bottom: 10px;
`;

const EditAllTranscript = ({ store }: { store: StoreType }) => {
  const [fontSize, setFontsize] = useState<number>(30);
  const [color, setColor] = useState<string>("white");
  const [isLoadingAll, setIsLoadingAll] = useState<boolean>(false);

  const updateAllData = () => {
    setIsLoadingAll(true);
    const transcriptEls = useStoreElements(store).filter(
      (e) => e.custom?.type === "transcript"
    );
    transcriptEls.forEach((e) => {
      e.set({
        fontSize,
        fill: color,
      });
    });

    setIsLoadingAll(false);
  };

  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Edit all transcript" />
          <InputGroup>
            <label htmlFor="end">Font size (pixels)</label>
            <input
              value={fontSize}
              className="bp5-input"
              type="number"
              dir="auto"
              id="end"
              onChange={(e) => setFontsize(+e.target.value)}
            />
          </InputGroup>
          <InputGroup>
            <label htmlFor="end">Color</label>
            <input
              value={color}
              className="bp5-input"
              type="color"
              dir="auto"
              id="end"
              onChange={(e) => setColor(e.target.value)}
            />
          </InputGroup>
          <Button
            fill
            intent="primary"
            style={{ marginTop: "1rem" }}
            onClick={updateAllData}
            loading={isLoadingAll}
          >
            Apply
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button icon="edit" intent="none" />
    </Popover>
  );
};

export default EditAllTranscript;
