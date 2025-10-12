import { RequestStatus } from "./common";
import { UserResponse } from "./user";

export interface MetaDataResponse {
  page?: number;
  take?: number;
  itemCount?: number;
  pageCount?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
}

export interface DayOffResponse {
  id: number;
  assistant: UserResponse;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  user: UserResponse;
  dateFrom: Date | string;
  dateTo: Date | string;
  dateType?: "FULL_DAY" | "HALF_DAY";
  totalDays: number;
  details?: string;
  attachedFile?: string;
  pmName?: string;
  pmMail?: string;
  assistantMail?: string;
  status?: RequestStatus;
  adminNote?: string;
  pmNote?: string;
  assistantAttachFile?: string;
  collaborator?: CollaboratorResponse;
  allowance?: {
    fullYearAllowance: number;
    accruedBalance: number;
    taken: number;
    lastYearBalance: number;
    availableBalance: number;
  };
}

export interface CollaboratorResponse {
  id: string;
  collaboratorEmail: string;
  collaboratorFirstName: string;
  collaboratorLastName: string;
  createdAt: Date | string;
  employeeId: string;
  endDate: Date | string;
  startDate: Date | string;
  updatedAt: Date | string;
}

export interface WFHResponse {
  id?: string | number;
  dateFrom: Date | string;
  dateTo: Date | string;
  dateType?: "FULL_DAY" | "HALF_DAY";
  totalDays: number;
  details?: string;
  createdAt?: Date | string;
  status?: string;
  attachedFile?: string;
  employeeName?: string;
  email?: string;
  trigram?: string;
  position?: string;
  user?: any;
  workSpaceUrl?: string;
}

export interface DayOffHistoriesResponse {
  data: DayOffResponse[];
  meta: MetaDataResponse;
}

export interface WFHHistoriesResponse {
  data: WFHResponse[];
  meta: MetaDataResponse;
}

export interface CICOResponse {
  checkIn: string;
  checkOut: string;
  date: Date | string;
  totalPresence: string;
  dayOff: string;
  wfh: boolean;
}

export interface VacationBalancesResponse {
  id?: string | number;
  checkin: string;
  checkout: string;
  date: Date | string;
  workingHours: string;
  dayOff: string;
  wfh: boolean;
  employeeName?: string;
  dob?: Date | string;
  gender?: string;
  position?: string;
  trigram?: string;
  allowances?: number;
  taken?: number;
  balance?: number;
}

export interface LeaveTypesResponse {
  id?: string | number;
  createdAt: Date;
  updatedAt: Date;
  name: string;
}

export interface TotalRequestsResponse {
  timeOffRequests: number;
  wfhRequests: number;
}

export interface AttendanceResponse {
  data: CICOResponse[];
  meta: MetaDataResponse;
}

export interface AttendanceBalance {
  label: string;
  value: number;
}

export enum StaffingStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  RAW = "RAW",
}
export interface Staffing {
  id: number;
  title: string;
  hours: number;
}

export interface GetStaffingResponse {
  staffing: Array<Staffing>;
  totalTimeOffHours: number;
}

export interface TimeSheet {
  id?: number;
  projectId?: number;
  projectTitle?: string;
  date: Date | string;
  hours: number;
  description?: string;
  status?: StaffingStatus;
}

export interface GetTimeSheetsResponse {
  week: number;
  year: number;
  status: StaffingStatus;
  timesheets: TimeSheet[];
  timeOffs: TimeSheet[];
}

export interface SaveTimeSheetBodyRequest {
  upsertTimesheets: TimeSheet[];
  deleteTimesheetIds: number[];
}
