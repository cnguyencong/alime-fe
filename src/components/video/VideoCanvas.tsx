"use client";
import { useOverlayStore } from "@/shared/store/overlay";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import VideoOverlay from "./VideoOverlay";

interface VideoCanvasProps {
  videoRef: React.RefObject<HTMLVideoElement>;
}

const VideoCanvas: React.FC<VideoCanvasProps> = ({ videoRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.OrthographicCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const videoTextureRef = useRef<THREE.VideoTexture>();
  const animationFrameRef = useRef<number>();

  const overlays = useOverlayStore((state) => state.overlays);
  const updateOverlay = useOverlayStore((state) => state.updateOverlay);

  const setupScene = () => {
    if (!canvasRef.current || !videoRef.current) return;
    if (!videoRef.current.videoWidth || !videoRef.current.videoHeight) return;

    // Cleanup previous scene if it exists
    if (rendererRef.current) {
      rendererRef.current.dispose();
    }

    sceneRef.current = new THREE.Scene();

    // Get the container width
    const containerWidth =
      canvasRef.current.parentElement?.clientWidth || window.innerWidth;
    // Calculate height maintaining aspect ratio
    const containerHeight =
      containerWidth *
      (videoRef.current.videoHeight / videoRef.current.videoWidth);

    const aspect = videoRef.current.videoWidth / videoRef.current.videoHeight;

    cameraRef.current = new THREE.OrthographicCamera(
      -1,
      1,
      1 / aspect,
      -1 / aspect,
      0,
      1000
    );
    cameraRef.current.position.z = 1;

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
    });

    rendererRef.current.setSize(containerWidth, containerHeight);

    // Create video texture
    videoTextureRef.current = new THREE.VideoTexture(videoRef.current);
    videoTextureRef.current.minFilter = THREE.LinearFilter;
    videoTextureRef.current.magFilter = THREE.LinearFilter;

    const videoMaterial = new THREE.MeshBasicMaterial({
      map: videoTextureRef.current,
    });
    const videoGeometry = new THREE.PlaneGeometry(2, 2 / aspect);
    const videoMesh = new THREE.Mesh(videoGeometry, videoMaterial);
    sceneRef.current.add(videoMesh);

    animate();
  };

  const animate = () => {
    if (!videoRef.current) return;

    animationFrameRef.current = requestAnimationFrame(animate);

    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      if (videoTextureRef.current) {
        videoTextureRef.current.needsUpdate = true;
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  useEffect(() => {
    if (!videoRef.current) return;

    const handleVideoMetadata = () => {
      setupScene();
    };

    const handleResize = () => {
      setupScene();
    };

    videoRef.current.addEventListener("loadedmetadata", handleVideoMetadata);
    window.addEventListener("resize", handleResize);

    if (videoRef.current.readyState >= 2) {
      setupScene();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      videoRef.current?.removeEventListener(
        "loadedmetadata",
        handleVideoMetadata
      );
      window.removeEventListener("resize", handleResize);
      rendererRef.current?.dispose();
    };
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        id="video-canvas"
        className="w-full cursor-move"
      />

      {overlays.map((overlay) => (
        <VideoOverlay
          key={overlay.id}
          overlay={overlay}
          containerRef={videoRef as any}
          onPositionChange={(id, position, transform) => {
            updateOverlay(id, { position, transform });
          }}
          onSizeChange={(id, size) => {
            updateOverlay(id, { size });
          }}
        />
      ))}
    </div>
  );
};

export default VideoCanvas;
