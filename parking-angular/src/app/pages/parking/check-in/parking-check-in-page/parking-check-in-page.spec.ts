import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingCheckInPage } from './parking-check-in-page';

describe('ParkingCheckInPage', () => {
  let component: ParkingCheckInPage;
  let fixture: ComponentFixture<ParkingCheckInPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingCheckInPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingCheckInPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
