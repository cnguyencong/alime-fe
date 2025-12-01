import { Injectable, signal } from '@angular/core';
import { PricingRule } from '../models/pricing.model';
import { VehicleType } from '../models/parking-slot.model';

@Injectable({
  providedIn: 'root',
})
export class PricingService {
  private readonly _rules = signal<PricingRule[]>([
    {
      vehicleType: 'motorbike',
      ratePerHour: 3000,
    },
    {
      vehicleType: 'car',
      ratePerHour: 15000,
    },
  ]);

  rules = this._rules;

  getRatePerHour(type: VehicleType): number {
    const rule = this._rules().find((r) => r.vehicleType === type);
    return rule ? rule.ratePerHour : 0;
  }

  calculateFee(type: VehicleType, hours: number): number {
    const rate = this.getRatePerHour(type);
    return rate * hours;
  }
}
