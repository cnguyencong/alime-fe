import React, { useRef, useState, useEffect } from "react";

const TimelineIndicatorTest = () => {
  const videoRef = useRef(null); // Reference to the video element
  const [currentTime, setCurrentTime] = useState(0); // Current time of the video
  const [indicatorWidth, setIndicatorWidth] = useState(0); // Width of the time indicator

  // Update the indicator width based on the current time
  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const time = videoRef.current.currentTime; // Get current time of the video
        setCurrentTime(time);
        setIndicatorWidth((time / 10) * 1); // Calculate indicator width (1 pixel = 10 seconds)
      }
    }, 16.67); // 60 FPS (1000ms / 60 ≈ 16.67ms)

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {/* Video Player */}
      <video
        ref={videoRef}
        width="600"
        controls
        src="https://www.w3schools.com/html/mov_bbb.mp4" // Replace with your video URL
      >
        Your browser does not support the video tag.
      </video>

      {/* Time Indicator */}
      <div
        style={{
          marginTop: "10px",
          height: "20px",
          backgroundColor: "lightgray",
          position: "relative",
        }}
      >
        <div
          style={{
            width: `${indicatorWidth}px`, // Dynamic width based on current time
            height: "100%",
            backgroundColor: "blue",
          }}
        ></div>
      </div>

      {/* Display Current Time */}
      <p>Current Time: {currentTime.toFixed(2)} seconds</p>
    </div>
  );
};

export default TimelineIndicatorTest;
