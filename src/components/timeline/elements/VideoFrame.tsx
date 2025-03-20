import React from "react";
import { config } from "../../../shared/constants";

// Capture 1 frame every 5 seconds
const FRAME_INTERVAL_IN_SECONDS = 5;

interface VideoFramesProps {
  id: string;
  src: string;
}

const VideoFrames = React.memo(({ src }: VideoFramesProps) => {
  const [frames, setFrames] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (!src || frames.length > 0) return;

    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous"; // Ensure CORS is handled if needed

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const captureFrame = (time: number): Promise<string> => {
      return new Promise((resolve) => {
        video.currentTime = time;

        video.onseeked = () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frameData = canvas.toDataURL("image/jpeg");
          resolve(frameData);
        };
      });
    };

    const extractFrames = async () => {
      const duration = video.duration;

      if (!duration || duration === Infinity) {
        console.warn("Video duration is invalid: ", duration);
        return;
      }

      const frameTimes: number[] = [];

      // Collect times at every 5-second interval
      for (let time = 0; time < duration; time += FRAME_INTERVAL_IN_SECONDS) {
        frameTimes.push(time);
      }

      // Capture frames at those times
      const capturedFrames: string[] = [];

      for (let time of frameTimes) {
        const frame = await captureFrame(time);
        capturedFrames.push(frame);
      }

      setFrames(capturedFrames);
    };

    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      extractFrames();
    };

    return () => {
      video.src = ""; // Clean up video source
    };
  }, [frames, src]);

  return (
    frames && (
      <div style={{ display: "flex" }}>
        {frames.map((frame, i) => (
          <img
            key={i}
            src={frame}
            alt={`Frame ${i}`}
            style={{
              width: `${FRAME_INTERVAL_IN_SECONDS * config.pixelsPerSecond}px`,
              height: `50px`,
              marginRight: "2px",
            }}
          />
        ))}
      </div>
    )
  );
});

export default VideoFrames;
