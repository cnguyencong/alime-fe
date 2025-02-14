import { useState, useEffect } from "react";

interface VideoFramesProps {
  src: string;
}

const maxFrames = 100;
const VideoFrames = ({ src }: VideoFramesProps) => {
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    const video = document.createElement("video");
    video.src = src;
    video.crossOrigin = "anonymous"; // Ensure CORS is handled if needed

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;

    const captureFrame = (time: number) => {
      return new Promise((resolve) => {
        video.currentTime = time;
        video.onseeked = () => {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg"));
        };
      });
    };

    const extractFrames = async () => {
      const duration = video.duration;
      const frameCount = Math.min(maxFrames, Math.ceil(duration / 10)); // Calculate frames based on duration
      const interval = duration / Math.max(frameCount, 1); // Ensure we don't divide by zero
      const capturedFrames: string[] = [];

      for (let i = 0; i < frameCount; i++) {
        const frame = await captureFrame(i * interval);
        capturedFrames.push(frame as string);
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
  }, [src]);

  return (
    <div style={{ display: "flex" }}>
      {frames.map((frame, i) => (
        <img
          key={i}
          src={frame}
          alt={`Frame ${i}`}
          style={{ width: "45px", height: "45px", marginRight: "2px" }}
        />
      ))}
    </div>
  );
};

export default VideoFrames;
