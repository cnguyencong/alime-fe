import { RequestStatus } from "@/api/types/common";
import { UserResponse } from "@/api/types/user";

// Base calendar event interface
export interface BaseCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  backgroundColor: string;
  borderColor: string;
}

// Time-off specific extended props
export interface TimeOffExtendedProps {
  type: "time-off";
  status: RequestStatus;
  details?: string;
  totalDays: number;
  assistant?: UserResponse;
  pmName?: string;
  pmMail?: string;
  adminNote?: string;
  pmNote?: string;
  attachedFile?: string;
}

// WFH specific extended props
export interface WFHExtendedProps {
  type: "wfh";
  status: RequestStatus;
  details?: string;
  totalDays: number;
  employeeName?: string;
  email?: string;
  trigram?: string;
  position?: string;
  workSpaceUrl?: string;
  attachedFile?: string;
}

// Union type for all calendar events
export type CalendarEvent = BaseCalendarEvent & {
  extendedProps: TimeOffExtendedProps | WFHExtendedProps;
};

// Type guards for runtime type checking
export function isTimeOffEvent(
  event: CalendarEvent
): event is BaseCalendarEvent & { extendedProps: TimeOffExtendedProps } {
  return event.extendedProps.type === "time-off";
}

export function isWFHEvent(
  event: CalendarEvent
): event is BaseCalendarEvent & { extendedProps: WFHExtendedProps } {
  return event.extendedProps.type === "wfh";
}

// Helper function to get event type
export function getEventType(event: CalendarEvent): "time-off" | "wfh" {
  return event.extendedProps.type;
}

// Helper function to get status
export function getEventStatus(event: CalendarEvent): RequestStatus {
  return event.extendedProps.status;
}

// Helper function to get total days
export function getEventTotalDays(event: CalendarEvent): number {
  return event.extendedProps.totalDays;
}

// Helper function to get details
export function getEventDetails(event: CalendarEvent): string | undefined {
  return event.extendedProps.details;
}
