import React from "react";

import { setTranslations } from "polotno/config";
import Topbar from "./components/topbar/top-bar";

import fr from "./translations/fr.json";
import en from "./translations/en.json";
import id from "./translations/id.json";
import ru from "./translations/ru.json";
import ptBr from "./translations/pt-br.json";
import zhCh from "./translations/zh-ch.json";
import { useProject } from "./utils/project";
import { observer } from "mobx-react-lite";
import { StoreType } from "polotno/model/store";
import { useHeight } from "./hooks/use-height";
import { loadFile } from "./utils/file";
import { Spinner } from "@blueprintjs/core";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";
import { Toolbar } from "polotno/toolbar/toolbar";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel, DEFAULT_SECTIONS } from "polotno/side-panel";
import { TimelineControl } from "./components/timeline/TimelineControl";

// load default translations
setTranslations(en);

type Props = Readonly<{
  store: StoreType;
}>;

const App = observer(({ store }: Props) => {
  const project = useProject();
  const height = useHeight();

  React.useEffect(() => {
    if (project.language.startsWith("fr")) {
      setTranslations(fr, { validate: true });
    } else if (project.language.startsWith("id")) {
      setTranslations(id, { validate: true });
    } else if (project.language.startsWith("ru")) {
      setTranslations(ru, { validate: true });
    } else if (project.language.startsWith("pt")) {
      setTranslations(ptBr, { validate: true });
    } else if (project.language.startsWith("zh")) {
      setTranslations(zhCh, { validate: true });
    } else {
      setTranslations(en, { validate: true });
    }
  }, [project.language]);

  React.useEffect(() => {
    project.firstLoad();
  }, [project]);

  const handleDrop = (ev: React.DragEvent) => {
    // Prevent default behavior (Prevent file from being opened)
    ev.preventDefault();

    // skip the case if we dropped DOM element from side panel
    // in that case Safari will have more data in "items"
    if (ev.dataTransfer?.files.length !== ev.dataTransfer?.items.length) {
      return;
    }
    // Use DataTransfer interface to access the file(s)
    if (!ev.dataTransfer?.files) return;
    for (let i = 0; i < ev.dataTransfer.files.length; i++) {
      loadFile(ev.dataTransfer.files[i], store);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: height + "px",
        display: "flex",
        flexDirection: "column",
      }}
      onDrop={handleDrop}
    >
      <Topbar store={store} />
      <div style={{ height: "calc(100% - 50px)" }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={DEFAULT_SECTIONS} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar store={store} />
            <Workspace
              components={{ PageControls: () => null }}
              renderOnlyActivePage
              store={store}
            />
            <ZoomButtons store={store} />
            <TimelineControl store={store} />
          </WorkspaceWrap>
        </PolotnoContainer>
      </div>
      {project.status === "loading" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
            }}
          >
            <Spinner />
          </div>
        </div>
      )}
    </div>
  );
});

export default App;
