import { VehicleType } from './parking-slot.model';

export interface PricingRule {
  vehicleType: VehicleType;
  ratePerHour: number;
}
