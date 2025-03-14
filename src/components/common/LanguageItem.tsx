import { MenuItem } from "@blueprintjs/core";
import { getLangByCode } from "../../shared/utils/common";

interface LanguageItemProps {
  languages: string[];
  selectedLang: string;
  onClick: (code: string) => void;
}
const LanguageItem: React.FC<LanguageItemProps> = ({
  languages,
  selectedLang,
  onClick,
}) => {
  return languages.map((code: string) => {
    const isSelected = code === selectedLang;
    if (isSelected) {
      return (
        <MenuItem
          key={code}
          icon={"tick"}
          text={getLangByCode(code)?.name ?? ""}
          onClick={() => onClick(code)}
          shouldDismissPopover={false}
        />
      );
    }

    return (
      <MenuItem
        key={code}
        text={getLangByCode(code)?.name ?? ""}
        onClick={() => onClick(code)}
        shouldDismissPopover={false}
      />
    );
  });
};

export default LanguageItem;
