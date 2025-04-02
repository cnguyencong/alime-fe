import { useEffect, useRef, useState } from "react";
import { useTransitions } from "../../shared/zustand/transition";
import { useVideoStore } from "../../shared/zustand/video";
import { AnimatedWrapper } from "./elements/AnimatedWrapper";
import { TAny } from "../../shared/types/common";

interface VideoCanvasProps {
  src: string;
  currentTime: number;
  width: number;
  height: number;
  trimStartTime: number;
  trimEndTime: number;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({
  src,
  currentTime,
  width,
  height,
  trimStartTime,
  trimEndTime,
}) => {
  const videoRef = useRef<TAny>(null);
  const canvasRef = useRef<TAny>(null);
  const isPlaying = useVideoStore((state) => state.isPlaying);
  const isPlayingRange = useVideoStore((state) => state.isPlayingRange);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const startTime = useVideoStore((state) => state.startTime);
  const ended = useVideoStore((state) => state.ended);
  const muted = useVideoStore((state) => state.muted);
  const { togglePlaying } = useTransitions();
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    video.src = src;

    // Function to draw video frames onto the canvas
    const draw = () => {
      if (video.paused || video.ended) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      requestAnimationFrame(draw);
    };

    // Start drawing when the video starts playing
    video.addEventListener("play", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      draw();
    });

    // When the video metadata is loaded, extract a thumbnail
    video.addEventListener("loadedmetadata", () => {
      // Seek to a specific time (e.g., 1 second) to capture a frame
      video.currentTime = trimStartTime * duration;
      setDuration(video.duration);
    });

    // When the video seeks to the desired time, capture the frame
    video.addEventListener("seeked", () => {
      // Draw the video frame onto the canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    });

    // Cleanup
    return () => {
      video.removeEventListener("play", draw);
    };
  }, []);

  const handleTrimStartTime = () => {
    if (videoRef?.current && !isPlayingRange) {
      videoRef.current.currentTime = trimStartTime * duration;
    }
  };

  // Play video at timerange
  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime, isPlayingRange]);

  // Set video current time to map with trimStartTime
  useEffect(() => {
    handleTrimStartTime();
  }, [trimStartTime, isPlayingRange]);

  // Set video current time to map with trimEndTime
  useEffect(() => {
    if (videoRef?.current && !isPlayingRange) {
      const trimEndTimeInSec = trimEndTime * duration;
      if (trimEndTimeInSec <= currentTime) {
        videoRef?.current.pause();
      }
    }
  }, [trimEndTime, currentTime, isPlayingRange]);

  useEffect(() => {
    if (isPlaying) {
      handleTrimStartTime();
      videoRef?.current.play();
    } else {
      videoRef?.current.pause();
    }
    togglePlaying();
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.muted = muted;
    }
  }, [muted]);

  // Function to handle the timeupdate event
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  return (
    <AnimatedWrapper width={width} height={height} currentTime={currentTime}>
      <video
        onTimeUpdate={handleTimeUpdate}
        ref={videoRef}
        style={{ display: "none" }}
        onEnded={() => ended()}
      />
      <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
    </AnimatedWrapper>
  );
};

export default VideoCanvas;
