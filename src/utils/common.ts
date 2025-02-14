export const calcPixelsPerSecond = (
  duration: number,
  pixelsPerSecond: number
) => {
  const durationInSeconds = duration / 1000;
  return durationInSeconds * pixelsPerSecond;
};

export const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};
