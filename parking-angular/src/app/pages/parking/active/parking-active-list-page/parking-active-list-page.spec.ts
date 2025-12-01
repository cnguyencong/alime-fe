import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingActiveListPage } from './parking-active-list-page';

describe('ParkingActiveListPage', () => {
  let component: ParkingActiveListPage;
  let fixture: ComponentFixture<ParkingActiveListPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingActiveListPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingActiveListPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
