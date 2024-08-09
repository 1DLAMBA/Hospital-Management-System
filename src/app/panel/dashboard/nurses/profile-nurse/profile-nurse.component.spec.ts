import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileNurseComponent } from './profile-nurse.component';

describe('ProfileNurseComponent', () => {
  let component: ProfileNurseComponent;
  let fixture: ComponentFixture<ProfileNurseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileNurseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfileNurseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
