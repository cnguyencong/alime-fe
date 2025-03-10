import { useEffect, useRef } from "react";
import { useVideoStore } from "../../shared/zustand/video";

interface VideoCanvasProps {
  src: string;
  currentTime: number;
  width: number;
  height: number;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({ src }) => {
  const videoRef = useRef<any>(null);
  const canvasRef = useRef<any>(null);
  const isPlaying = useVideoStore((state) => state.isPlaying);
  const setCurrentTime = useVideoStore((state) => state.setCurrentTime);
  const startTime = useVideoStore((state) => state.startTime);
  const ended = useVideoStore((state) => state.ended);
  const muted = useVideoStore((state) => state.muted);

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
      video.currentTime = 1;
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

  // Seek video when currentTime prop changes
  useEffect(() => {
    if (videoRef?.current) {
      videoRef.current.currentTime = startTime;
    }
  }, [startTime]);

  useEffect(() => {
    if (isPlaying) {
      videoRef?.current.play();
    } else {
      videoRef?.current.pause();
    }
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
    <>
      <video
        onTimeUpdate={handleTimeUpdate}
        ref={videoRef}
        style={{ display: "none" }}
        onEnded={() => ended()}
      />
      <canvas style={{ width: "100%", height: "100%" }} ref={canvasRef} />
    </>
  );
};

export default VideoCanvas;
