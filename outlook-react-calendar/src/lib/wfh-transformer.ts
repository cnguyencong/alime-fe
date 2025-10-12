import { WFHHistoriesResponse, WFHResponse } from "@/api/types/attendance.type";
import { RequestStatus } from "@/api/types/common";
import { CalendarEvent } from "@/lib/calendar-types";

// Color mapping based on status
const getStatusColor = (
  status: RequestStatus
): { bg: string; border: string } => {
  switch (status) {
    case RequestStatus.Approved:
      return { bg: "#10b981", border: "#10b981" }; // Green
    case RequestStatus.Pending:
      return { bg: "#f59e0b", border: "#f59e0b" }; // Yellow
    case RequestStatus.Refused:
      return { bg: "#ef4444", border: "#ef4444" }; // Red
    case RequestStatus.Processing:
      return { bg: "#3b82f6", border: "#3b82f6" }; // Blue
    case RequestStatus.Assistant:
      return { bg: "#8b5cf6", border: "#8b5cf6" }; // Purple
    case RequestStatus.Balance:
      return { bg: "#6b7280", border: "#6b7280" }; // Gray
    case RequestStatus.Close:
      return { bg: "#374151", border: "#374151" }; // Dark gray
    default:
      return { bg: "#6b7280", border: "#6b7280" }; // Default gray
  }
};

// Transform WFH request to calendar event
export function transformWFHToCalendarEvent(
  wfhRequest: WFHResponse
): CalendarEvent {
  const colors = getStatusColor(wfhRequest.status as RequestStatus);

  // Debug: Log the raw date values
  console.log("Raw WFH request:", {
    id: wfhRequest.id,
    dateFrom: wfhRequest.dateFrom,
    dateTo: wfhRequest.dateTo,
    dateFromType: typeof wfhRequest.dateFrom,
    dateToType: typeof wfhRequest.dateTo,
  });

  // Format dates for FullCalendar with validation
  const parseDate = (dateString: any): string => {
    if (!dateString) {
      console.warn("Invalid date string:", dateString);
      return new Date().toISOString();
    }

    // Handle different date formats
    let date: Date;

    if (typeof dateString === "string") {
      // Handle DD/MM/YYYY format (e.g., "13/10/2025")
      if (dateString.includes("/") && dateString.length === 10) {
        const parts = dateString.split("/");
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);

          // Create date with month-1 because Date constructor expects 0-based months
          date = new Date(year, month - 1, day);
        } else {
          console.warn("Invalid DD/MM/YYYY format:", dateString);
          return new Date().toISOString();
        }
      } else if (dateString.includes("T")) {
        // ISO format: 2024-01-15T00:00:00.000Z
        date = new Date(dateString);
      } else if (dateString.includes("-")) {
        // Date format: 2024-01-15
        date = new Date(dateString + "T00:00:00.000Z");
      } else {
        // Try parsing as-is
        date = new Date(dateString);
      }
    } else if (typeof dateString === "number") {
      // Unix timestamp
      date = new Date(dateString);
    } else {
      console.warn("Unsupported date type:", typeof dateString, dateString);
      return new Date().toISOString();
    }

    if (isNaN(date.getTime())) {
      console.warn("Invalid date after parsing:", dateString);
      return new Date().toISOString();
    }

    return date.toISOString();
  };

  const startDate = parseDate(wfhRequest.dateFrom);
  const endDate = parseDate(wfhRequest.dateTo);

  const title = `WFH - ${wfhRequest.totalDays} day(s)`;

  return {
    id: `wfh-${wfhRequest.id}`,
    title,
    start: startDate,
    end: endDate,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    extendedProps: {
      type: "wfh",
      status: (wfhRequest.status as RequestStatus) || RequestStatus.Pending,
      details: wfhRequest.details,
      totalDays: wfhRequest.totalDays,
      employeeName: wfhRequest.employeeName,
      email: wfhRequest.email,
      trigram: wfhRequest.trigram,
      position: wfhRequest.position,
      workSpaceUrl: wfhRequest.workSpaceUrl,
      attachedFile: wfhRequest.attachedFile,
    },
  };
}

// Transform multiple WFH requests to calendar events
export function transformWFHRequestsToCalendarEvents(
  response: WFHHistoriesResponse
): CalendarEvent[] {
  if (!response.data || !Array.isArray(response.data)) {
    return [];
  }

  return response.data.map(transformWFHToCalendarEvent);
}

// Helper function to get status display name
export function getWFHStatusDisplayName(status: RequestStatus): string {
  switch (status) {
    case RequestStatus.Approved:
      return "Approved";
    case RequestStatus.Pending:
      return "Pending";
    case RequestStatus.Refused:
      return "Refused";
    case RequestStatus.Processing:
      return "Processing";
    case RequestStatus.Assistant:
      return "Assistant Review";
    case RequestStatus.Balance:
      return "Balance Check";
    case RequestStatus.Close:
      return "Closed";
    default:
      return "Unknown";
  }
}

// Helper function to format date range for display
export function formatWFHDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const startFormatted = start.toLocaleDateString("en-US", formatOptions);
  const endFormatted = end.toLocaleDateString("en-US", formatOptions);

  if (startFormatted === endFormatted) {
    return startFormatted;
  }

  return `${startFormatted} - ${endFormatted}`;
}

// Helper function to test DD/MM/YYYY parsing for WFH
export function testWFHDateParsing(dateString: string): {
  original: string;
  parsed: string;
  isValid: boolean;
  displayDate: string;
} {
  const parseDate = (dateStr: string): string => {
    if (!dateStr || typeof dateStr !== "string") {
      return new Date().toISOString();
    }

    // Handle DD/MM/YYYY format
    if (dateStr.includes("/") && dateStr.length === 10) {
      const parts = dateStr.split("/");
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);

        const date = new Date(year, month - 1, day);
        return date.toISOString();
      }
    }

    return new Date().toISOString();
  };

  const parsed = parseDate(dateString);
  const date = new Date(parsed);
  const isValid = !isNaN(date.getTime());

  return {
    original: dateString,
    parsed,
    isValid,
    displayDate: isValid ? date.toLocaleDateString("en-US") : "Invalid Date",
  };
}
