import { apiClient } from "@/lib/api-client";
import {
  DayOffHistoriesResponse,
  WFHHistoriesResponse,
} from "./types/attendance.type";

type Dictionary<T = unknown> = Record<string, T>;

export async function getTimeOffRequests(
  params?: Dictionary<string | number | boolean>
): Promise<DayOffHistoriesResponse> {
  return await apiClient.get("/time-off-requests", params);
}

export async function getWFHRequests(
  params?: Dictionary<string | number | boolean>
): Promise<WFHHistoriesResponse> {
  return await apiClient.get("/wfh-requests", params);
}
