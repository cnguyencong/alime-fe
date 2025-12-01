import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParkingService } from '../../../core/services/parking.service';
import { Observable, map } from 'rxjs';
import { ParkingSlot } from '../../../core/models/parking-slot.model';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage {
  private readonly parking = inject(ParkingService);

  slots$: Observable<ParkingSlot[]> = this.parking.getSlots$();

  totalSlots$ = this.slots$.pipe(map((slots) => slots.length));
  occupiedSlots$ = this.slots$.pipe(
    map((slots) => slots.filter((s) => s.status === 'occupied').length)
  );
  availableSlots$ = this.slots$.pipe(
    map((slots) => slots.filter((s) => s.status === 'empty').length)
  );
  occupancyRate$ = this.slots$.pipe(
    map((slots) => {
      const total = slots.length;
      if (total === 0) return 0;
      const occupied = slots.filter((s) => s.status === 'occupied').length;
      return Math.round((occupied / total) * 100);
    })
  );
  availablePercentage$ = this.slots$.pipe(
    map((slots) => {
      const total = slots.length;
      if (total === 0) return 0;
      const available = slots.filter((s) => s.status === 'empty').length;
      return Math.round((available / total) * 100);
    })
  );
}
