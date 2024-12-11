import { observer } from "mobx-react-lite";
import { SectionTab } from "polotno/side-panel";
import { Shapes } from "polotno/side-panel/elements-panel";
import { FaShapes } from "react-icons/fa";
import { t } from "polotno/utils/l10n";
import React from "react";
import { TAny } from "../../types/common";

export const ShapesPanel = ({ store }: { store: TAny }) => {
  return <Shapes store={store} />;
};

const ShapesSection = {
  name: "shapes",
  Tab: observer((props: React.ComponentProps<TAny>) => (
    <SectionTab {...props} name={t("sidePanel.shapes")}>
      <FaShapes />
    </SectionTab>
  )),
  // we need observer to update component automatically on any store changes
  Panel: ShapesPanel,
};

export default ShapesSection;