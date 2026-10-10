import { Component, OnInit } from '@angular/core';
import { HospitalsService } from '../../../../../endpoints/hospitals.service';
import { environment } from '../../../../../../environments/environment';

type RoleFilter = 'all' | 'doctor' | 'nurse' | 'other';

interface Professional {
  id: string;
  kind: Exclude<RoleFilter, 'all'>;
  role: string;
  name: string;
  email: string;
  phone: string;
  passport: string | null;
  specialization: string | null;
  licence: string | null;
  availability: 'available' | 'unavailable' | null;
}

@Component({
  selector: 'app-hospital-professionals',
  templateUrl: './hospital-professionals.component.html',
  styleUrl: './hospital-professionals.component.css'
})
export class HospitalProfessionalsComponent implements OnInit {
  professionals: Professional[] = [];
  visibleProfessionals: Professional[] = [];
  filter: RoleFilter = 'all';
  search = '';
  loading = true;
  failed = false;

  readonly avatarBase = environment.apiUrl + '/file/get/';
  readonly filters: { value: RoleFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'doctor', label: 'Doctors' },
    { value: 'nurse', label: 'Nurses' },
    { value: 'other', label: 'Other professionals' },
  ];

  constructor(private hospitalsService: HospitalsService) {}

  ngOnInit(): void {
    this.hospitalsService.getStaff().subscribe({
      next: (response: any) => {
        this.professionals = [
          ...(response.doctors || []).map((d: any) => this.toProfessional(d, 'doctor', 'Doctor')),
          ...(response.nurses || []).map((n: any) => this.toProfessional(n, 'nurse', 'Nurse')),
          ...(response.other_professionals || []).map((o: any) =>
            this.toProfessional(o, 'other', o.professional_type || 'Other professional')),
        ];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.failed = true;
        this.loading = false;
      },
    });
  }

  setFilter(value: RoleFilter): void {
    this.filter = value;
    this.applyFilters();
  }

  count(value: RoleFilter): number {
    return value === 'all'
      ? this.professionals.length
      : this.professionals.filter((p) => p.kind === value).length;
  }

  applyFilters(): void {
    const term = this.search.trim().toLowerCase();
    this.visibleProfessionals = this.professionals.filter((p) =>
      (this.filter === 'all' || p.kind === this.filter) &&
      (!term || [p.name, p.email, p.role, p.specialization, p.licence]
        .some((value) => value?.toLowerCase().includes(term))));
  }

  private toProfessional(record: any, kind: Professional['kind'], role: string): Professional {
    return {
      // Doctors, nurses and other professionals come from separate tables, so ids can collide.
      id: `${kind}-${record.id}`,
      kind,
      role,
      name: record.user?.name || 'Unnamed',
      email: record.user?.email || '',
      phone: record.user?.phoneno || '',
      passport: record.user?.passport || null,
      specialization: record.specialization || null,
      licence: record.license_number || null,
      availability: kind === 'doctor' ? (record.availability === '0' ? 'unavailable' : 'available') : null,
    };
  }
}
