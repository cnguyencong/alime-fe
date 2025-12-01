export type VehicleType = 'motorbike' | 'car';

export interface ParkingSlot {
  id: string;
  zone: string;
  type: VehicleType;
  status: 'empty' | 'occupied' | 'maintenance';
}
