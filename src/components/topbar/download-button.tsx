import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import {
  Button,
  Position,
  Menu,
  HTMLSelect,
  Slider,
  Popover,
  ProgressBar,
  MenuItem,
} from "@blueprintjs/core";
import JSZip from "jszip";
import { downloadFile } from "polotno/utils/download";
import * as unit from "polotno/utils/unit";
import { t } from "polotno/utils/l10n";
import { StoreType } from "polotno/model/store";
import { useTranscriptLang } from "../../functions/hooks/useTranscriptLang";
import { getLangByCode } from "../../shared/utils/common";
import { PageType } from "polotno/model/page-model";
import { ElementType } from "polotno/model/group-model";
import { TAny } from "../../shared/types/common";
import { TranscriptApi } from "../../shared/services/transcript.api";
import { config } from "../../shared/constants";
import { dataURLtoBlob } from "../../shared/utils/blob";

type Props = Readonly<{
  store: StoreType;
}>;

type MimeType = "image/png" | "image/jpeg" | undefined;

export const DownloadButton = observer(({ store }: Props) => {
  const [saving, setSaving] = React.useState(false);
  const [quality, setQuality] = React.useState(1);
  const [pageSizeModifier, setPageSizeModifier] = React.useState(1);
  const [fps, setFPS] = React.useState(10);
  const [type, setType] = React.useState("mp4");
  const [progress, setProgress] = React.useState(0);
  const [progressStatus, setProgressStatus] = React.useState("scheduled");
  const selectedTranscripts = useTranscriptLang(store);
  const [language, setLanguage] = useState("en");

  const getName = () => {
    const texts: string[] = [];
    store.pages.forEach((p) => {
      p.children.forEach((c) => {
        if (c.type === "text") {
          texts.push(c.text);
        }
      });
    });
    const allWords = texts.join(" ").split(" ");
    const words = allWords.slice(0, 6);
    return words.join(" ").replace(/\s/g, "-").toLowerCase() || "polotno";
  };

  const downloadVideo = async () => {
    if (!store.custom?.processID) return;

    setProgressStatus("scheduled");
    const segments: TAny[] = [];
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (
          element.custom?.type === "transcript" &&
          element.custom?.lang === language
        ) {
          segments.push({
            id: element.custom?.id,
            start: element.custom?.start,
            end: element.custom?.end,
            text: element.text,
          });
        }
      });
    });

    const body = {
      processID: store.custom?.processID,
      segments,
    };

    const response = await TranscriptApi.downloadVideo(body);
    if (response?.file_path) {
      const downloadURl = `${config.apiURL}/api/download-subtitled-video?file=${response?.file_path}`;
      window.open(downloadURl);
    }

    setProgressStatus("done");
    setProgress(0);
  };

  const exportVideo = async () => {
    const layerElements: TAny[] = [];
    let videoBase64: TAny;
    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType) => {
        if (element.custom?.type === "transcript") {
          // Only get subtitle from current language
          if (element.custom?.lang === language) {
            layerElements.push(element.toJSON());
          }
        } else if (element.type === "video") {
          videoBase64 = element.src;
        } else {
          layerElements.push(element.toJSON());
        }
      });
    });

    const base64ToBlob = (base64: string, mimeType: string) => {
      // Remove the data URL prefix (if exists)
      const base64Data = base64.split(",")[1] || base64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      return new Blob([byteNumbers], { type: mimeType });
    };

    const videoBlob = base64ToBlob(videoBase64, "video/mp4");
    const videoBlobFile = new File([videoBlob], "video.mp4", {
      type: "video/mp4",
    });

    const response = await TranscriptApi.exportVideo(
      videoBlobFile,
      layerElements
    );
    console.log(response);

    setProgressStatus("done");
    setProgress(0);
  };

  const maxQuality = type === "mp4" ? 1 : 300 / 72;
  return (
    <Popover
      content={
        <Menu>
          <li className="bp5-menu-header">
            <h6 className="bp5-heading">File type</h6>
          </li>
          <HTMLSelect
            fill
            onChange={(e) => {
              setType(e.target.value);
              setQuality(1);
            }}
            value={type}
          >
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="pdf">PDF</option>
            <option value="html">HTML</option>
            <option value="svg">SVG</option>
            <option value="json">JSON</option>
            <option value="gif">GIF</option>
            <option value="mp4">MP4 Video</option>
          </HTMLSelect>

          {type !== "json" &&
            type !== "html" &&
            type !== "svg" &&
            type !== "mp4" && (
              <>
                <li className="bp5-menu-header">
                  <h6 className="bp5-heading">Quality</h6>
                </li>
                <div style={{ padding: "10px" }}>
                  <Slider
                    value={quality}
                    labelRenderer={false}
                    onChange={(quality) => {
                      setQuality(quality);
                    }}
                    stepSize={0.2}
                    min={0.2}
                    max={maxQuality}
                    showTrackFill={false}
                  />
                  {type === "pdf" && (
                    <div>DPI: {Math.round(store.dpi * quality)}</div>
                  )}
                  {type !== "pdf" && (
                    <div>
                      {Math.round(store.width * quality)} x{" "}
                      {Math.round(store.height * quality)} px
                    </div>
                  )}
                  {type === "gif" && (
                    <>
                      <li className="bp5-menu-header">
                        <h6 className="bp5-heading">FPS</h6>
                      </li>
                      <div style={{ padding: "10px" }}>
                        <Slider
                          value={fps}
                          // labelRenderer={false}
                          labelStepSize={5}
                          onChange={(fps) => {
                            setFPS(fps);
                          }}
                          stepSize={1}
                          min={5}
                          max={30}
                          showTrackFill={false}
                        />
                      </div>
                    </>
                  )}
                </div>
                {type === "pdf" && (
                  <>
                    <li className="bp5-menu-header">
                      <h6 className="bp5-heading">Page Size</h6>
                    </li>
                    <div style={{ padding: "10px" }}>
                      <Slider
                        value={pageSizeModifier}
                        labelRenderer={false}
                        onChange={(pageSizeModifier) => {
                          setPageSizeModifier(pageSizeModifier);
                        }}
                        stepSize={0.2}
                        min={0.2}
                        max={3}
                        showTrackFill={false}
                      />

                      <div>
                        {unit.pxToUnitRounded({
                          px: store.width * pageSizeModifier,
                          dpi: store.dpi,
                          precious: 0,
                          unit: "mm",
                        })}{" "}
                        x{" "}
                        {unit.pxToUnitRounded({
                          px: store.height * pageSizeModifier,
                          dpi: store.dpi,
                          precious: 0,
                          unit: "mm",
                        })}{" "}
                        mm
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          {type === "json" && (
            <>
              <div style={{ padding: "10px", maxWidth: "180px", opacity: 0.8 }}>
                JSON format is used for saving and loading projects. You can
                save your project to a file and load it later via "File" {"->"}{" "}
                "Open" menu.
              </div>
            </>
          )}
          {type === "mp4" && (
            <>
              {selectedTranscripts.length > 0 && (
                <>
                  <p></p>
                  <HTMLSelect
                    fill
                    onChange={(e) => {
                      setLanguage(e.target.value);
                    }}
                    value={language}
                  >
                    {selectedTranscripts.map((code: string) => (
                      <option key={code} value={code}>
                        {getLangByCode(code)?.name ?? ""}
                      </option>
                    ))}
                  </HTMLSelect>
                </>
              )}

              <p></p>
              {saving && (
                <div
                  style={{ padding: "10px", maxWidth: "180px", opacity: 0.8 }}
                >
                  <ProgressBar value={Math.max(3, progress) / 100} />
                </div>
              )}
            </>
          )}
          <Button
            fill
            intent="primary"
            loading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (type === "pdf") {
                  await store.saveAsPDF({
                    fileName: getName() + ".pdf",
                    dpi: store.dpi / pageSizeModifier,
                    pixelRatio: 2 * quality,
                  });
                } else if (type === "html") {
                  await store.saveAsHTML({
                    fileName: getName() + ".html",
                  });
                } else if (type === "svg") {
                  await store.saveAsSVG({
                    fileName: getName() + ".svg",
                  });
                } else if (type === "json") {
                  const json = store.toJSON();

                  const url =
                    "data:text/json;base64," +
                    window.btoa(
                      unescape(encodeURIComponent(JSON.stringify(json)))
                    );

                  downloadFile(url, "polotno.json");
                } else if (type === "gif") {
                  await store.saveAsGIF({
                    fileName: getName() + ".gif",
                    pixelRatio: quality,
                    fps,
                  });
                } else if (type === "mp4") {
                  // await downloadVideo();
                  await exportVideo();
                } else {
                  if (store.pages.length < 3) {
                    store.pages.forEach((page, index) => {
                      // do not add index if we have just one page
                      const indexString =
                        store.pages.length > 1 ? "-" + (index + 1) : "";
                      store.saveAsImage({
                        pageId: page.id,
                        pixelRatio: quality,
                        mimeType: ("image/" + type) as MimeType,
                        fileName: getName() + indexString + "." + type,
                      });
                    });
                  } else {
                    const zip = new JSZip();
                    for (const page of store.pages) {
                      const index = store.pages.indexOf(page);
                      const indexString =
                        store.pages.length > 1 ? "-" + (index + 1) : "";

                      const url = await store.toDataURL({
                        pageId: page.id,
                        pixelRatio: quality,
                        mimeType: ("image/" + type) as MimeType,
                      });
                      const fileName = getName() + indexString + "." + type;
                      const base64Data = url.replace(
                        /^data:image\/(png|jpeg);base64,/,
                        ""
                      );
                      zip.file(fileName, base64Data, { base64: true });
                    }

                    const content = await zip.generateAsync({ type: "base64" });
                    const result = "data:application/zip;base64," + content;
                    downloadFile(result, getName() + ".zip");
                  }
                }
              } catch (e) {
                // throw into global error handler for reporting
                setTimeout(() => {
                  throw e;
                });
                alert("Something went wrong. Please try again.");
              }
              setSaving(false);
            }}
          >
            Download {type.toUpperCase()}
          </Button>
        </Menu>
      }
      position={Position.BOTTOM_RIGHT}
    >
      <Button
        icon="import"
        text={t("toolbar.download")}
        intent="primary"
        // loading={saving}
        onClick={() => {
          setQuality(1);
        }}
      />
    </Popover>
  );
});
