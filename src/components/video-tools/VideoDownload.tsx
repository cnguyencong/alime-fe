import { useProcessorStore } from "@/shared/store/processor";

const VideoDownload = () => {
  const { processedVideoUrl } = useProcessorStore();
  const handleDownload = () => {
    if (!processedVideoUrl) return;

    const link = document.createElement("a");
    link.href = processedVideoUrl;
    link.download = "processed-video.mp4";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  return (
    processedVideoUrl && (
      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Download Video
      </button>
    )
  );
};

export default VideoDownload;
