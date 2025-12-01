import { Injectable } from '@angular/core';
import { from, map, Observable, switchMap, shareReplay, take, of } from 'rxjs';
import { supabase } from '../supabase.client';
import { ParkingSlot, VehicleType } from '../models/parking-slot.model';
import { Vehicle } from '../models/vehicle.model';
import { ActiveParking } from '../models/active-parking.model';
import {
  ParkingSlotRow,
  VehicleRow,
  ActiveParkingRow,
  ParkingSlotUpdate,
} from '../models/supabase-database.model';

@Injectable({
  providedIn: 'root',
})
export class ParkingService {
  constructor() {}

  /** Get slots list from Supabase using RxJS Observable */
  getSlots$(): Observable<ParkingSlot[]> {
    return from(supabase.from('parking_slots').select('*').order('id', { ascending: true })).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('getSlots error', error);
          return [];
        }

        return (
          data?.map((row: ParkingSlotRow) => ({
            id: row.id,
            zone: row.zone,
            type: row.type,
            status: row.status,
          })) ?? []
        );
      }),
      shareReplay(1) // Cache result and share subscription to avoid multiple API calls
    );
  }

  /** Get vehicles list from Supabase */
  getVehicles$(): Observable<Vehicle[]> {
    return from(
      supabase.from('vehicles').select('*').order('license_plate', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('getVehicles error', error);
          return [];
        }

        return (
          data?.map((row: VehicleRow) => ({
            id: row.id,
            licensePlate: row.license_plate,
            type: row.type,
          })) ?? []
        );
      }),
      shareReplay(1) // Cache result and share subscription
    );
  }

  /** Get active parkings list from Supabase */
  getActiveParkings$(): Observable<ActiveParking[]> {
    return from(
      supabase.from('active_parkings').select('*').order('check_in_time', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          console.error('getActiveParkings error', error);
          return [];
        }

        return (
          data?.map((row: ActiveParkingRow) => ({
            id: row.id,
            vehicleId: row.vehicle_id,
            slotId: row.slot_id,
            checkInTime: new Date(row.check_in_time),
          })) ?? []
        );
      }),
      shareReplay(1) // Cache result and share subscription
    );
  }

  /** Check-in vehicle into parking lot */
  checkIn(licensePlate: string, type: VehicleType): Observable<void> {
    const trimmedPlate = licensePlate.trim().toUpperCase();

    // 1. Check if vehicle already exists and is currently parked
    return this.getVehicles$().pipe(
      take(1), // Take only 1 value to ensure Observable completes
      switchMap((vehicles) => {
        const existingVehicle = vehicles.find((v) => v.licensePlate.toUpperCase() === trimmedPlate);

        // If vehicle exists, check if it's already parked
        if (existingVehicle) {
          return this.getActiveParkings$().pipe(
            take(1), // Take only 1 value to ensure Observable completes
            switchMap((activeParkings) => {
              const isAlreadyParked = activeParkings.some(
                (ap) => ap.vehicleId === existingVehicle.id
              );
              if (isAlreadyParked) {
                throw new Error(`Vehicle ${trimmedPlate} is already parked`);
              }

              // Vehicle exists but not parked, continue with this vehicle
              return this.processCheckIn(existingVehicle.id, type);
            })
          );
        }

        // Vehicle doesn't exist, create new and continue
        return from(
          supabase
            .from('vehicles')
            .insert({
              license_plate: trimmedPlate,
              type: type,
            })
            .select()
            .single()
        ).pipe(
          switchMap(({ data: vehicleData, error: vehicleError }) => {
            if (vehicleError) {
              console.error('createVehicle error', vehicleError);
              throw new Error(
                vehicleError.message || 'Cannot create vehicle. License plate may already exist.'
              );
            }

            if (!vehicleData) {
              throw new Error('Cannot create vehicle');
            }

            return this.processCheckIn(vehicleData.id, type);
          })
        );
      })
    );
  }

  /** Helper method to process check-in after having vehicle */
  private processCheckIn(vehicleId: string, type: VehicleType): Observable<void> {
    // 1. Find available slot matching type
    return this.getSlots$().pipe(
      take(1), // Take only 1 value to ensure Observable completes
      switchMap((slots) => {
        const availableSlot = slots.find((s) => s.status === 'empty' && s.type === type);
        if (!availableSlot) {
          throw new Error(`No available slot for ${type === 'car' ? 'car' : 'motorbike'}`);
        }

        // 2. Create active parking
        return from(
          supabase
            .from('active_parkings')
            .insert({
              vehicle_id: vehicleId,
              slot_id: availableSlot.id,
              check_in_time: new Date().toISOString(),
            })
            .select()
            .single()
        ).pipe(
          switchMap(({ data: parkingData, error: parkingError }) => {
            if (parkingError) {
              console.error('createActiveParking error', parkingError);
              throw new Error(
                parkingError.message || 'Cannot register parking. Slot may already be occupied.'
              );
            }

            if (!parkingData) {
              throw new Error('Cannot register parking');
            }

            // 3. Update slot status to occupied and add current_vehicle_id
            const updateData: ParkingSlotUpdate = {
              status: 'occupied',
              current_vehicle_id: vehicleId,
            };

            return from(
              supabase
                .from('parking_slots')
                .update(updateData)
                .eq('id', availableSlot.id)
                .select()
                .single()
            ).pipe(
              switchMap(({ data: updatedSlot, error: slotError }) => {
                if (slotError) {
                  console.error('updateSlotStatus error', slotError);
                  // TODO: rollback using RxJS for better practice
                  supabase
                    .from('active_parkings')
                    .delete()
                    .eq('id', parkingData.id)
                    .then(() => {
                      console.log('Rolled back active_parking due to slot update failure');
                    });

                  throw new Error(slotError.message || 'Cannot update slot status');
                }

                if (!updatedSlot) {
                  throw new Error('Cannot update slot status');
                }

                // Return Observable that emits and completes
                return of(undefined);
              })
            );
          })
        );
      })
    );
  }

  /** Check-out vehicle from parking lot */
  checkOutByLicense(licensePlate: string): Observable<void> {
    const normalized = licensePlate.trim().toUpperCase(); // Normalize same as checkIn

    return this.getVehicles$().pipe(
      take(1), // Take only 1 value to ensure Observable completes
      switchMap((vehicles) => {
        const vehicle = vehicles.find((v) => v.licensePlate.toUpperCase() === normalized);
        if (!vehicle) {
          throw new Error(`Vehicle with license plate "${normalized}" not found`);
        }

        // 2. Find active parking for this vehicle
        return this.getActiveParkings$().pipe(
          take(1), // Take only 1 value to ensure Observable completes
          switchMap((activeParkings) => {
            const active = activeParkings.find((a) => a.vehicleId === vehicle.id);
            if (!active) {
              throw new Error(`Vehicle "${normalized}" is not currently in the parking lot`);
            }

            // 3. Delete active parking
            return from(supabase.from('active_parkings').delete().eq('id', active.id)).pipe(
              switchMap(({ error: deleteError }) => {
                if (deleteError) {
                  console.error('deleteActiveParking error', deleteError);
                  throw new Error('Cannot delete parking information');
                }

                // 4. Update slot status to empty + clear current_vehicle_id
                return from(
                  supabase
                    .from('parking_slots')
                    .update({
                      status: 'empty',
                      current_vehicle_id: null, // Reset
                    })
                    .eq('id', active.slotId)
                    .select()
                    .single()
                ).pipe(
                  switchMap(({ data: updatedSlot, error: slotError }) => {
                    if (slotError) {
                      console.error('updateSlotStatus error', slotError);
                      throw new Error('Cannot update slot status');
                    }

                    if (!updatedSlot) {
                      throw new Error('Cannot update slot status');
                    }

                    // Return Observable that emits and completes
                    return of(undefined);
                  })
                );
              })
            );
          })
        );
      })
    );
  }
}
