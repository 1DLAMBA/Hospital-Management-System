import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDoctorComponent } from './client-doctor.component';

describe('ClientDoctorComponent', () => {
  let component: ClientDoctorComponent;
  let fixture: ComponentFixture<ClientDoctorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientDoctorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ClientDoctorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
