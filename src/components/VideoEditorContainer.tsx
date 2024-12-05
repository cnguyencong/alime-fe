"use client";
import React from "react";
import VideoEditor from "./VideoEditor";
import VideoTool from "./VideoTool";
import OverlayTimeline from "./OverlayTimeline";

const VideoEditorContainer: React.FC = () => {
  return (
    <div className="grid grid-cols-10">
      <div className="col-span-8 h-[100vh]">
        <VideoEditor />
        <OverlayTimeline />
      </div>
      <div className="col-span-2 h-[100vh]">
        <VideoTool />
      </div>
    </div>
  );
};

export default VideoEditorContainer;
