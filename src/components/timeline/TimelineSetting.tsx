import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";

import { useLangStore } from "../../shared/zustand/language";
import LanguageItem from "../common/LanguageItem";
import { useTranscriptLang } from "../../functions/hooks/useTranscriptLang";

const TimelineSetting = () => {
  const currentLang = useLangStore((state) => state.selectedLang);
  const setCurrentLang = useLangStore((state) => state.setLang);
  const selectedTranscripts = useTranscriptLang(window.store);

  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Settings" />
          <MenuItem icon="globe" text="Subtitle">
            <LanguageItem
              languages={selectedTranscripts}
              selectedLang={currentLang}
              onClick={setCurrentLang}
            />
          </MenuItem>
        </Menu>
      }
      position={Position.TOP_LEFT}
    >
      <Button icon="cog" intent="primary" />
    </Popover>
  );
};

export default TimelineSetting;
