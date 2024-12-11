import React from "react";

// I know, it is unsafe to use localStorage
// but I don't want to add any backend for this right now
// and I don't want to use cookies
// so it is just a simple hack
// for prototype
// I promise to fix it later -> LIED
// most of the text above wrote copilot
const loadCredits = (key: string, maxUsage: number) => {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "{}");
    if (data.date !== new Date().toDateString()) {
      return maxUsage;
    }
    return data.credits || maxUsage;
  } catch (e) {
    console.error(e);
  }
  return maxUsage;
};

const saveCredits = (key: string, credits: number) => {
  localStorage.setItem(
    key,
    JSON.stringify({
      date: new Date().toDateString(),
      credits,
    })
  );
};

export const useCredits = (key = "unknown", maxUsage = 10) => {
  const [credits, setCredits] = React.useState(() =>
    loadCredits(key, maxUsage)
  );

  React.useEffect(() => {
    saveCredits(key, credits);
  }, [key, credits]);

  const consumeCredits = (amount = 1) => {
    setCredits((credits: number) => credits - amount);
  };

  return { credits, consumeCredits };
};
