import React from "react";

import { setTranslations } from "polotno/config";

import fr from "./shared/translations/fr.json";
import en from "./shared/translations/en.json";
import id from "./shared/translations/id.json";
import ru from "./shared/translations/ru.json";
import ptBr from "./shared/translations/pt-br.json";
import zhCh from "./shared/translations/zh-ch.json";

import { useProject } from "./shared/utils/project";
import { observer } from "mobx-react-lite";
import { StoreType } from "polotno/model/store";
import { useHeight } from "./functions/hooks/use-height";
import { loadFile } from "./shared/utils/file";
import { Spinner } from "@blueprintjs/core";
import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from "polotno";
import { Workspace } from "polotno/canvas/workspace";
import { Toolbar } from "polotno/toolbar/toolbar";
import { ZoomButtons } from "polotno/toolbar/zoom-buttons";
import { SidePanel, DEFAULT_SECTIONS } from "polotno/side-panel";
import { TimelineControl } from "./components/timeline/TimelineControl";
import { TranscriptTab } from "./components/transcript/TranscriptTab";
import { DownloadButton } from "./components/topbar/download-button";

// load default translations
setTranslations(en);

type Props = Readonly<{
  store: StoreType;
}>;

const sections = [...DEFAULT_SECTIONS, TranscriptTab].filter(
  (section) => section.name !== "layers"
);

const App = observer(({ store }: Props) => {
  console.log(store.toJSON());
  const project = useProject();
  const height = useHeight();

  React.useEffect(() => {
    const workspaceContainer = document.querySelector(
      ".polotno-workspace-container"
    );
    if (workspaceContainer) {
      const width = workspaceContainer.clientWidth;
      const height = workspaceContainer.clientHeight;
      store.setSize(width, height, true);
    }
  }, []);

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
      <div style={{ height: "calc(100% - 50px)" }}>
        <PolotnoContainer className="polotno-app-container">
          <SidePanelWrap>
            <SidePanel store={store} sections={sections} />
          </SidePanelWrap>
          <WorkspaceWrap>
            <Toolbar
              store={store}
              components={{
                ActionControls: DownloadButton,
                PageDuration: () => null,
              }}
            />
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
