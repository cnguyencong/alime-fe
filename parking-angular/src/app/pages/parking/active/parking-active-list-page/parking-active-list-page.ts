import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { combineLatest, map, Observable, finalize } from 'rxjs';
import { ActiveParking } from '../../../../core/models/active-parking.model';
import { Vehicle } from '../../../../core/models/vehicle.model';
import { ParkingService } from '../../../../core/services/parking.service';

@Component({
  selector: 'app-parking-active-list-page',
  standalone: true,
  imports: [CommonModule, AsyncPipe, FormsModule],
  templateUrl: './parking-active-list-page.html',
  styleUrl: './parking-active-list-page.css',
})
export class ParkingActiveListPage {
  private readonly parking = inject(ParkingService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly activeParkings$ = this.parking.getActiveParkings$();
  readonly vehicles$ = this.parking.getVehicles$();

  // Combine to get both vehicles and active parkings
  readonly parkingData$: Observable<{
    vehicles: Vehicle[];
    activeParkings: ActiveParking[];
  }> = combineLatest([this.vehicles$, this.activeParkings$]).pipe(
    map(([vehicles, activeParkings]) => ({ vehicles, activeParkings }))
  );

  readonly totalActive$ = this.activeParkings$.pipe(map((parkings) => parkings.length));

  licenseToCheckout = '';
  message = '';
  error = '';
  isLoading = false;

  protected vehicleById(vehicles: Vehicle[], id: string): Vehicle | undefined {
    return vehicles.find((v) => v.id === id);
  }

  protected getDuration(checkInTime: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(checkInTime).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  }

  protected checkOut(license?: string | null): void {
    this.message = '';
    this.error = '';
    this.isLoading = true;

    const plate = (license ?? this.licenseToCheckout).trim();
    if (!plate) {
      this.error = 'Please enter license plate.';
      this.isLoading = false;
      return;
    }

    this.parking
      .checkOutByLicense(plate)
      .pipe(
        finalize(() => {
          console.log('[ActiveList] finalize called, setting isLoading = false');
          this.isLoading = false;
          this.cdr.detectChanges(); // Force change detection
        })
      )
      .subscribe({
        next: () => {
          console.log('[ActiveList] success');
          this.message = `Vehicle ${plate} checked out successfully.`;
          if (!license) {
            this.licenseToCheckout = '';
          }
        },
        error: (e: unknown) => {
          console.error('[ActiveList] error:', e);
          this.error =
            e instanceof Error ? e.message : `Vehicle with license plate "${plate}" not found.`;
        },
        complete: () => {
          console.log('[ActiveList] complete called');
        },
      });
  }
}
