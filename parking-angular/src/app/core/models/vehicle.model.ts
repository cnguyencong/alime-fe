import { VehicleType } from './parking-slot.model';

export interface Vehicle {
  id: string;
  licensePlate: string;
  type: VehicleType;
}
