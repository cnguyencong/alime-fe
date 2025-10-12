import { PositionResponse } from "./position";
import { LevelResponse } from "./level";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  ASSISTANT = "ASSISTANT",
  PM = "PM",
}

export interface UserResponse {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  firstLogin: boolean;
  firstName: string;
  lastName: string;
  username: string;
  roles: UserRole[];
  email: string;
  photo: string;
  phone: string;
  isActive: boolean;
  trigram: string;
  companyEmail: string;
  dateOfBirth: Date;
  gender: string;
  university: string;
  address: string;
  position: PositionResponse;
  level: LevelResponse;
  startDate: Date;
  endDate: Date;
  isAssistant?: boolean;
  employeeId?: string;
  collaboratorLastName?: string;
  collaboratorFirstName?: string;
  fullName?: string;
}
