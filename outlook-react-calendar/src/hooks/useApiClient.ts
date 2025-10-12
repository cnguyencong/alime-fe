import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

export function useApiClient() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [configInfo, setConfigInfo] = useState<{
    baseUrl: string;
    hasToken: boolean;
  } | null>(null);

  useEffect(() => {
    const checkConfig = () => {
      const configured = apiClient.isConfigured();
      const info = apiClient.getConfigInfo();

      setIsConfigured(configured);
      setConfigInfo(info);
    };

    // Check initial config
    checkConfig();

    // Listen for URL changes (if needed)
    const handleUrlChange = () => {
      apiClient.reloadConfig();
      checkConfig();
    };

    window.addEventListener("popstate", handleUrlChange);

    return () => {
      window.removeEventListener("popstate", handleUrlChange);
    };
  }, []);

  return {
    apiClient,
    isConfigured,
    configInfo,
    reloadConfig: () => {
      apiClient.reloadConfig();
      setIsConfigured(apiClient.isConfigured());
      setConfigInfo(apiClient.getConfigInfo());
    },
  };
}
