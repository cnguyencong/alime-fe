import {
  Button,
  Checkbox,
  HTMLSelect,
  Menu,
  Popover,
  Position,
  ProgressBar,
  Slider,
} from "@blueprintjs/core";
import JSZip from "jszip";
import { observer } from "mobx-react-lite";
import { ElementType } from "polotno/model/group-model";
import { PageType } from "polotno/model/page-model";
import { StoreType } from "polotno/model/store";
import { downloadFile } from "polotno/utils/download";
import { t } from "polotno/utils/l10n";
import * as unit from "polotno/utils/unit";
import React, { useState } from "react";
import { useTranscriptLang } from "../../functions/hooks/useTranscriptLang";
import { config } from "../../shared/constants";
import { TranscriptApi } from "../../shared/services/transcript.api";
import { TAny } from "../../shared/types/common";
import { getLangByCode } from "../../shared/utils/common";
import { useTransitions } from "../../shared/zustand/transitions";

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
  const [exportSubtitle, setExportSubtitle] = useState(false);
  const [exportVoice, setExportVoice] = useState(false);
  const { transitionForSegmentIds } = useTransitions();

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

  const calculateTrimTime = (
    scaledStart: number,
    scaledEnd: number,
    durationMs: number
  ) => {
    let startTimeMs = Math.round(scaledStart * durationMs);
    let endTimeMs = Math.round(scaledEnd * durationMs);

    let startTimeSec = startTimeMs / 1000;
    let endTimeSec = endTimeMs / 1000;

    return {
      startTimeMs,
      endTimeMs,
      startTimeSec,
      endTimeSec,
    };
  };

  const downloadVideo = async () => {
    if (!store.custom?.processID) return;

    setProgressStatus("scheduled");
    const segments: TAny[] = [];

    let isTrimVideo = false;
    let trimStart = 0;
    let trimEnd = 0;

    store.pages.forEach((page: PageType) => {
      page.children.forEach((element: ElementType & { text: string }) => {
        if (
          element.custom?.type === "transcript" &&
          element.custom?.lang === language
        ) {
          segments.push({
            id: element.custom?.id,
            start: element.custom?.start,
            end: element.custom?.end,
            text: element.text,
            transition: transitionForSegmentIds.includes(element.custom?.id),
          });
        } else if (element.type === "video") {
          isTrimVideo = !(element.startTime === 0 && element.endTime === 1);
          const calcTrimResult = calculateTrimTime(
            element.startTime,
            element.endTime,
            element.duration
          );
          trimStart = calcTrimResult.startTimeSec;
          trimEnd = calcTrimResult.endTimeSec;
        }
      });
    });

    const body = {
      processID: store.custom?.processID,
      segments,
      language: language,
      isShowCaption: exportSubtitle,
      isAppendTTS: exportVoice,
      isTrimVideo,
      trimStart,
      trimEnd,
    };

    const response = await TranscriptApi.downloadVideo(body);
    if (response?.file_path) {
      const downloadURl = `${config.apiURL}/api/download-video?file=${response?.file_path}`;
      window.open(downloadURl);
    }

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
                  <Checkbox
                    checked={exportSubtitle}
                    label="Subtitles"
                    onChange={(e) => setExportSubtitle(e.target.checked)}
                  />
                  <p></p>
                  <Checkbox
                    checked={exportVoice}
                    onChange={(e) => setExportVoice(e.target.checked)}
                    label="Voice"
                  />
                  {(exportSubtitle || exportVoice) && (
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
                  )}
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
                  await downloadVideo();
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
