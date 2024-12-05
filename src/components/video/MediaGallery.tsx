import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface MediaGalleryProps {
  onVideoSelect: (file: File) => void;
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({
  onVideoSelect,
  className = "",
}) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        if (file.type.startsWith("video/")) {
          onVideoSelect(file);
        }
      });
    },
    [onVideoSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm", ".ogg"],
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`
        p-6 border-2 border-dashed rounded-lg
        ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        transition-colors duration-200 ease-in-out
        cursor-pointer hover:border-blue-400
        flex items-center justify-center
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <div className="text-center">
        <p className="text-gray-600">
          {isDragActive
            ? "Drop your media files here..."
            : "Drag 'n' drop videos or images here, or click to select files"}
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Supported formats: MP4, WebM, OGG
        </p>
      </div>
    </div>
  );
};

export default MediaGallery;
