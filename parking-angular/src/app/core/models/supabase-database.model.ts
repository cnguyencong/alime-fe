import { VehicleType } from './parking-slot.model';

/** Database row from parking_slots table */
export interface ParkingSlotRow {
  id: string;
  zone: string;
  type: VehicleType;
  status: 'empty' | 'occupied' | 'maintenance';
  current_vehicle_id: string | null;
}

/** Database row from vehicles table */
export interface VehicleRow {
  id: string;
  license_plate: string;
  type: VehicleType;
}

/** Database row from active_parkings table */
export interface ActiveParkingRow {
  id: string;
  vehicle_id: string;
  slot_id: string;
  check_in_time: string; // ISO string from database
}

/** Update data for parking_slots */
export interface ParkingSlotUpdate {
  status: 'empty' | 'occupied' | 'maintenance';
  current_vehicle_id: string | null;
}
