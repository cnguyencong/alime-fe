import { createRoot } from "react-dom/client";
import "./themes/index.css";
import App from "./App.tsx";
import { unstable_setAnimationsEnabled } from "polotno/config";
import createStore, { StoreType } from "polotno/model/store";
import createProject, { Project, ProjectContext } from "./utils/project.ts";
import { ErrorBoundary } from "react-error-boundary";

declare global {
  interface Window {
    store: StoreType;
    project: Project;
  }
}

unstable_setAnimationsEnabled(true);

const store = createStore({ key: "nFA5H9elEytDyPyvKL7T", showCredit: true });
window.store = store;
store.addPage();

const project = createProject({ store });
window.project = project;

const root = createRoot(document.getElementById("root")!);

function Fallback() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ textAlign: "center", paddingTop: "40px" }}>
        <p>Something went wrong in the app.</p>
        <p>Try to reload the page.</p>
        <p>If it does not work, clear cache and reload.</p>
        <button
          onClick={async () => {
            await project.clear();
            window.location.reload();
          }}
        >
          Clear cache and reload
        </button>
      </div>
    </div>
  );
}

root.render(
  <ErrorBoundary
    FallbackComponent={Fallback}
    onReset={(details) => {
      console.log(details);
      // Reset the state of your app so the error doesn't happen again
    }}
    onError={(e) => {
      if (window.Sentry) {
        window.Sentry.captureException(e);
      }
    }}
  >
    <ProjectContext.Provider value={project}>
      {/* <App store={store} /> */}
      <App />
    </ProjectContext.Provider>
  </ErrorBoundary>
);
