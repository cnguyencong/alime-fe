import {
  Button,
  Menu,
  MenuDivider,
  Popover,
  Position,
} from "@blueprintjs/core";

import { useState } from "react";
import { StoreType } from "polotno/model/store";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { useTranscriptLang } from "../../../functions/hooks/useTranscriptLang";
import LanguageItem from "../../common/LanguageItem";

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
          <LanguageItem
            languages={selectedTranscripts}
            selectedLang={language}
            onClick={setLanguage}
          />

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
      <Button icon="trash" intent="none" />
    </Popover>
  );
};
