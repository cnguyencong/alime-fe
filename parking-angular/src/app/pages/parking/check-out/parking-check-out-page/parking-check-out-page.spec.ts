import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingCheckOutPage } from './parking-check-out-page';

describe('ParkingCheckOutPage', () => {
  let component: ParkingCheckOutPage;
  let fixture: ComponentFixture<ParkingCheckOutPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingCheckOutPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingCheckOutPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
