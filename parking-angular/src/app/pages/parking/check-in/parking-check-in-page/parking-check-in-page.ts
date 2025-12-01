import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ParkingService } from '../../../../core/services/parking.service';
import { VehicleType } from '../../../../core/models/parking-slot.model';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-parking-check-in-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './parking-check-in-page.html',
  styleUrl: './parking-check-in-page.css',
})
export class ParkingCheckInPage {
  private readonly parking = inject(ParkingService);
  private readonly cdr = inject(ChangeDetectorRef);

  licensePlate = '';
  vehicleType: VehicleType = 'motorbike';

  error = '';
  message = '';
  isLoading = false;

  submit(): void {
    this.error = '';
    this.message = '';

    const plate = this.licensePlate.trim().toUpperCase(); // normalize

    if (!plate) {
      this.error = 'Please enter license plate.';
      return;
    }

    this.isLoading = true;

    this.parking
      .checkIn(plate, this.vehicleType)
      .pipe(
        finalize(() => {
          console.log('[CheckIn] finalize called, setting isLoading = false');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        })
      )
      .subscribe({
        next: () => {
          console.log('[CheckIn] success');
          this.message = `Vehicle ${plate} checked in successfully.`;
          this.licensePlate = '';
        },
        error: (e: unknown) => {
          console.error('[CheckIn] error:', e);
          this.error = e instanceof Error ? e.message : 'An error occurred during check-in.';
        },
        complete: () => {
          console.log('[CheckIn] complete called');
        },
      });
  }
}
