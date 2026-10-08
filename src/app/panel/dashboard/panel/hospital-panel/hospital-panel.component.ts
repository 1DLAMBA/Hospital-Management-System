import { Component, OnInit } from '@angular/core';
import { HospitalsService } from '../../../../endpoints/hospitals.service';

@Component({
  selector: 'app-hospital-panel',
  templateUrl: './hospital-panel.component.html',
  styleUrl: './hospital-panel.component.css'
})
export class HospitalPanelComponent implements OnInit {
  hospital: any = null;
  doctors: any[] = [];
  nurses: any[] = [];
  otherProfessionals: any[] = [];
  loading: boolean = true;

  constructor(private hospitalsService: HospitalsService) {}

  ngOnInit(): void {
    this.hospitalsService.get().subscribe({
      next: (response: any) => {
        this.hospital = response.user;
      }
    });

    this.hospitalsService.getStaff().subscribe({
      next: (response: any) => {
        this.doctors = response.doctors || [];
        this.nurses = response.nurses || [];
        this.otherProfessionals = response.other_professionals || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get totalStaff(): number {
    return this.doctors.length + this.nurses.length + this.otherProfessionals.length;
  }

  get allStaff(): any[] {
    return [
      ...this.doctors.map((d) => ({ ...d, role: 'Doctor' })),
      ...this.nurses.map((n) => ({ ...n, role: 'Nurse' })),
      ...this.otherProfessionals.map((o) => ({ ...o, role: o.professional_type || 'Other Professional' })),
    ];
  }

}
