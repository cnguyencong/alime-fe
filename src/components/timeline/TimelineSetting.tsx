import {
  Button,
  Menu,
  MenuDivider,
  MenuItem,
  Popover,
  Position,
} from "@blueprintjs/core";

import { useLangStore } from "../../shared/zustand/language";
import { TAny } from "../../shared/types/common";
import { LocaleConfig } from "../../shared/constants/locale";

const TimelineSetting = () => {
  const currentLang = useLangStore((state: TAny) => state.selectedLang);
  const setCurrentLang = useLangStore((state: TAny) => state.setLang);

  return (
    <Popover
      content={
        <Menu>
          <MenuDivider title="Settings" />
          <MenuItem icon="globe" text="Language">
            {LocaleConfig.map((locale: TAny) => (
              <MenuItem
                key={locale.code}
                icon={locale.code === currentLang ? "tick" : ""}
                text={locale.name}
                onClick={() => setCurrentLang(locale.code)}
              />
            ))}
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
