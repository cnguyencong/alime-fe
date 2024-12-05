import { useVideoStore } from "@/shared/store/video";
import EditorTimeline from "./EditorTimeline";
import { useState } from "react";
import PlayIcon from "@/shared/icons/video/PlayIcon";
import PauseIcon from "@/shared/icons/video/PauseIcon";
import UnMuteIcon from "@/shared/icons/video/UnMuteIcon";
import MuteIcon from "@/shared/icons/video/MuteIcon";

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}
const VideoControls: React.FC<VideoControlsProps> = ({ videoRef }) => {
  const { duration, currentTime, setCurrentTime } = useVideoStore();

  const [isMuted, setIsMuted] = useState(true);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    duration && (
      <div>
        <EditorTimeline
          duration={duration}
          currentTime={currentTime}
          onTimeUpdate={handleTimeUpdate}
        />
        <div className="grid grid-cols-10 gap-1">
          <div className="col-span-2">
            {videoRef.current?.paused ? (
              <button
                onClick={() => videoRef.current?.play()}
                className="mx-2 px-4 py-2 text-white rounded"
              >
                <PlayIcon />
              </button>
            ) : (
              <button
                onClick={() => videoRef.current?.pause()}
                className="mx-2 px-4 py-2 text-white rounded"
              >
                <PauseIcon />
              </button>
            )}
            <button
              onClick={toggleMute}
              className="mx-2 px-4 py-2 text-white rounded"
            >
              {isMuted ? <MuteIcon /> : <UnMuteIcon />}
            </button>
          </div>
          <div className="col-span-1">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-2"> / </span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    )
  );
};

export default VideoControls;
