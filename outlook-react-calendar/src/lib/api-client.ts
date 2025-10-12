import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

type Dictionary<T = unknown> = Record<string, T>;

export interface ApiConfig {
  baseUrl: string;
  accessToken: string;
}

export class ApiClient {
  private axiosInstance: AxiosInstance | null = null;
  private config: ApiConfig | null = null;

  constructor() {
    this.loadConfigFromUrl();
  }

  private loadConfigFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const apiBaseUrl = urlParams.get("apiBaseUrl");
    const accessToken = urlParams.get("accessToken");

    if (apiBaseUrl && accessToken) {
      this.config = {
        baseUrl: decodeURIComponent(apiBaseUrl),
        accessToken: decodeURIComponent(accessToken),
      };

      // Create axios instance with base config
      this.axiosInstance = axios.create({
        baseURL: this.config.baseUrl,
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("API Config loaded from URL:", {
        baseUrl: this.config.baseUrl,
        hasToken: !!this.config.accessToken,
      });
    } else {
      console.warn(
        "API config not found in URL parameters. Expected: ?apiBaseUrl=...&accessToken=..."
      );
    }
  }

  private ensureAxiosInstance(): AxiosInstance {
    if (!this.axiosInstance) {
      throw new Error(
        "API configuration not available. Please provide apiBaseUrl and accessToken in URL parameters."
      );
    }
    return this.axiosInstance;
  }

  async get<T>(
    endpoint: string,
    params?: Dictionary<string | number | boolean>
  ): Promise<T> {
    const axios = this.ensureAxiosInstance();
    const response = await axios.get<T>(endpoint, { params });
    return response.data;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const axios = this.ensureAxiosInstance();
    const response = await axios.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const axios = this.ensureAxiosInstance();
    const response = await axios.put<T>(endpoint, data);
    return response.data;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const axios = this.ensureAxiosInstance();
    const response = await axios.patch<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const axios = this.ensureAxiosInstance();
    const response = await axios.delete<T>(endpoint);
    return response.data;
  }

  // Utility method to check if API is configured
  isConfigured(): boolean {
    return this.config !== null && this.axiosInstance !== null;
  }

  // Utility method to get current config (without sensitive data)
  getConfigInfo(): { baseUrl: string; hasToken: boolean } | null {
    if (!this.config) return null;
    return {
      baseUrl: this.config.baseUrl,
      hasToken: !!this.config.accessToken,
    };
  }

  // Method to reload config from URL (useful if URL changes)
  reloadConfig(): void {
    this.loadConfigFromUrl();
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
