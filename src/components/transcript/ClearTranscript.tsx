import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";

import { useState } from "react";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { useTranscriptLang } from "../../functions/hooks/useTranscriptLang";
import { getLangByCode } from "../../shared/utils/common";

export const ClearTranscript = ({ store }: { store: StoreType }) => {
  const [language, setLanguage] = useState("en");
  const selectedTranscripts = useTranscriptLang(store);

  const handleClearTranscript = () => {
    const transcriptId: string[] = [];
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (
          element.custom?.type === "transcript" &&
          element.custom?.lang === language
        ) {
          transcriptId.push(element.id);
        }
      });
    });

    store.deleteElements(transcriptId);
  };

  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Select language:" />
          {selectedTranscripts.map((code: string) => (
            <MenuItem
              key={code}
              icon={code === language ? "tick" : ""}
              text={getLangByCode(code)?.name ?? ""}
              onClick={() => setLanguage(code)}
              shouldDismissPopover={false}
            />
          ))}

          <Button
            fill
            intent="primary"
            onClick={async () => handleClearTranscript()}
            style={{ marginTop: "1rem" }}
          >
            Clear
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button icon="trash" text={`Clear`} intent="none" />
    </Popover>
  );
};
