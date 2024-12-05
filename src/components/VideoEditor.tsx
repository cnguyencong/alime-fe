"use client";
import React, { useRef } from "react";

import VideoCanvas from "./video/VideoCanvas";
import MediaGallery from "./video/MediaGallery";
import { useVideoStore } from "@/shared/store/video";
import VideoControls from "./video/VideoControls";

const VideoEditor = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const { setDuration, setCurrentTime, setPreviewUrl, previewUrl } =
    useVideoStore();

  const handleVideoSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Reset video state
    setCurrentTime(0);
    setDuration(0);

    // Load video metadata
    if (videoRef.current) {
      videoRef.current.src = url;
      videoRef.current.load();
    }
  };

  const handleVideoLoaded = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <div className="p-4">
      <div className="space-y-4">
        {!previewUrl && (
          <MediaGallery
            onVideoSelect={handleVideoSelect}
            className="h-[calc(100vh-25rem)]"
          />
        )}

        {previewUrl && (
          <>
            <div className="mt-4 relative">
              <video
                ref={videoRef}
                className="hidden"
                onLoadedMetadata={handleVideoLoaded}
                onTimeUpdate={handleVideoTimeUpdate}
                controls
              >
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <VideoCanvas videoRef={videoRef} />

              <div className="hover:opacity-100 z-10 opacity-0 transition-opacity duration-300 mt-4 absolute bottom-0 left-0 right-0">
                <VideoControls videoRef={videoRef} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoEditor;
